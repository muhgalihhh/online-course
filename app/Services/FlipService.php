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

        if ($existingTransaction && !empty($existingTransaction->payment_details['payment_url'])) {
            Log::info('Reusing existing Flip transaction', [
                'flip_bill_id' => $existingTransaction->flip_bill_id,
                'user_id' => $user->id,
                'course_id' => $course->id,
            ]);

            // Check if bill is still valid
            $billStatus = $this->getBillStatus($existingTransaction->flip_bill_id);
            if ($billStatus && in_array($billStatus['status'], ['pending', 'PENDING', 'ACTIVE'])) {
                return [
                    'bill_id' => $existingTransaction->flip_bill_id,
                    'payment_url' => $existingTransaction->payment_details['payment_url'],
                    'transaction' => $existingTransaction,
                    'is_existing' => true,
                ];
            }

            // Bill expired or invalid, mark as expired
            $existingTransaction->update(['status' => 'expired']);
        }

        // Create new bill
        $billData = $this->createBill($user, $course);

        // Create transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'transactionable_id' => $course->id,
            'transactionable_type' => Course::class,
            'flip_bill_id' => $billData['link_id'] ?? $billData['bill_link_id'] ?? null,
            'midtrans_order_id' => null, // Not using Midtrans
            'payment_gateway' => 'flip',
            'amount' => (int) $course->price,
            'payment_method' => null, // Will be filled after user selects
            'status' => 'pending',
            'payment_details' => [
                'flip_response' => $billData,
                'payment_url' => $billData['link_url'] ?? $billData['url'] ?? null,
                'bill_link' => $billData['link_url'] ?? $billData['url'] ?? null,
                'title' => $billData['title'] ?? null,
                'created_at' => now()->toISOString(),
            ],
        ]);

        Log::info('Created new Flip transaction', [
            'transaction_id' => $transaction->id,
            'flip_bill_id' => $transaction->flip_bill_id,
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        return [
            'bill_id' => $transaction->flip_bill_id,
            'payment_url' => $billData['link_url'] ?? $billData['url'] ?? null,
            'transaction' => $transaction,
            'is_existing' => false,
        ];
    }

    /**
     * Create a payment bill via Flip API
     */
    public function createBill(User $user, Course $course): array
    {
        $expiryHours = (int) config('flip.bill_expiry_hours', 24);
        $step = (int) config('flip.payment_step', 3);

        $payload = [
            'title' => 'Course: ' . Str::limit($course->title, 40),
            'amount' => (int) $course->price,
            'type' => 'SINGLE',
            'expired_date' => now()->addHours($expiryHours)->format('Y-m-d H:i'),
            'redirect_url' => route('payments.flip.callback', ['course_id' => $course->id]),
            'is_address_required' => config('flip.is_address_required', false) ? 1 : 0,
            'is_phone_number_required' => config('flip.is_phone_required', false) ? 1 : 0,
            'step' => $step,
            'sender_name' => $user->name,
            'sender_email' => $user->email,
        ];

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

            throw new \Exception('Flip API Error: ' . ($errorBody['message'] ?? $errorBody['code'] ?? 'Unknown error'));

        } catch (\Exception $e) {
            Log::error('Flip API Request Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
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
                Log::info('Flip Bill Status Retrieved', [
                    'bill_id' => $billId,
                    'status' => $data['status'] ?? null,
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
