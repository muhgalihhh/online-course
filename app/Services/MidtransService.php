<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public function __construct()
    {
        $this->initializeConfig();
    }

    public function initializeConfig(): void
    {
        $serverKey = (string) config('midtrans.server_key');
        $clientKey = (string) config('midtrans.client_key');
        $isProduction = (bool) config('midtrans.is_production');

        Log::info('Initializing Midtrans config', [
            'server_key_present' => !empty($serverKey),
            'client_key_present' => !empty($clientKey),
            'is_production' => $isProduction,
            'server_key_prefix' => substr($serverKey, 0, 10) . '...',
            'client_key_prefix' => substr($clientKey, 0, 10) . '...'
        ]);

        if (empty($serverKey) || empty($clientKey)) {
            Log::error('Midtrans keys not configured properly', [
                'server_key_empty' => empty($serverKey),
                'client_key_empty' => empty($clientKey)
            ]);
            throw new \Exception('Midtrans configuration is incomplete. Please check your environment variables.');
        }

        \Midtrans\Config::$serverKey = $serverKey;
        \Midtrans\Config::$isProduction = $isProduction;
        \Midtrans\Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = (bool) config('midtrans.is_3ds');
    }

    public function createCourseTransaction(User $user, Course $course, ?string $preferredPaymentMethod = null): array
    {
        // First, check for any existing transaction for this course (including completed ones)
        $existingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $course->id)
            ->where('transactionable_type', Course::class)
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->first();

        if ($existingTransaction) {
            Log::info('Found existing transaction, validating with Midtrans', [
                'order_id' => $existingTransaction->midtrans_order_id,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'local_status' => $existingTransaction->status
            ]);

            // Always validate with Midtrans for real-time status
            try {
                $midtransStatus = $this->getTransactionStatus($existingTransaction->midtrans_order_id);

                if ($midtransStatus) {
                    $currentStatus = $this->mapMidtransStatusToLocal(
                        $midtransStatus['transaction_status'] ?? '',
                        $midtransStatus['fraud_status'] ?? ''
                    );

                    // Update local status to match Midtrans
                    if ($currentStatus !== $existingTransaction->status) {
                        $existingTransaction->update(['status' => $currentStatus]);

                        Log::info('Updated transaction status from Midtrans', [
                            'order_id' => $existingTransaction->midtrans_order_id,
                            'old_status' => $existingTransaction->status,
                            'new_status' => $currentStatus,
                            'midtrans_status' => $midtransStatus['transaction_status']
                        ]);
                    }

                    // If transaction is still active in Midtrans, reuse it
                    if (in_array($currentStatus, ['pending', 'processing'])) {
                        $snapToken = $existingTransaction->payment_details['snap_token'] ?? null;

                        if ($snapToken) {
                            Log::info('Reusing valid existing transaction', [
                                'order_id' => $existingTransaction->midtrans_order_id,
                                'status' => $currentStatus
                            ]);

                            return [
                                'order_id' => $existingTransaction->midtrans_order_id,
                                'snap_token' => $snapToken,
                                'redirect_url' => $existingTransaction->payment_details['redirect_url'] ?? null,
                                'transaction' => $existingTransaction,
                                'is_existing' => true,
                            ];
                        } else {
                            // No snap token but transaction still pending - need to create new
                            Log::info('Transaction pending but no snap token, will create new', [
                                'order_id' => $existingTransaction->midtrans_order_id
                            ]);
                            $existingTransaction->update(['status' => 'expired']);
                        }
                    } else {
                        // Transaction expired/failed/cancelled in Midtrans
                        Log::info('Transaction no longer active in Midtrans', [
                            'order_id' => $existingTransaction->midtrans_order_id,
                            'final_status' => $currentStatus
                        ]);
                        // Don't create new transaction immediately, let controller handle
                        return [
                            'order_id' => null,
                            'snap_token' => null,
                            'redirect_url' => null,
                            'transaction' => null,
                            'is_existing' => false,
                            'expired_transaction' => $existingTransaction,
                            'error' => 'Transaksi sebelumnya sudah expired. Silakan buat transaksi baru.'
                        ];
                    }
                } else {
                    // Could not get status from Midtrans
                    Log::warning('Could not verify transaction status with Midtrans', [
                        'order_id' => $existingTransaction->midtrans_order_id
                    ]);

                    // If transaction is very recent (< 10 minutes), assume still valid
                    $minutesOld = $existingTransaction->created_at->diffInMinutes(now());
                    if ($minutesOld < 10) {
                        $snapToken = $existingTransaction->payment_details['snap_token'] ?? null;
                        if ($snapToken) {
                            Log::info('Using recent transaction despite Midtrans check failure', [
                                'order_id' => $existingTransaction->midtrans_order_id,
                                'minutes_old' => $minutesOld
                            ]);

                            return [
                                'order_id' => $existingTransaction->midtrans_order_id,
                                'snap_token' => $snapToken,
                                'redirect_url' => $existingTransaction->payment_details['redirect_url'] ?? null,
                                'transaction' => $existingTransaction,
                                'is_existing' => true,
                            ];
                        }
                    }

                    // Mark as expired if old or no token
                    $existingTransaction->update(['status' => 'expired']);
                }
            } catch (\Exception $e) {
                Log::error('Error validating transaction with Midtrans', [
                    'order_id' => $existingTransaction->midtrans_order_id,
                    'error' => $e->getMessage()
                ]);

                // Mark as expired on error
                $existingTransaction->update(['status' => 'expired']);
            }
        }

        // Create new transaction only if no valid existing transaction
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
                    'id' => 'course_' . $course->id,
                    'price' => (int) $course->price,
                    'quantity' => 1,
                    'name' => Str::limit($course->title, 50, ''),
                ],
            ],
        ];

        if (!empty($enabledPayments)) {
            $params['enabled_payments'] = $enabledPayments;
        }

        try {
            $snapTransaction = \Midtrans\Snap::createTransaction($params);

            Log::info('Midtrans Snap transaction created', [
                'order_id' => $orderId,
                'token_present' => !empty($snapTransaction->token),
                'redirect_url_present' => !empty($snapTransaction->redirect_url)
            ]);

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

            Log::info('Created new transaction', [
                'order_id' => $orderId,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'transaction_id' => $transaction->id
            ]);

            return [
                'order_id' => $orderId,
                'snap_token' => $snapTransaction->token ?? null,
                'redirect_url' => $snapTransaction->redirect_url ?? null,
                'transaction' => $transaction,
                'is_existing' => false,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create Midtrans transaction', [
                'order_id' => $orderId,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signature): bool
    {
        $serverKey = (string) config('midtrans.server_key');
        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        return hash_equals($expected, $signature);
    }

    /**
     * Create or refresh course transaction for refresh scenarios
     * This is optimized for when user refreshes payment page
     */
    public function createOrRefreshCourseTransaction(User $user, Course $course, ?string $preferredPaymentMethod = null): array
    {
        // Check for recent transaction within last 2 hours (more lenient for refresh scenarios)
        $recentTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $course->id)
            ->where('transactionable_type', Course::class)
            ->whereIn('status', ['pending', 'processing', 'expired'])
            ->where('created_at', '>=', now()->subHours(2))
            ->orderBy('created_at', 'desc')
            ->first();

        if ($recentTransaction) {
            // If recent transaction exists, always create a new one for refresh scenarios
            // Mark old as expired first
            $recentTransaction->update(['status' => 'expired']);

            Log::info('Found recent transaction, creating new for refresh scenario', [
                'old_order_id' => $recentTransaction->midtrans_order_id,
                'old_status' => $recentTransaction->status,
                'user_id' => $user->id,
                'course_id' => $course->id
            ]);
        }

        // Create new transaction
        return $this->createCourseTransaction($user, $course, $preferredPaymentMethod);
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

            // Convert object to array if needed for consistent access
            $statusArray = is_object($status) ? (array) $status : $status;

            // Map Midtrans status to our local status
            $transactionStatus = $statusArray['transaction_status'] ?? '';
            $fraudStatus = $statusArray['fraud_status'] ?? '';

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
                $details['last_status_check'] = $statusArray;
                $details['last_check_at'] = now()->toISOString();

                // Only update status if it's different from current status
                if ($transaction->status !== $localStatus) {
                    $transaction->update([
                        'status' => $localStatus,
                        'payment_details' => $details,
                        'payment_method' => $transaction->payment_method ?: ($statusArray['payment_type'] ?? null),
                    ]);

                    Log::info('Transaction status updated', [
                        'order_id' => $orderId,
                        'old_status' => $transaction->status,
                        'new_status' => $localStatus,
                        'midtrans_status' => $transactionStatus,
                    ]);
                } else {
                    // Just update payment details without changing status
                    $transaction->update(['payment_details' => $details]);
                }
            }

            return [
                'order_id' => $orderId,
                'status' => $localStatus,
                'midtrans_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $statusArray['payment_type'] ?? null,
                'gross_amount' => $statusArray['gross_amount'] ?? null,
                'transaction_time' => $statusArray['transaction_time'] ?? null,
                'is_expired' => in_array($localStatus, ['expired', 'cancelled', 'failed']),
            ];
        } catch (\Exception $e) {
            Log::warning('Failed to get transaction status from Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            // Check if this is a 404 error (transaction not found/expired)
            if (str_contains($e->getMessage(), '404') || str_contains($e->getMessage(), 'not found')) {
                // Transaction might be expired or not found in Midtrans
                $transaction = Transaction::where('midtrans_order_id', $orderId)->first();
                if ($transaction && in_array($transaction->status, ['pending', 'processing'])) {
                    // Check if transaction is older than standard Midtrans expiry (24 hours for most payment methods)
                    $createdAt = $transaction->created_at;
                    $now = now();
                    $hoursDiff = $createdAt->diffInHours($now);

                    // Use 24 hours as default, but different payment methods may have different expiry times
                    $expiryHours = $this->getPaymentExpiryHours($transaction->payment_method);

                    if ($hoursDiff >= $expiryHours) {
                        // Transaction is likely expired
                        $transaction->update(['status' => 'expired']);

                        Log::info('Transaction marked as expired due to age and 404 error', [
                            'order_id' => $orderId,
                            'hours_old' => $hoursDiff,
                            'expiry_hours' => $expiryHours,
                            'payment_method' => $transaction->payment_method,
                        ]);

                        return [
                            'order_id' => $orderId,
                            'status' => 'expired',
                            'midtrans_status' => 'expire',
                            'is_expired' => true,
                        ];
                    }
                }
            }

            return null;
        }
    }

    /**
     * Get expiry hours based on payment method
     */
    private function getPaymentExpiryHours(?string $paymentMethod): int
    {
        return match ($paymentMethod) {
            'bank_transfer' => 24,      // Bank transfer: 24 hours
            'echannel' => 3 * 24,       // Mandiri Bill Payment: 3 days
            'bca_va' => 24,             // BCA VA: 24 hours
            'bni_va' => 24,             // BNI VA: 24 hours
            'bri_va' => 24,             // BRI VA: 24 hours
            'permata_va' => 24,         // Permata VA: 24 hours
            'other_va' => 24,           // Other VA: 24 hours
            'indomaret' => 2 * 24,      // Indomaret: 2 days
            'alfamart' => 2 * 24,       // Alfamart: 2 days
            'shopeepay' => 15 / 60,     // ShopeePay: 15 minutes
            'gopay' => 15 / 60,         // GoPay: 15 minutes
            'qris' => 30 / 60,          // QRIS: 30 minutes
            default => 24,              // Default: 24 hours
        };
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
            return is_object($result) && isset($result->status_code) && (string) $result->status_code === '200';
        } catch (\Exception $e) {
            // Log the error but don't throw
            Log::warning('Failed to cancel transaction in Midtrans', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Map Midtrans transaction status to local status
     */
    private function mapMidtransStatusToLocal(string $transactionStatus, string $fraudStatus): string
    {
        return match ($transactionStatus) {
            'capture' => $fraudStatus === 'challenge' ? 'pending' : 'completed',
            'settlement' => 'completed',
            'pending' => 'pending',
            'deny' => 'failed',
            'expire' => 'expired',
            'cancel' => 'cancelled',
            'failure' => 'failed',
            default => 'pending',
        };
    }
}
