<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FlipService
{
    private string $secretKey;
    private string $validationToken;
    private string $baseUrl;
    private bool $isProduction;

    public function __construct()
    {
        $this->secretKey = (string) config('flip.secret_key');
        $this->validationToken = (string) config('flip.validation_token');
        $this->baseUrl = (string) config('flip.base_url');
        $this->isProduction = (bool) config('flip.is_production');

        if (empty($this->secretKey)) {
            Log::warning('Flip secret key not configured');
        }
    }

    /**
     * Create a payment bill for course purchase
     */
    public function createCourseTransaction(User $user, Course $course): array
    {
        // Check for existing pending transaction
        $existingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $course->id)
            ->where('transactionable_type', Course::class)
            ->where('payment_gateway', 'flip')
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->first();

        if ($existingTransaction && !empty($existingTransaction->flip_bill_id)) {
            Log::info('Found existing Flip transaction, checking validity', [
                'flip_bill_id' => $existingTransaction->flip_bill_id,
                'user_id' => $user->id,
                'course_id' => $course->id,
            ]);

            // Check if bill is still valid with Flip API
            $billStatus = $this->getBillStatus($existingTransaction->flip_bill_id);

            if ($billStatus && in_array(strtoupper($billStatus['status'] ?? ''), ['PENDING', 'ACTIVE'])) {
                // Get payment URL from bill status or existing transaction
                $paymentUrl = $billStatus['link_url'] ?? $existingTransaction->payment_details['payment_url'] ?? null;

                // Ensure URL has https:// prefix
                if ($paymentUrl && !str_starts_with($paymentUrl, 'http')) {
                    $paymentUrl = 'https://' . $paymentUrl;
                }

                // Update transaction with latest payment URL if changed
                if ($paymentUrl && ($existingTransaction->payment_details['payment_url'] ?? null) !== $paymentUrl) {
                    $details = $existingTransaction->payment_details ?? [];
                    $details['payment_url'] = $paymentUrl;
                    $details['bill_link'] = $paymentUrl;
                    $existingTransaction->update(['payment_details' => $details]);
                }

                Log::info('Reusing existing valid Flip transaction', [
                    'flip_bill_id' => $existingTransaction->flip_bill_id,
                    'payment_url' => $paymentUrl,
                ]);

                return [
                    'bill_id' => $existingTransaction->flip_bill_id,
                    'payment_url' => $paymentUrl,
                    'transaction' => $existingTransaction,
                    'is_existing' => true,
                ];
            }

            // Bill expired or invalid, mark as expired
            Log::info('Existing Flip transaction is no longer valid, marking as expired', [
                'flip_bill_id' => $existingTransaction->flip_bill_id,
                'bill_status' => $billStatus['status'] ?? 'unknown',
            ]);
            $existingTransaction->update(['status' => 'expired']);
        }

        // Create new bill
        $billData = $this->createBill($user, $course);

        // Extract and ensure payment URL has https:// prefix
        $paymentUrl = $billData['link_url'] ?? $billData['url'] ?? null;
        if ($paymentUrl && !str_starts_with($paymentUrl, 'http')) {
            $paymentUrl = 'https://' . $paymentUrl;
        }

        // Convert link_id to string for storage
        $billId = isset($billData['link_id']) ? (string) $billData['link_id'] : ($billData['bill_link_id'] ?? null);

        // Create transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'transactionable_id' => $course->id,
            'transactionable_type' => Course::class,
            'flip_bill_id' => $billId,
            'midtrans_order_id' => null, // Not using Midtrans
            'payment_gateway' => 'flip',
            'amount' => (int) $course->price,
            'payment_method' => null, // Will be filled after user selects
            'status' => 'pending',
            'payment_details' => [
                'flip_response' => $billData,
                'payment_url' => $paymentUrl,
                'bill_link' => $paymentUrl,
                'title' => $billData['title'] ?? null,
                'created_at' => now()->toISOString(),
            ],
        ]);

        Log::info('Created new Flip transaction', [
            'transaction_id' => $transaction->id,
            'flip_bill_id' => $transaction->flip_bill_id,
            'user_id' => $user->id,
            'course_id' => $course->id,
            'payment_url' => $paymentUrl,
        ]);

        return [
            'bill_id' => $transaction->flip_bill_id,
            'payment_url' => $paymentUrl,
            'transaction' => $transaction,
            'is_existing' => false,
        ];
    }

    /**
     * Create a payment bill via Flip API
     *
     * Note on step parameter:
     * - step=1: Shows bill info only
     * - step=2: Shows bill info + payment method selection (recommended)
     * - step=3: Direct to payment page (requires sender_bank parameter)
     *
     * We use step=2 by default to let users choose their payment method.
     */
    public function createBill(User $user, Course $course): array
    {
        $expiryHours = (int) config('flip.bill_expiry_hours', 24);

        // Use step=2 to allow customers to choose payment method
        // step=3 requires sender_bank which we don't collect upfront
        $step = (int) config('flip.payment_step', 2);
        if ($step === 3) {
            // Fallback to step=2 if step=3 is configured but we don't have sender_bank
            $step = 2;
            Log::info('Flip: Changed step from 3 to 2 (sender_bank not provided)');
        }

        // Build redirect URL - Flip requires a valid public URL (not localhost)
        $redirectUrl = route('payments.flip.callback', ['course_id' => $course->id]);
        $appUrl = config('app.url', '');

        // Check if app URL is localhost or non-public - Flip will reject these
        $isLocalhost = str_contains($appUrl, 'localhost') ||
            str_contains($appUrl, '127.0.0.1') ||
            str_contains($appUrl, '0.0.0.0');

        $payload = [
            'title' => 'Course: ' . Str::limit($course->title, 40),
            'amount' => (int) $course->price,
            'type' => 'SINGLE',
            'expired_date' => now()->addHours($expiryHours)->format('Y-m-d H:i'),
            'is_address_required' => config('flip.is_address_required', false) ? 1 : 0,
            'is_phone_number_required' => config('flip.is_phone_required', false) ? 1 : 0,
            'step' => $step,
            'sender_name' => $user->name,
            'sender_email' => $user->email,
        ];

        // Only include redirect_url if it's a valid public URL
        // Flip rejects localhost URLs - in local dev, users will need to
        // check payment status manually on the payment page
        if (!$isLocalhost) {
            $payload['redirect_url'] = $redirectUrl;
        } else {
            Log::info('Flip: Skipping redirect_url for localhost development');
        }

        Log::info('Creating Flip Bill', [
            'payload' => array_merge($payload, ['sender_email' => '***']),
            'base_url' => $this->baseUrl,
        ]);

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(30)
                ->asForm()
                ->post($this->baseUrl . '/pwf/bill', $payload);

            if ($response->successful()) {
                $data = $response->json();

                // Ensure link_url has proper https:// prefix
                if (isset($data['link_url']) && !str_starts_with($data['link_url'], 'http')) {
                    $data['link_url'] = 'https://' . $data['link_url'];
                }

                Log::info('Flip Bill Created Successfully', [
                    'link_id' => $data['link_id'] ?? null,
                    'link_url' => $data['link_url'] ?? null,
                ]);
                return $data;
            }

            $errorBody = $response->json();
            Log::error('Flip API Error Response', [
                'status' => $response->status(),
                'body' => $errorBody,
            ]);

            // Provide more specific error messages
            $errorMessage = 'Unknown error';
            if (isset($errorBody['errors']) && is_array($errorBody['errors'])) {
                $messages = array_map(fn($e) => $e['message'] ?? '', $errorBody['errors']);
                $errorMessage = implode(', ', array_filter($messages));
            } elseif (isset($errorBody['message'])) {
                $errorMessage = $errorBody['message'];
            } elseif (isset($errorBody['code'])) {
                $errorMessage = $errorBody['code'];
            }

            throw new \Exception('Flip API Error: ' . $errorMessage);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Flip API Connection Failed', [
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Gagal terhubung ke server Flip. Silakan coba lagi.');
        } catch (\Exception $e) {
            Log::error('Flip API Request Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't wrap already formatted exceptions
            if (
                str_starts_with($e->getMessage(), 'Flip API Error:') ||
                str_starts_with($e->getMessage(), 'Gagal')
            ) {
                throw $e;
            }

            throw new \Exception('Gagal membuat tagihan pembayaran via Flip: ' . $e->getMessage());
        }
    }

    /**
     * Get bill status from Flip API
     */
    public function getBillStatus(string $billId): ?array
    {
        if (empty($billId)) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(15)
                ->get($this->baseUrl . '/pwf/' . $billId . '/bill');

            if ($response->successful()) {
                $data = $response->json();

                // Ensure link_url has proper https:// prefix
                if (isset($data['link_url']) && !str_starts_with($data['link_url'], 'http')) {
                    $data['link_url'] = 'https://' . $data['link_url'];
                }

                Log::info('Flip Bill Status Retrieved', [
                    'bill_id' => $billId,
                    'status' => $data['status'] ?? null,
                    'link_url' => $data['link_url'] ?? null,
                ]);
                return $data;
            }

            Log::warning('Failed to get Flip bill status', [
                'bill_id' => $billId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Error getting Flip bill status', [
                'bill_id' => $billId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get all payments for a bill
     */
    public function getBillPayments(string $billId): ?array
    {
        if (empty($billId)) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(15)
                ->get($this->baseUrl . '/pwf/' . $billId . '/payment');

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Error getting Flip bill payments', [
                'bill_id' => $billId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Verify webhook signature from Flip
     */
    public function verifyWebhookSignature(string $token): bool
    {
        if (empty($this->validationToken)) {
            Log::warning('Flip validation token not configured');
            return false;
        }

        // Flip uses token-based validation
        // The token sent in webhook should match our validation token
        return hash_equals($this->validationToken, $token);
    }

    /**
     * Process webhook callback from Flip
     */
    public function processWebhook(array $payload): ?Transaction
    {
        $billId = $payload['bill_link_id'] ?? $payload['id'] ?? null;
        $status = $payload['status'] ?? null;

        if (!$billId) {
            Log::warning('Flip webhook missing bill_link_id', ['payload' => $payload]);
            return null;
        }

        Log::info('Processing Flip webhook', [
            'bill_id' => $billId,
            'status' => $status,
            'payload' => $payload,
        ]);

        // Find transaction by flip_bill_id
        $transaction = Transaction::where('flip_bill_id', $billId)->first();

        if (!$transaction) {
            Log::warning('Transaction not found for Flip bill', ['bill_id' => $billId]);
            return null;
        }

        // Map Flip status to local status
        $localStatus = $this->mapStatus($status);

        // Update transaction
        $details = $transaction->payment_details ?? [];
        $details['last_webhook'] = $payload;
        $details['last_webhook_at'] = now()->toISOString();

        $transaction->update([
            'status' => $localStatus,
            'payment_details' => $details,
            'payment_method' => $payload['sender_bank'] ?? $payload['payment_method'] ?? $transaction->payment_method,
        ]);

        Log::info('Flip transaction updated via webhook', [
            'transaction_id' => $transaction->id,
            'bill_id' => $billId,
            'old_status' => $transaction->getOriginal('status'),
            'new_status' => $localStatus,
        ]);

        return $transaction;
    }

    /**
     * Get transaction status and sync with Flip
     */
    public function getTransactionStatus(string $billId): ?array
    {
        $billStatus = $this->getBillStatus($billId);

        if (!$billStatus) {
            return null;
        }

        $transaction = Transaction::where('flip_bill_id', $billId)->first();

        if ($transaction) {
            $localStatus = $this->mapStatus($billStatus['status'] ?? '');

            // Update if status changed
            if ($transaction->status !== $localStatus) {
                $details = $transaction->payment_details ?? [];
                $details['last_status_check'] = $billStatus;
                $details['last_check_at'] = now()->toISOString();

                $transaction->update([
                    'status' => $localStatus,
                    'payment_details' => $details,
                ]);

                Log::info('Flip transaction status updated from API', [
                    'transaction_id' => $transaction->id,
                    'bill_id' => $billId,
                    'new_status' => $localStatus,
                ]);
            }
        }

        return [
            'bill_id' => $billId,
            'status' => $this->mapStatus($billStatus['status'] ?? ''),
            'flip_status' => $billStatus['status'] ?? null,
            'amount' => $billStatus['amount'] ?? null,
            'title' => $billStatus['title'] ?? null,
            'is_expired' => in_array($this->mapStatus($billStatus['status'] ?? ''), ['expired', 'cancelled', 'failed']),
        ];
    }

    /**
     * Map Flip status to local application status
     */
    public function mapStatus(string $flipStatus): string
    {
        // Flip status: SUCCESSFUL, PENDING, CANCELLED, FAILED, EXPIRED
        return match (strtoupper($flipStatus)) {
            'SUCCESSFUL', 'DONE', 'PAID' => 'completed',
            'PROCESSED', 'PROCESSING' => 'processing',
            'FAILED' => 'failed',
            'CANCELLED', 'CANCELED' => 'cancelled',
            'EXPIRED', 'INACTIVE' => 'expired',
            'PENDING', 'ACTIVE', 'NOT_CONFIRMED' => 'pending',
            default => 'pending',
        };
    }

    /**
     * Check if transaction status is still active (not final)
     */
    public function isActiveStatus(string $status): bool
    {
        return in_array($status, ['pending', 'processing'], true);
    }

    /**
     * Cancel a bill (if supported by Flip)
     * Note: Flip may not support bill cancellation via API
     */
    public function cancelBill(string $billId): bool
    {
        Log::info('Attempting to cancel Flip bill', ['bill_id' => $billId]);

        // Flip API may not support direct cancellation
        // We just mark our local transaction as cancelled
        $transaction = Transaction::where('flip_bill_id', $billId)->first();

        if ($transaction && in_array($transaction->status, ['pending', 'processing'])) {
            $transaction->update(['status' => 'cancelled']);
            Log::info('Flip transaction marked as cancelled locally', [
                'transaction_id' => $transaction->id,
                'bill_id' => $billId,
            ]);
            return true;
        }

        return false;
    }
}
