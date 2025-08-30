<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

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

        $alreadyEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();
        if ($alreadyEnrolled) {
            return response()->json([
                'message' => 'Anda sudah terdaftar di kursus ini.',
            ], 409);
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
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signature = (string) ($payload['signature_key'] ?? '');

        if (!$orderId || !$statusCode || !$grossAmount || !$signature) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        if (!$this->midtrans->verifySignature($orderId, $statusCode, $grossAmount, $signature)) {
            Log::warning('Midtrans signature verification failed', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

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

        if ($newStatus === 'completed' && $transaction->transactionable_type === Course::class) {
            $courseId = $transaction->transactionable_id;
            $user = $transaction->user;
            if ($user && !$user->courses()->where('course_id', $courseId)->exists()) {
                // Buat enrollment dengan metadata awal yang konsisten dengan free-enroll
                \App\Models\Enrollment::create([
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'enrolled_at' => now(),
                    'progress' => 0,
                ]);
            }
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
    public function showPaymentPage(Request $request, int $courseId): Response
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
            // Show payment page with success status
            return Inertia::render('payment/index', [
                'course' => $course,
                'transaction' => null,
                'snapToken' => null,
                'clientKey' => (string) config('midtrans.client_key'),
                'isProduction' => (bool) config('midtrans.is_production'),
                'isAlreadyEnrolled' => true,
            ]);
        }

        // Check for existing pending transaction
        $existingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $courseId)
            ->where('transactionable_type', Course::class)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        $snapToken = null;
        if ($existingTransaction) {
            // Get snap token for existing transaction
            try {
                $snapToken = $this->midtrans->getSnapToken($existingTransaction->midtrans_order_id);
            } catch (\Exception $e) {
                // If can't get token, create new transaction
                $existingTransaction = null;
            }
        }

        return Inertia::render('payment/index', [
            'course' => $course,
            'transaction' => $existingTransaction,
            'snapToken' => $snapToken,
            'clientKey' => (string) config('midtrans.client_key'),
            'isProduction' => (bool) config('midtrans.is_production'),
            'isAlreadyEnrolled' => false,
        ]);
    }

    /**
     * Get user transactions
     */
    public function getUserTransactions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $transactions = Transaction::with(['transactionable'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                // Add course details if transactionable is a course
                if ($transaction->transactionable_type === Course::class) {
                    $transaction->course = $transaction->transactionable;
                }
                return $transaction;
            });

        return response()->json($transactions);
    }

    /**
     * Show transaction detail page
     */
    public function showTransaction(Request $request, string $orderId): Response
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

        // Only allow cancellation of pending transactions
        if (!in_array($transaction->status, ['pending', 'processing'])) {
            return response()->json([
                'message' => 'Transaksi ini tidak dapat dibatalkan.',
            ], 422);
        }

        // Update transaction status to cancelled
        $transaction->update(['status' => 'cancelled']);

        // Try to cancel in Midtrans as well (optional, non-blocking)
        try {
            $this->midtrans->cancelTransaction($orderId);
        } catch (\Exception $e) {
            // Log but don't fail the request
            Log::warning('Failed to cancel transaction in Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'Transaksi berhasil dibatalkan.',
        ]);
    }
}

