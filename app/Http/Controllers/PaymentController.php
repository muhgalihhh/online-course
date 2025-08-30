<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        if (!$course->is_pro || (int) $course->price <= 0) {
            return response()->json([
                'message' => 'Kursus ini gratis. Tidak memerlukan pembayaran.',
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
}

