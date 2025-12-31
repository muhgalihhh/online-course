<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\Enrollment;
use App\Services\MidtransService;
use App\Services\FlipService;
use App\Services\PaymentGatewayManager;
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
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly FlipService $flip,
        private readonly PaymentGatewayManager $gatewayManager
    ) {
    }

    /**
     * Get current default gateway
     */
    private function getDefaultGateway(): string
    {
        return $this->gatewayManager->getDefaultGateway();
    }

    /**
     * Create transaction for course purchase
     */
    public function createCourseTransaction(Request $request, int $courseId): JsonResponse
    {
        $request->validate([
            'payment_method' => 'nullable|string',
            'gateway' => 'nullable|string|in:midtrans,flip',
        ]);

        $course = Course::query()->where('status', 'published')->findOrFail($courseId);
        $user = $request->user();
        $gateway = $request->input('gateway', $this->getDefaultGateway());

        Log::info('Payment transaction request', [
            'user_id' => $user->id,
            'course_id' => $courseId,
            'course_price' => $course->price,
            'is_pro' => $course->is_pro,
            'gateway' => $gateway,
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
            // Use the appropriate gateway
            if ($gateway === 'flip') {
                return $this->createFlipTransaction($user, $course);
            }

            return $this->createMidtransTransaction($user, $course, $request->string('payment_method')->toString());

        } catch (\Exception $e) {
            Log::error('Failed to create transaction', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'gateway' => $gateway,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Gagal membuat transaksi. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Create Midtrans transaction
     */
    private function createMidtransTransaction($user, Course $course, ?string $paymentMethod): JsonResponse
    {
        $result = $this->midtrans->createCourseTransaction($user, $course, $paymentMethod);

        // Check if transaction was expired and needs to be recreated
        if (isset($result['error']) && isset($result['expired_transaction'])) {
            Log::info('Previous transaction expired, user needs to create new one', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'expired_order_id' => $result['expired_transaction']->midtrans_order_id,
            ]);

            return response()->json([
                'message' => $result['error'],
                'transaction_expired' => true,
                'can_retry' => true,
            ], 410);
        }

        // Check for missing essential data
        if (empty($result['order_id']) || empty($result['snap_token'])) {
            throw new \Exception('Invalid response from Midtrans: missing order_id or snap_token');
        }

        Log::info('Midtrans transaction created/retrieved successfully', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'order_id' => $result['order_id'],
            'is_existing' => $result['is_existing'] ?? false,
            'snap_token_present' => !empty($result['snap_token'])
        ]);

        return response()->json([
            'gateway' => 'midtrans',
            'order_id' => $result['order_id'],
            'snap_token' => $result['snap_token'],
            'redirect_url' => $result['redirect_url'],
            'client_key' => (string) config('midtrans.client_key'),
            'is_production' => (bool) config('midtrans.is_production'),
            'enabled_pay_button' => (bool) config('midtrans.enable_pay_button'),
            'existing_transaction' => $result['is_existing'] ?? false,
        ]);
    }

    /**
     * Create Flip transaction
     */
    private function createFlipTransaction($user, Course $course): JsonResponse
    {
        $result = $this->flip->createCourseTransaction($user, $course);

        if (empty($result['payment_url'])) {
            throw new \Exception('Invalid response from Flip: missing payment_url');
        }

        Log::info('Flip transaction created/retrieved successfully', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'bill_id' => $result['bill_id'],
            'is_existing' => $result['is_existing'] ?? false,
        ]);

        return response()->json([
            'gateway' => 'flip',
            'bill_id' => $result['bill_id'],
            'payment_url' => $result['payment_url'],
            'transaction' => $result['transaction'],
            'existing_transaction' => $result['is_existing'] ?? false,
        ]);
    }

    /**
     * Handle Midtrans webhook
     */
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
            $this->handlePaymentCompleted($transaction, $orderId);
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Handle Flip webhook
     */
    public function handleFlipWebhook(Request $request): JsonResponse
    {
        $payload = $request->input('flip_payload', $request->all());

        Log::info('Flip webhook processing', [
            'payload' => $payload,
        ]);

        $transaction = $this->flip->processWebhook($payload);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // Fire event and trigger immediate auto-enrollment when payment is completed
        if ($transaction->status === 'completed') {
            $this->handlePaymentCompleted($transaction, $transaction->flip_bill_id);
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Handle Flip payment callback (redirect from Flip after payment)
     */
    public function handleFlipCallback(Request $request): RedirectResponse
    {
        $billId = $request->query('bill_link_id') ?? $request->query('id');
        $courseId = $request->query('course_id');
        $user = $request->user();

        Log::info('Flip callback received', [
            'bill_id' => $billId,
            'course_id' => $courseId,
            'user_id' => $user?->id,
            'all_query' => $request->query(),
        ]);

        $transaction = null;
        $paymentCompleted = false;

        if ($billId) {
            // Check bill status from Flip API
            $statusInfo = $this->flip->getTransactionStatus($billId);

            Log::info('Flip callback - bill status check', [
                'bill_id' => $billId,
                'status_info' => $statusInfo,
            ]);

            // Find the transaction
            $transaction = Transaction::where('flip_bill_id', $billId)->first();

            if ($transaction) {
                // If status is completed (either from API check or already in DB)
                if ($statusInfo && $statusInfo['status'] === 'completed') {
                    $paymentCompleted = true;
                    $this->handlePaymentCompleted($transaction, $billId);
                } elseif ($transaction->status === 'completed') {
                    $paymentCompleted = true;
                    // Trigger enrollment if not already done
                    $this->autoEnrollUserToCourse($transaction);
                }
            }
        }

        // Determine redirect based on payment status
        if ($user) {
            // Get course ID from transaction if not in query
            if (!$courseId && $transaction && $transaction->transactionable_type === Course::class) {
                $courseId = $transaction->transactionable_id;
            }

            if ($courseId) {
                // Check if user is enrolled
                $isEnrolled = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $courseId)
                    ->exists();

                if ($isEnrolled) {
                    Log::info('Flip callback - user enrolled, redirecting to learn page', [
                        'user_id' => $user->id,
                        'course_id' => $courseId,
                    ]);

                    return redirect()->route('courses.learn', $courseId)
                        ->with('success', 'Pembayaran berhasil! Anda sudah terdaftar di kursus.');
                }

                // Payment completed but not enrolled yet - try to enroll again
                if ($paymentCompleted && $transaction) {
                    Log::info('Flip callback - payment completed but not enrolled, retrying enrollment', [
                        'user_id' => $user->id,
                        'course_id' => $courseId,
                        'transaction_id' => $transaction->id,
                    ]);

                    $this->autoEnrollUserToCourse($transaction);

                    // Check enrollment again
                    $isEnrolled = Enrollment::where('user_id', $user->id)
                        ->where('course_id', $courseId)
                        ->exists();

                    if ($isEnrolled) {
                        return redirect()->route('courses.learn', $courseId)
                            ->with('success', 'Pembayaran berhasil! Anda sudah terdaftar di kursus.');
                    }
                }

                // Redirect to payment page to show status
                return redirect()->route('payments.show', $courseId)
                    ->with($paymentCompleted ? 'success' : 'info',
                        $paymentCompleted
                            ? 'Pembayaran berhasil! Memproses pendaftaran kursus...'
                            : 'Memproses pembayaran...');
            }
        }

        return redirect()->route('home');
    }

    /**
     * Common handler for payment completion
     */
    private function handlePaymentCompleted(Transaction $transaction, string $orderId): void
    {
        Log::info('Payment completed, triggering auto-enrollment', [
            'order_id' => $orderId,
            'user_id' => $transaction->user_id,
            'course_id' => $transaction->transactionable_id,
            'gateway' => $transaction->payment_gateway,
        ]);

        // Refresh transaction to get latest data
        $transaction->refresh();

        // Trigger immediate auto-enrollment
        $this->autoEnrollUserToCourse($transaction);

        // Fire event for any additional listeners/jobs
        TransactionCompleted::dispatch($transaction);
    }

    /**
     * Show payment page with embedded Midtrans Snap or Flip redirect
     */
    public function showPaymentPage(Request $request, int $courseId): Response|RedirectResponse
    {
        $course = Course::with(['category', 'institution'])
            ->where('status', 'published')
            ->findOrFail($courseId);

        // Ensure thumbnail attribute is included
        $course->append('thumbnail');

        $user = $request->user();
        $defaultGateway = $this->getDefaultGateway();

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
                'paymentUrl' => null,
                'clientKey' => (string) config('midtrans.client_key'),
                'isProduction' => (bool) config('midtrans.is_production'),
                'isAlreadyPaid' => true,
                'isAlreadyEnrolled' => false,
                'defaultGateway' => $defaultGateway,
            ]);
        }

        // Check for existing pending transaction
        $pendingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $courseId)
            ->where('transactionable_type', Course::class)
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->first();

        // Handle based on gateway
        if ($defaultGateway === 'flip') {
            return $this->showFlipPaymentPage($request, $course, $user, $pendingTransaction);
        }

        return $this->showMidtransPaymentPage($request, $course, $user, $pendingTransaction);
    }

    /**
     * Show Midtrans payment page
     */
    private function showMidtransPaymentPage(Request $request, Course $course, $user, ?Transaction $pendingTransaction): Response
    {
        try {
            $result = $this->midtrans->createCourseTransaction($user, $course);

            // Handle expired transaction case
            if (isset($result['error']) && isset($result['expired_transaction'])) {
                Log::info('Showing expired transaction page', [
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'expired_order_id' => $result['expired_transaction']->midtrans_order_id,
                ]);

                return Inertia::render('payment/index', [
                    'course' => $course,
                    'transaction' => null,
                    'snapToken' => null,
                    'paymentUrl' => null,
                    'clientKey' => (string) config('midtrans.client_key'),
                    'isProduction' => (bool) config('midtrans.is_production'),
                    'isAlreadyEnrolled' => false,
                    'transactionExpired' => true,
                    'expiredMessage' => $result['error'],
                    'defaultGateway' => 'midtrans',
                ]);
            }

            // Valid transaction found or created
            if (!empty($result['order_id']) && !empty($result['snap_token'])) {
                Log::info('Showing payment page with valid transaction', [
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'order_id' => $result['order_id'],
                    'is_existing' => $result['is_existing'] ?? false,
                ]);

                return Inertia::render('payment/index', [
                    'course' => $course,
                    'transaction' => $result['transaction'],
                    'snapToken' => $result['snap_token'],
                    'paymentUrl' => null,
                    'clientKey' => (string) config('midtrans.client_key'),
                    'isProduction' => (bool) config('midtrans.is_production'),
                    'isAlreadyEnrolled' => false,
                    'transactionExpired' => false,
                    'defaultGateway' => 'midtrans',
                ]);
            }

            // Fallback - something went wrong
            throw new \Exception('No valid transaction could be created or found');

        } catch (\Exception $e) {
            Log::error('Error in showMidtransPaymentPage', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);

            return Inertia::render('payment/index', [
                'course' => $course,
                'transaction' => null,
                'snapToken' => null,
                'paymentUrl' => null,
                'clientKey' => (string) config('midtrans.client_key'),
                'isProduction' => (bool) config('midtrans.is_production'),
                'isAlreadyEnrolled' => false,
                'transactionExpired' => false,
                'error' => 'Gagal memuat halaman pembayaran. Silakan coba lagi.',
                'defaultGateway' => 'midtrans',
            ]);
        }
    }

    /**
     * Show Flip payment page
     */
    private function showFlipPaymentPage(Request $request, Course $course, $user, ?Transaction $pendingTransaction): Response|RedirectResponse
    {
        try {
            $result = $this->flip->createCourseTransaction($user, $course);

            Log::info('Showing Flip payment page', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'bill_id' => $result['bill_id'],
                'is_existing' => $result['is_existing'] ?? false,
                'is_completed' => $result['is_completed'] ?? false,
            ]);

            // Handle case when transaction is already completed
            if ($result['is_completed'] ?? false) {
                // Trigger auto-enrollment
                $this->autoEnrollUserToCourse($result['transaction']);

                // Check if user is now enrolled
                $isEnrolled = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->exists();

                if ($isEnrolled) {
                    return redirect()->route('courses.learn', $course->id)
                        ->with('success', 'Pembayaran sudah selesai! Anda sudah terdaftar di kursus.');
                }

                // Payment completed but enrollment might still be processing
                return Inertia::render('payment/index', [
                    'course' => $course,
                    'transaction' => $result['transaction'],
                    'snapToken' => null,
                    'paymentUrl' => null,
                    'billId' => $result['bill_id'],
                    'clientKey' => null,
                    'isProduction' => (bool) config('flip.is_production'),
                    'isAlreadyEnrolled' => false,
                    'isAlreadyPaid' => true,
                    'transactionExpired' => false,
                    'defaultGateway' => 'flip',
                ]);
            }

            return Inertia::render('payment/index', [
                'course' => $course,
                'transaction' => $result['transaction'],
                'snapToken' => null,
                'paymentUrl' => $result['payment_url'],
                'billId' => $result['bill_id'],
                'clientKey' => null,
                'isProduction' => (bool) config('flip.is_production'),
                'isAlreadyEnrolled' => false,
                'transactionExpired' => false,
                'defaultGateway' => 'flip',
            ]);

        } catch (\Exception $e) {
            Log::error('Error in showFlipPaymentPage', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);

            return Inertia::render('payment/index', [
                'course' => $course,
                'transaction' => null,
                'snapToken' => null,
                'paymentUrl' => null,
                'clientKey' => null,
                'isProduction' => (bool) config('flip.is_production'),
                'isAlreadyEnrolled' => false,
                'transactionExpired' => false,
                'error' => 'Gagal memuat halaman pembayaran. Silakan coba lagi.',
                'defaultGateway' => 'flip',
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
                // Check and update transaction status based on gateway
                if (in_array($transaction->status, ['pending', 'processing'])) {
                    if ($transaction->payment_gateway === 'flip' && $transaction->flip_bill_id) {
                        $statusInfo = $this->flip->getTransactionStatus($transaction->flip_bill_id);
                        if ($statusInfo) {
                            $transaction->status = $statusInfo['status'];
                        }
                    } elseif ($transaction->midtrans_order_id) {
                        $statusInfo = $this->midtrans->getTransactionStatus($transaction->midtrans_order_id);
                        if ($statusInfo) {
                            $transaction->status = $statusInfo['status'];
                        }
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

        // Try to find by midtrans_order_id first, then by flip_bill_id
        $transaction = Transaction::with(['transactionable'])
            ->where(function ($query) use ($orderId) {
                $query->where('midtrans_order_id', $orderId)
                    ->orWhere('flip_bill_id', $orderId);
            })
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

        // Try to find by midtrans_order_id first, then by flip_bill_id
        $transaction = Transaction::where(function ($query) use ($orderId) {
                $query->where('midtrans_order_id', $orderId)
                    ->orWhere('flip_bill_id', $orderId);
            })
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Only allow cancellation of pending/processing/expired transactions
        if (!in_array($transaction->status, ['pending', 'processing', 'expired'])) {
            return response()->json([
                'message' => 'Transaksi ini tidak dapat dibatalkan.',
            ], 422);
        }

        // Try to cancel in payment gateway first
        try {
            if ($transaction->payment_gateway === 'flip' && $transaction->flip_bill_id) {
                $this->flip->cancelBill($transaction->flip_bill_id);
            } elseif ($transaction->midtrans_order_id) {
                $this->midtrans->cancelTransaction($transaction->midtrans_order_id);
            }
        } catch (\Exception $e) {
            // Log but don't fail the request
            Log::warning('Failed to cancel transaction in payment gateway', [
                'order_id' => $orderId,
                'gateway' => $transaction->payment_gateway,
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
     * Check transaction status from payment gateway
     */
    public function checkTransactionStatus(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();

        // Try to find by midtrans_order_id first, then by flip_bill_id
        $transaction = Transaction::where(function ($query) use ($orderId) {
                $query->where('midtrans_order_id', $orderId)
                    ->orWhere('flip_bill_id', $orderId);
            })
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Get status based on gateway
        $statusInfo = null;
        if ($transaction->payment_gateway === 'flip' && $transaction->flip_bill_id) {
            $statusInfo = $this->flip->getTransactionStatus($transaction->flip_bill_id);
        } elseif ($transaction->midtrans_order_id) {
            $statusInfo = $this->midtrans->getTransactionStatus($transaction->midtrans_order_id);
        }

        if (!$statusInfo) {
            return response()->json([
                'message' => 'Tidak dapat mengecek status transaksi',
                'status' => $transaction->status,
            ], 500);
        }

        return response()->json([
            'order_id' => $orderId,
            'status' => $statusInfo['status'],
            'gateway' => $transaction->payment_gateway,
            'is_expired' => $statusInfo['is_expired'] ?? false,
        ]);
    }

    /**
     * Refresh snap token for existing transaction (Midtrans only)
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

        // Only works for Midtrans transactions
        if ($transaction->payment_gateway === 'flip') {
            return response()->json([
                'message' => 'Fitur ini hanya tersedia untuk transaksi Midtrans.',
            ], 422);
        }

        // Check if transaction is for a course
        if ($transaction->transactionable_type !== Course::class) {
            return response()->json([
                'message' => 'Jenis transaksi tidak didukung.',
            ], 422);
        }

        $course = $transaction->transactionable;

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
     * Verify payment status and trigger enrollment
     * This endpoint is called from frontend after payment success
     */
    public function verifyPaymentAndEnroll(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();

        Log::info('Frontend callback: verify payment and enroll', [
            'order_id' => $orderId,
            'user_id' => $user->id,
        ]);

        // Find transaction by either midtrans_order_id or flip_bill_id
        $transaction = Transaction::where(function ($query) use ($orderId) {
                $query->where('midtrans_order_id', $orderId)
                    ->orWhere('flip_bill_id', $orderId);
            })
            ->where('user_id', $user->id)
            ->first();

        if (!$transaction) {
            Log::warning('Transaction not found for verify-enroll', ['order_id' => $orderId]);
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan.',
            ], 404);
        }

        // Get real-time status from payment gateway
        try {
            $statusInfo = null;
            if ($transaction->payment_gateway === 'flip' && $transaction->flip_bill_id) {
                $statusInfo = $this->flip->getTransactionStatus($transaction->flip_bill_id);
            } elseif ($transaction->midtrans_order_id) {
                $statusInfo = $this->midtrans->getTransactionStatus($transaction->midtrans_order_id);
            }

            if ($statusInfo) {
                $newStatus = $statusInfo['status'];

                // Update transaction status if changed
                if ($transaction->status !== $newStatus) {
                    Log::info('Updating transaction status from gateway API', [
                        'order_id' => $orderId,
                        'gateway' => $transaction->payment_gateway,
                        'old_status' => $transaction->status,
                        'new_status' => $newStatus,
                    ]);

                    $details = $transaction->payment_details ?? [];
                    $details['frontend_verification'] = [
                        'verified_at' => now()->toISOString(),
                        'gateway_response' => $statusInfo,
                    ];

                    $transaction->update([
                        'status' => $newStatus,
                        'payment_details' => $details,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to verify status with payment gateway', [
                'order_id' => $orderId,
                'gateway' => $transaction->payment_gateway,
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
                    'order_id' => $transaction->midtrans_order_id ?? $transaction->flip_bill_id
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
                    'order_id' => $transaction->midtrans_order_id ?? $transaction->flip_bill_id,
                    'gateway' => $transaction->payment_gateway
                ]);
            });

        } catch (\Exception $e) {
            Log::error('Failed to auto-enroll user after payment', [
                'transaction_id' => $transaction->id,
                'order_id' => $transaction->midtrans_order_id ?? $transaction->flip_bill_id,
                'gateway' => $transaction->payment_gateway,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw the exception so caller knows it failed
            throw $e;
        }
    }
}
