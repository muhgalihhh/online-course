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

        // Prevent free courses from being added to cart/payment
        if (!$course->is_pro || (int) $course->price <= 0) {
            return response()->json([
                'message' => 'Kursus ini gratis. Tidak memerlukan pembayaran.',
                'is_free' => true,
            ], 422);
        }

        // Check if user is already enrolled
        $alreadyEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();
        if ($alreadyEnrolled) {
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
            return response()->json([
                'message' => 'Anda sudah membeli kursus ini. Silakan hubungi admin jika belum terdaftar.',
                'has_completed_transaction' => true,
            ], 409);
        }

        // Check for existing pending transaction
        $existingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $courseId)
            ->where('transactionable_type', Course::class)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        if ($existingTransaction) {
            // Check actual status from Midtrans
            $statusInfo = $this->midtrans->getTransactionStatus($existingTransaction->midtrans_order_id);

            // If transaction is expired or cancelled, allow creating new one
            if ($statusInfo && in_array($statusInfo['status'], ['expired', 'cancelled', 'failed'])) {
                // Mark old transaction as expired/cancelled
                $existingTransaction->update(['status' => $statusInfo['status']]);
            } else {
                // Transaction still valid, return existing token
                return response()->json([
                    'order_id' => $existingTransaction->midtrans_order_id,
                    'snap_token' => $existingTransaction->payment_details['snap_token'] ?? null,
                    'redirect_url' => $existingTransaction->payment_details['redirect_url'] ?? null,
                    'client_key' => (string) config('midtrans.client_key'),
                    'is_production' => (bool) config('midtrans.is_production'),
                    'enabled_pay_button' => (bool) config('midtrans.enable_pay_button'),
                    'existing_transaction' => true,
                ]);
            }
        }

        $result = $this->midtrans->createCourseTransaction($user, $course, $request->string('payment_method')->toString());

        return response()->json([
            'order_id' => $result['order_id'],
            'snap_token' => $result['snap_token'],
            'redirect_url' => $result['redirect_url'],
            'client_key' => (string) config('midtrans.client_key'),
            'is_production' => (bool) config('midtrans.is_production'),
            'enabled_pay_button' => (bool) config('midtrans.enable_pay_button'),
        ]);
    }

    public function handleMidtransWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = (string) ($payload['order_id'] ?? '');

        $transaction = Transaction::query()->where('midtrans_order_id', $orderId)->first();
        if (!$transaction) {
            Log::warning('Midtrans order not found', ['order_id' => $orderId]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        $midtransStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? '');

        $newStatus = $this->mapMidtransStatusToLocal($midtransStatus, $fraudStatus);

        $details = $transaction->payment_details ?? [];
        $details['last_notification'] = $payload;
        $transaction->update([
            'status' => $newStatus,
            'payment_details' => $details,
            'payment_method' => $transaction->payment_method ?: ($payload['payment_type'] ?? null),
        ]);

        // Fire event and trigger immediate auto-enrollment when payment is completed
        if ($newStatus === 'completed') {
            // Fire event for any listeners
            TransactionCompleted::dispatch($transaction);

            // Also trigger immediate auto-enrollment to ensure user gets enrolled right away
            $this->autoEnrollUserToCourse($transaction);
        }

        return response()->json(['message' => 'OK']);
    }

    private function mapMidtransStatusToLocal(string $transactionStatus, string $fraudStatus): string
    {
        return match ($transactionStatus) {
            'capture' => $fraudStatus === 'challenge' ? 'pending' : 'completed',
            'settlement' => 'completed',
            'pending' => 'pending',
            'deny' => 'failed',
            'expire' => 'failed',
            'cancel' => 'cancelled',
            default => 'pending',
        };
    }

    /**
     * Show payment page with embedded Midtrans Snap
     */
    public function showPaymentPage(Request $request, int $courseId): Response|RedirectResponse
    {
        $course = Course::with(['category', 'institution'])
            ->where('status', 'published')
            ->findOrFail($courseId);

        $user = $request->user();

        // Check if course is free - redirect to show page
        if (!$course->is_pro || (int) $course->price <= 0) {
            return redirect()->route('courses.show', $courseId)
                ->with('error', 'Kursus ini gratis. Tidak memerlukan pembayaran.');
        }

        // Check if already enrolled (payment completed)
        $alreadyEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();
        if ($alreadyEnrolled) {
            // Redirect to course learning page instead of showing payment
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

        // Check for existing pending transaction
        $existingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $courseId)
            ->where('transactionable_type', Course::class)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        $snapToken = null;
        $transactionExpired = false;

        if ($existingTransaction) {
            // Check actual status from Midtrans
            $statusInfo = $this->midtrans->getTransactionStatus($existingTransaction->midtrans_order_id);

            if ($statusInfo && in_array($statusInfo['status'], ['expired', 'cancelled', 'failed'])) {
                // Transaction expired or failed
                $transactionExpired = true;
                $existingTransaction = null;
            } else {
                // Get snap token for existing transaction
                try {
                    $snapToken = $this->midtrans->getSnapToken($existingTransaction->midtrans_order_id);
                    if (!$snapToken) {
                        // Can't get token, mark as expired
                        $transactionExpired = true;
                        $existingTransaction = null;
                    }
                } catch (\Exception $e) {
                    // If can't get token, mark as expired
                    $transactionExpired = true;
                    $existingTransaction = null;
                }
            }
        }

        return Inertia::render('payment/index', [
            'course' => $course,
            'transaction' => $existingTransaction,
            'snapToken' => $snapToken,
            'clientKey' => (string) config('midtrans.client_key'),
            'isProduction' => (bool) config('midtrans.is_production'),
            'isAlreadyEnrolled' => false,
            'transactionExpired' => $transactionExpired,
        ]);
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
        }
    }
}
