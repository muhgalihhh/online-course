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

    /**
     * Get transaction status from Midtrans and update local database
     */
    public function getTransactionStatus(string $orderId): ?array
    {
        try {
            $status = \Midtrans\Transaction::status($orderId);
            
            // Map Midtrans status to our local status
            $transactionStatus = $status->transaction_status ?? '';
            $fraudStatus = $status->fraud_status ?? '';
            
            $localStatus = match ($transactionStatus) {
                'capture' => $fraudStatus === 'challenge' ? 'pending' : 'completed',
                'settlement' => 'completed',
                'pending' => 'pending',
                'deny' => 'failed',
                'expire' => 'expired',
                'cancel' => 'cancelled',
                default => 'pending',
            };
            
            // Update local transaction if exists
            $transaction = Transaction::where('midtrans_order_id', $orderId)->first();
            if ($transaction) {
                $details = $transaction->payment_details ?? [];
                $details['last_status_check'] = $status;
                $details['last_check_at'] = now()->toISOString();
                
                $transaction->update([
                    'status' => $localStatus,
                    'payment_details' => $details,
                    'payment_method' => $transaction->payment_method ?: ($status->payment_type ?? null),
                ]);
            }
            
            return [
                'order_id' => $orderId,
                'status' => $localStatus,
                'midtrans_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $status->payment_type ?? null,
                'gross_amount' => $status->gross_amount ?? null,
                'transaction_time' => $status->transaction_time ?? null,
            ];
        } catch (\Exception $e) {
            \Log::warning('Failed to get transaction status from Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);
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

    /**
     * Cancel transaction in Midtrans
     */
    public function cancelTransaction(string $orderId): bool
    {
        try {
            $result = \Midtrans\Transaction::cancel($orderId);
            return isset($result->status_code) && $result->status_code == '200';
        } catch (\Exception $e) {
            // Log the error but don't throw
            \Log::warning('Failed to cancel transaction in Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}

