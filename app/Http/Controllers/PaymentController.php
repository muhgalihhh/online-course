<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\Enrollment;
use App\Services\MidtransService;
use App\Events\TransactionCompleted;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly MidtransService $midtrans)
    {
    }

    public function createCourseTransaction(Request $request, int $courseId): JsonResponse
    {
        $request->validate([
            'payment_method' => 'nullable|string',
        ]);

        $course = Course::query()->where('status', 'published')->findOrFail($courseId);
        $user = $request->user();

        Log::info('Payment transaction request', [
            'user_id' => $user->id,
            'course_id' => $courseId,
            'course_price' => $course->price,
            'is_pro' => $course->is_pro,
            'user_agent' => $request->userAgent(),
        ]);

        // Prevent free courses from being added to cart/payment
        if (!$course->is_pro || (int) $course->price <= 0) {
            Log::info('Attempt to pay for free course', [
                'user_id' => $user->id,
                'course_id' => $courseId,
            ]);

            return response()->json([
                'message' => 'Kursus ini gratis. Tidak memerlukan pembayaran.',
                'is_free' => true,
            ], 422);
        }

        // Check if user is already enrolled
        $alreadyEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();
        if ($alreadyEnrolled) {
            Log::info('User already enrolled in course', [
                'user_id' => $user->id,
                'course_id' => $courseId,
            ]);

            return response()->json([
                'message' => 'Anda sudah terdaftar di kursus ini.',
                'is_enrolled' => true,
            ], 409);
        }

        // Check if user has a completed transaction for this course
        $hasCompletedTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $courseId)
            ->where('transactionable_type', Course::class)
            ->where('status', 'completed')
            ->exists();

        if ($hasCompletedTransaction) {
            Log::info('User has completed transaction but not enrolled', [
                'user_id' => $user->id,
                'course_id' => $courseId,
            ]);

            return response()->json([
                'message' => 'Anda sudah membeli kursus ini. Silakan hubungi admin jika belum terdaftar.',
                'has_completed_transaction' => true,
            ], 409);
        }

        try {
            // Use improved MidtransService logic with real-time validation
            $result = $this->midtrans->createCourseTransaction($user, $course, $request->string('payment_method')->toString());

            // Check if transaction was expired and needs to be recreated
            if (isset($result['error']) && isset($result['expired_transaction'])) {
                Log::info('Previous transaction expired, user needs to create new one', [
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'expired_order_id' => $result['expired_transaction']->midtrans_order_id,
                ]);

                return response()->json([
                    'message' => $result['error'],
                    'transaction_expired' => true,
                    'can_retry' => true,
                ], 410); // 410 Gone - indicates resource expired
            }

            // Check for missing essential data
            if (empty($result['order_id']) || empty($result['snap_token'])) {
                throw new \Exception('Invalid response from Midtrans: missing order_id or snap_token');
            }

            Log::info('Transaction created/retrieved successfully', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'order_id' => $result['order_id'],
                'is_existing' => $result['is_existing'] ?? false,
                'snap_token_present' => !empty($result['snap_token'])
            ]);

            return response()->json([
                'order_id' => $result['order_id'],
                'snap_token' => $result['snap_token'],
                'redirect_url' => $result['redirect_url'],
                'client_key' => (string) config('midtrans.client_key'),
                'is_production' => (bool) config('midtrans.is_production'),
                'enabled_pay_button' => (bool) config('midtrans.enable_pay_button'),
                'existing_transaction' => $result['is_existing'] ?? false,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create transaction', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Gagal membuat transaksi. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function handleMidtransWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = (string) ($payload['order_id'] ?? '');

        Log::info('Midtrans webhook received', [
            'order_id' => $orderId,
            'transaction_status' => $payload['transaction_status'] ?? null,
            'payment_type' => $payload['payment_type'] ?? null,
            'fraud_status' => $payload['fraud_status'] ?? null,
        ]);

        $transaction = Transaction::query()->where('midtrans_order_id', $orderId)->first();
        if (!$transaction) {
            Log::warning('Midtrans order not found', ['order_id' => $orderId]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        $midtransStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? '');

        // Konsisten gunakan mapping dari service (expire => expired)
        $newStatus = $this->midtrans->mapMidtransStatusToLocal($midtransStatus, $fraudStatus);

        Log::info('Updating transaction status', [
            'order_id' => $orderId,
            'old_status' => $transaction->status,
            'new_status' => $newStatus,
            'midtrans_status' => $midtransStatus,
        ]);

        $details = $transaction->payment_details ?? [];
        $details['last_notification'] = $payload;
        $transaction->update([
            'status' => $newStatus,
            'payment_details' => $details,
            'payment_method' => $transaction->payment_method ?: ($payload['payment_type'] ?? null),
        ]);

        // Fire event and trigger immediate auto-enrollment when payment is completed
        if ($newStatus === 'completed') {
            Log::info('Payment completed via webhook, triggering auto-enrollment', [
                'order_id' => $orderId,
                'user_id' => $transaction->user_id,
                'course_id' => $transaction->transactionable_id,
            ]);

            // Refresh transaction to get latest data
            $transaction->refresh();

            // Trigger immediate auto-enrollment - CRITICAL for webhook flow
            $this->autoEnrollUserToCourse($transaction);

            // Fire event for any additional listeners/jobs
            TransactionCompleted::dispatch($transaction);
        }

        return response()->json(['message' => 'OK']);
    }

    // Mapping status dipindahkan ke MidtransService::mapMidtransStatusToLocal

    /**
     * Show payment page with embedded Midtrans Snap
     */
    public function showPaymentPage(Request $request, int $courseId): Response|RedirectResponse
    {
        $course = Course::with(['category', 'institution'])
            ->where('status', 'published')
            ->findOrFail($courseId);

        // Ensure thumbnail attribute is included
        $course->append('thumbnail');

        $user = $request->user();

        // Check if course is free - redirect to show page
        if (!$course->is_pro || (int) $course->price <= 0) {
            return redirect()->route('courses.show', $courseId)
                ->with('error', 'Kursus ini gratis. Tidak memerlukan pembayaran.');
        }

        // Check if already enrolled (payment completed)
        $alreadyEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();
        if ($alreadyEnrolled) {
            return redirect()->route('courses.learn', $courseId)
                ->with('success', 'Anda sudah terdaftar di kursus ini.');
        }

        // Check if user has completed transaction
        $completedTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $courseId)
            ->where('transactionable_type', Course::class)
            ->where('status', 'completed')
            ->first();

        if ($completedTransaction) {
            // Trigger auto-enrollment if not enrolled yet
            $this->autoEnrollUserToCourse($completedTransaction);

            // Check enrollment again after auto-enrollment
            $alreadyEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();

            if ($alreadyEnrolled) {
                return redirect()->route('courses.learn', $courseId)
                    ->with('success', 'Anda sudah terdaftar di kursus ini.');
            }

            // Show payment success page with enrollment in progress
            return Inertia::render('payment/index', [
                'course' => $course,
                'transaction' => $completedTransaction,
                'snapToken' => null,
                'clientKey' => (string) config('midtrans.client_key'),
                'isProduction' => (bool) config('midtrans.is_production'),
                'isAlreadyPaid' => true,
                'isAlreadyEnrolled' => false,
            ]);
        }

        // Use improved MidtransService to get/create transaction
        try {
            $result = $this->midtrans->createCourseTransaction($user, $course);

            // Handle expired transaction case
            if (isset($result['error']) && isset($result['expired_transaction'])) {
                Log::info('Showing expired transaction page', [
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'expired_order_id' => $result['expired_transaction']->midtrans_order_id,
                ]);

                return Inertia::render('payment/index', [
                    'course' => $course,
                    'transaction' => null,
                    'snapToken' => null,
                    'clientKey' => (string) config('midtrans.client_key'),
                    'isProduction' => (bool) config('midtrans.is_production'),
                    'isAlreadyEnrolled' => false,
                    'transactionExpired' => true,
                    'expiredMessage' => $result['error'],
                ]);
            }

            // Valid transaction found or created
            if (!empty($result['order_id']) && !empty($result['snap_token'])) {
                Log::info('Showing payment page with valid transaction', [
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'order_id' => $result['order_id'],
                    'is_existing' => $result['is_existing'] ?? false,
                ]);

                return Inertia::render('payment/index', [
                    'course' => $course,
                    'transaction' => $result['transaction'],
                    'snapToken' => $result['snap_token'],
                    'clientKey' => (string) config('midtrans.client_key'),
                    'isProduction' => (bool) config('midtrans.is_production'),
                    'isAlreadyEnrolled' => false,
                    'transactionExpired' => false,
                ]);
            }

            // Fallback - something went wrong, show page without transaction
            throw new \Exception('No valid transaction could be created or found');

        } catch (\Exception $e) {
            Log::error('Error in showPaymentPage', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'error' => $e->getMessage()
            ]);

            return Inertia::render('payment/index', [
                'course' => $course,
                'transaction' => null,
                'snapToken' => null,
                'clientKey' => (string) config('midtrans.client_key'),
                'isProduction' => (bool) config('midtrans.is_production'),
                'isAlreadyEnrolled' => false,
                'transactionExpired' => false,
                'error' => 'Gagal memuat halaman pembayaran. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Get user transactions
     */
    public function getUserTransactions(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('getUserTransactions: No authenticated user found');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Prevent admin from accessing user transactions/cart
        if ($user->isAdmin()) {
            Log::warning('getUserTransactions: Admin tried to access user transactions', ['user_id' => $user->id]);
            return response()->json([
                'error' => 'Admin tidak diperbolehkan mengakses keranjang atau transaksi.',
                'message' => 'Access denied for admin users'
            ], 403);
        }

        Log::info('getUserTransactions: Loading transactions for user', ['user_id' => $user->id]);

        $transactions = Transaction::with(['transactionable'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                // Check and update transaction status from Midtrans for pending transactions
                if (in_array($transaction->status, ['pending', 'processing'])) {
                    $statusInfo = $this->midtrans->getTransactionStatus($transaction->midtrans_order_id);
                    if ($statusInfo) {
                        $transaction->status = $statusInfo['status'];
                    }
                }

                // Add course details if transactionable is a course
                if ($transaction->transactionable_type === Course::class) {
                    $transaction->course = $transaction->transactionable;
                }
                return $transaction;
            });

        Log::info('getUserTransactions: Found transactions', [
            'count' => $transactions->count(),
            'transaction_ids' => $transactions->pluck('id')->toArray()
        ]);

        return response()->json($transactions);
    }

    /**
     * Show transaction detail page
     */
    public function showTransaction(Request $request, string $orderId): Response|RedirectResponse
    {
        $user = $request->user();

        $transaction = Transaction::with(['transactionable'])
            ->where('midtrans_order_id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // If transaction is for a course, redirect to payment page
        if ($transaction->transactionable_type === Course::class) {
            return redirect()->route('payments.show', $transaction->transactionable_id);
        }

        // For other types, show generic transaction page
        return Inertia::render('payment/transaction', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Cancel/delete a pending transaction
     */
    public function cancelTransaction(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();

        $transaction = Transaction::where('midtrans_order_id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Only allow cancellation of pending/processing/expired transactions
        if (!in_array($transaction->status, ['pending', 'processing', 'expired'])) {
            return response()->json([
                'message' => 'Transaksi ini tidak dapat dibatalkan.',
            ], 422);
        }

        // Try to cancel in Midtrans first
        try {
            $this->midtrans->cancelTransaction($orderId);
        } catch (\Exception $e) {
            // Log but don't fail the request
            Log::warning('Failed to cancel transaction in Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);
        }

        // Delete the transaction record completely to allow new transaction
        $transaction->delete();

        return response()->json([
            'message' => 'Transaksi berhasil dihapus. Anda dapat membuat transaksi baru.',
            'deleted' => true,
        ]);
    }

    /**
     * Check transaction status from Midtrans
     */
    public function checkTransactionStatus(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();

        $transaction = Transaction::where('midtrans_order_id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Get status from Midtrans
        $statusInfo = $this->midtrans->getTransactionStatus($orderId);

        if (!$statusInfo) {
            return response()->json([
                'message' => 'Tidak dapat mengecek status transaksi',
                'status' => $transaction->status,
            ], 500);
        }

        return response()->json([
            'order_id' => $orderId,
            'status' => $statusInfo['status'],
            'midtrans_status' => $statusInfo['midtrans_status'],
            'payment_type' => $statusInfo['payment_type'],
            'transaction_time' => $statusInfo['transaction_time'],
            'is_expired' => in_array($statusInfo['status'], ['expired', 'cancelled', 'failed']),
        ]);
    }

    /**
     * Refresh snap token for existing transaction
     */
    public function refreshSnapToken(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();

        $transaction = Transaction::where('midtrans_order_id', $orderId)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing', 'expired'])
            ->first();

        if (!$transaction) {
            return response()->json([
                'message' => 'Transaksi tidak ditemukan atau sudah tidak berlaku.',
            ], 404);
        }

        // Check if transaction is for a course
        if ($transaction->transactionable_type !== Course::class) {
            return response()->json([
                'message' => 'Jenis transaksi tidak didukung.',
            ], 422);
        }

        $course = $transaction->transactionable;

        // Reuse logic: jika masih pending & punya snap_token -> return existing
        // Jika pending tapi tidak ada snap_token -> minta user batalkan manual
        // Jika status final (expired/cancelled/failed) -> buat baru
        // Jika completed -> tidak boleh refresh

        if (in_array($transaction->status, ['completed'])) {
            return response()->json([
                'message' => 'Transaksi sudah selesai. Tidak perlu memperbarui token.',
            ], 409);
        }

        if (in_array($transaction->status, ['pending', 'processing'])) {
            $snapToken = $transaction->payment_details['snap_token'] ?? null;
            if ($snapToken) {
                return response()->json([
                    'message' => 'Menggunakan token lama yang masih valid.',
                    'snap_token' => $snapToken,
                    'order_id' => $transaction->midtrans_order_id,
                    'transaction' => $transaction,
                    'is_existing' => true,
                    'redirect_url' => $transaction->payment_details['redirect_url'] ?? null,
                ]);
            }

            return response()->json([
                'message' => 'Transaksi masih pending namun token tidak ditemukan. Silakan batalkan dan buat transaksi baru.',
                'need_cancel' => true,
            ], 422);
        }

        // Status final -> buat transaksi baru
        try {
            $newData = $this->midtrans->createCourseTransaction($user, $course);
            return response()->json([
                'message' => 'Token baru berhasil dibuat.',
                'snap_token' => $newData['snap_token'],
                'order_id' => $newData['order_id'],
                'transaction' => $newData['transaction'],
                'is_existing' => false,
                'redirect_url' => $newData['redirect_url'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create new transaction on refresh', [
                'old_order_id' => $orderId,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal membuat token baru. Coba lagi nanti.',
            ], 500);
        }
    }

    /**
     * Verify payment status with Midtrans and trigger enrollment
     * This endpoint is called from frontend after payment success
     */
    public function verifyPaymentAndEnroll(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();

        Log::info('Frontend callback: verify payment and enroll', [
            'order_id' => $orderId,
            'user_id' => $user->id,
        ]);

        // Find transaction
        $transaction = Transaction::where('midtrans_order_id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$transaction) {
            Log::warning('Transaction not found for verify-enroll', ['order_id' => $orderId]);
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan.',
            ], 404);
        }

        // Get real-time status from Midtrans
        try {
            $statusInfo = $this->midtrans->getTransactionStatus($orderId);

            if ($statusInfo) {
                $newStatus = $statusInfo['status'];

                // Update transaction status if changed
                if ($transaction->status !== $newStatus) {
                    Log::info('Updating transaction status from Midtrans API', [
                        'order_id' => $orderId,
                        'old_status' => $transaction->status,
                        'new_status' => $newStatus,
                    ]);

                    $details = $transaction->payment_details ?? [];
                    $details['frontend_verification'] = [
                        'verified_at' => now()->toISOString(),
                        'midtrans_response' => $statusInfo,
                    ];

                    $transaction->update([
                        'status' => $newStatus,
                        'payment_details' => $details,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to verify status with Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);
        }

        // Reload transaction to get updated status
        $transaction->refresh();

        // Check if payment is completed
        if ($transaction->status === 'completed') {
            Log::info('Payment verified as completed, triggering enrollment', [
                'order_id' => $orderId,
                'user_id' => $user->id,
            ]);

            // Trigger auto-enrollment
            $this->autoEnrollUserToCourse($transaction);

            // Check if enrollment was successful
            if ($transaction->isCourseTransaction()) {
                $courseId = $transaction->transactionable_id;
                $isEnrolled = $user->isEnrolledIn($courseId);

                if ($isEnrolled) {
                    return response()->json([
                        'success' => true,
                        'enrolled' => true,
                        'message' => 'Pembayaran berhasil dan Anda telah terdaftar di kursus.',
                        'redirect_url' => route('courses.learn', $courseId),
                    ]);
                } else {
                    // Enrollment failed, but payment completed
                    Log::error('Enrollment failed despite completed payment', [
                        'order_id' => $orderId,
                        'user_id' => $user->id,
                        'course_id' => $courseId,
                    ]);

                    return response()->json([
                        'success' => true,
                        'enrolled' => false,
                        'message' => 'Pembayaran berhasil, namun proses pendaftaran mengalami kendala. Silakan hubungi admin atau refresh halaman.',
                        'payment_completed' => true,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'enrolled' => false,
                'message' => 'Pembayaran berhasil diverifikasi.',
            ]);
        }

        // Payment not completed yet
        return response()->json([
            'success' => false,
            'enrolled' => false,
            'status' => $transaction->status,
            'message' => 'Pembayaran belum selesai. Status: ' . $transaction->status,
        ]);
    }

    /**
     * Automatically enroll user to course after successful payment
     */
    public function autoEnrollUserToCourse(Transaction $transaction): void
    {
        try {
            if (!$transaction->isCourseTransaction()) {
                return;
            }

            $courseId = $transaction->transactionable_id;
            $user = $transaction->user;

            if (!$user) {
                Log::warning('User not found for transaction', [
                    'transaction_id' => $transaction->id,
                    'order_id' => $transaction->midtrans_order_id
                ]);
                return;
            }

            // Check if user is already enrolled using the new method
            if ($user->isEnrolledIn($courseId)) {
                Log::info('User already enrolled in course', [
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'transaction_id' => $transaction->id
                ]);
                return;
            }

            // Create (or fetch existing) enrollment with database transaction for consistency & idempotency
            DB::transaction(function () use ($user, $courseId, $transaction) {
                $enrollment = Enrollment::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'course_id' => $courseId,
                    ],
                    [
                        'enrolled_at' => now(),
                        'progress' => 0,
                    ]
                );

                Log::info('User auto-enroll processed after payment', [
                    'enrollment_id' => $enrollment->id,
                    'was_recently_created' => $enrollment->wasRecentlyCreated,
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'transaction_id' => $transaction->id,
                    'order_id' => $transaction->midtrans_order_id
                ]);
            });

        } catch (\Exception $e) {
            Log::error('Failed to auto-enroll user after payment', [
                'transaction_id' => $transaction->id,
                'order_id' => $transaction->midtrans_order_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw the exception so caller knows it failed
            throw $e;
        }
    }
}
