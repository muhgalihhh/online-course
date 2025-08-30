<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Str;

class MidtransService
{
    public function __construct()
    {
        $this->initializeConfig();
    }

    public function initializeConfig(): void
    {
        \Midtrans\Config::$serverKey = (string) config('midtrans.server_key');
        \Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = (bool) config('midtrans.is_3ds');
    }

    public function createCourseTransaction(User $user, Course $course, ?string $preferredPaymentMethod = null): array
    {
        $orderId = $this->generateOrderId($user, $course);

        $enabledPayments = $this->resolveEnabledPayments($preferredPaymentMethod);

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $course->price,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'user_id' => $user->id,
            ],
            'item_details' => [
                [
                    'id' => 'course_'.$course->id,
                    'price' => (int) $course->price,
                    'quantity' => 1,
                    'name' => Str::limit($course->title, 50, ''),
                ],
            ],
        ];

        if (!empty($enabledPayments)) {
            $params['enabled_payments'] = $enabledPayments;
        }

        $snapTransaction = \Midtrans\Snap::createTransaction($params);

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'transactionable_id' => $course->id,
            'transactionable_type' => Course::class,
            'midtrans_order_id' => $orderId,
            'amount' => (int) $course->price,
            'payment_method' => $preferredPaymentMethod,
            'status' => 'pending',
            'payment_details' => [
                'snap_token' => $snapTransaction->token ?? null,
                'redirect_url' => $snapTransaction->redirect_url ?? null,
                'enabled_payments' => $enabledPayments,
            ],
        ]);

        return [
            'order_id' => $orderId,
            'snap_token' => $snapTransaction->token ?? null,
            'redirect_url' => $snapTransaction->redirect_url ?? null,
            'transaction' => $transaction,
        ];
    }

    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signature): bool
    {
        $serverKey = (string) config('midtrans.server_key');
        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);
        return hash_equals($expected, $signature);
    }

    /**
     * Get Snap token for existing transaction
     */
    public function getSnapToken(string $orderId): ?string
    {
        try {
            // Try to get transaction status from Midtrans
            $status = \Midtrans\Transaction::status($orderId);
            
            // If transaction exists and is still pending, return the existing token
            // Note: Midtrans doesn't provide a way to retrieve existing snap token
            // So we need to get it from our database
            $transaction = Transaction::where('midtrans_order_id', $orderId)->first();
            if ($transaction && $transaction->payment_details) {
                return $transaction->payment_details['snap_token'] ?? null;
            }
            
            return null;
        } catch (\Exception $e) {
            // Transaction not found or error
            return null;
        }
    }

    private function resolveEnabledPayments(?string $preferredPaymentMethod): array
    {
        $methods = array_map('strtolower', (array) config('midtrans.payment_methods'));

        if ($preferredPaymentMethod) {
            $preferred = strtolower($preferredPaymentMethod);
            if (in_array($preferred, $methods, true)) {
                return [$preferred];
            }
        }

        return $methods;
    }

    private function generateOrderId(User $user, Course $course): string
    {
        if ((bool) config('midtrans.enable_order_id')) {
            return sprintf(
                'ORDER-%s-%s-%s-%s',
                $course->id,
                $user->id,
                now()->format('YmdHis'),
                Str::upper(Str::random(6))
            );
        }

        return (string) Str::uuid();
    }
}

