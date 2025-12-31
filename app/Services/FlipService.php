<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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
        // Check for existing transaction (pending, processing, or completed)
        $existingTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $course->id)
            ->where('transactionable_type', Course::class)
            ->where('payment_gateway', 'flip')
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->orderBy('created_at', 'desc')
            ->first();

        if ($existingTransaction && !empty($existingTransaction->flip_bill_id)) {
            Log::info('Found existing Flip transaction, checking validity', [
                'flip_bill_id' => $existingTransaction->flip_bill_id,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'current_status' => $existingTransaction->status,
            ]);

            // If transaction is already completed, return it immediately
            if ($existingTransaction->status === 'completed') {
                Log::info('Existing Flip transaction already completed', [
                    'flip_bill_id' => $existingTransaction->flip_bill_id,
                ]);

                return [
                    'bill_id' => $existingTransaction->flip_bill_id,
                    'payment_url' => null,
                    'transaction' => $existingTransaction,
                    'is_existing' => true,
                    'is_completed' => true,
                ];
            }

            // Check if bill is still valid with Flip API
            $billStatus = $this->getBillStatus($existingTransaction->flip_bill_id);
            $flipStatus = strtoupper($billStatus['status'] ?? '');

            // Handle SUCCESSFUL/PAID/DONE status - payment was completed!
            if ($billStatus && in_array($flipStatus, ['SUCCESSFUL', 'DONE', 'PAID'])) {
                Log::info('Flip bill is already paid, updating transaction to completed', [
                    'flip_bill_id' => $existingTransaction->flip_bill_id,
                    'flip_status' => $flipStatus,
                ]);

                $details = $existingTransaction->payment_details ?? [];
                $details['completed_from_api_check'] = true;
                $details['completed_at'] = now()->toISOString();
                $details['flip_final_status'] = $billStatus;

                $existingTransaction->update([
                    'status' => 'completed',
                    'payment_details' => $details,
                    'payment_method' => $billStatus['sender_bank'] ?? $billStatus['payment_method'] ?? $existingTransaction->payment_method,
                ]);

                return [
                    'bill_id' => $existingTransaction->flip_bill_id,
                    'payment_url' => null,
                    'transaction' => $existingTransaction->fresh(),
                    'is_existing' => true,
                    'is_completed' => true,
                ];
            }

            // Handle PENDING/ACTIVE status - bill is still valid for payment
            if ($billStatus && in_array($flipStatus, ['PENDING', 'ACTIVE', 'NOT_CONFIRMED'])) {
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

            // Bill is truly expired/cancelled/failed - mark as expired
            if ($billStatus && in_array($flipStatus, ['EXPIRED', 'INACTIVE', 'CANCELLED', 'CANCELED', 'FAILED'])) {
                Log::info('Existing Flip transaction is expired/cancelled, marking as expired', [
                    'flip_bill_id' => $existingTransaction->flip_bill_id,
                    'bill_status' => $flipStatus,
                ]);
                $existingTransaction->update(['status' => 'expired']);
            } elseif (!$billStatus) {
                // Could not get bill status - might be network issue, keep transaction as is
                Log::warning('Could not get Flip bill status, keeping existing transaction', [
                    'flip_bill_id' => $existingTransaction->flip_bill_id,
                ]);

                // Try to use existing payment URL
                $paymentUrl = $existingTransaction->payment_details['payment_url'] ?? null;
                if ($paymentUrl) {
                    return [
                        'bill_id' => $existingTransaction->flip_bill_id,
                        'payment_url' => $paymentUrl,
                        'transaction' => $existingTransaction,
                        'is_existing' => true,
                    ];
                }
            }
        }

        // Also check for expired/failed/cancelled transactions - their bills might still be valid
        // This prevents creating duplicate bills when Flip returns the same bill ID
        $expiredTransaction = Transaction::where('user_id', $user->id)
            ->where('transactionable_id', $course->id)
            ->where('transactionable_type', Course::class)
            ->where('payment_gateway', 'flip')
            ->whereIn('status', ['expired', 'failed', 'cancelled'])
            ->whereNotNull('flip_bill_id')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($expiredTransaction) {
            Log::info('Found expired/cancelled Flip transaction, checking if bill is still valid', [
                'flip_bill_id' => $expiredTransaction->flip_bill_id,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'current_status' => $expiredTransaction->status,
            ]);

            $billStatus = $this->getBillStatus($expiredTransaction->flip_bill_id);
            $flipStatus = strtoupper($billStatus['status'] ?? '');

            // If bill is still valid on Flip's side, reactivate the transaction
            if ($billStatus && in_array($flipStatus, ['PENDING', 'ACTIVE', 'NOT_CONFIRMED'])) {
                $paymentUrl = $billStatus['link_url'] ?? $expiredTransaction->payment_details['payment_url'] ?? null;

                if ($paymentUrl && !str_starts_with($paymentUrl, 'http')) {
                    $paymentUrl = 'https://' . $paymentUrl;
                }

                Log::info('Reactivating expired Flip transaction - bill is still valid', [
                    'flip_bill_id' => $expiredTransaction->flip_bill_id,
                    'old_status' => $expiredTransaction->status,
                    'payment_url' => $paymentUrl,
                ]);

                $details = $expiredTransaction->payment_details ?? [];
                $details['reactivated_from'] = $expiredTransaction->status;
                $details['reactivated_at'] = now()->toISOString();
                $details['payment_url'] = $paymentUrl;
                $details['bill_link'] = $paymentUrl;

                $expiredTransaction->update([
                    'status' => 'pending',
                    'payment_details' => $details,
                ]);

                return [
                    'bill_id' => $expiredTransaction->flip_bill_id,
                    'payment_url' => $paymentUrl,
                    'transaction' => $expiredTransaction->fresh(),
                    'is_existing' => true,
                ];
            }

            // If bill was paid but we marked transaction as failed/cancelled, fix it
            if ($billStatus && in_array($flipStatus, ['SUCCESSFUL', 'DONE', 'PAID'])) {
                Log::info('Expired/cancelled transaction has paid bill, updating to completed', [
                    'flip_bill_id' => $expiredTransaction->flip_bill_id,
                    'old_status' => $expiredTransaction->status,
                ]);

                $details = $expiredTransaction->payment_details ?? [];
                $details['completed_from_recheck'] = true;
                $details['completed_at'] = now()->toISOString();
                $details['flip_final_status'] = $billStatus;

                $expiredTransaction->update([
                    'status' => 'completed',
                    'payment_details' => $details,
                    'payment_method' => $billStatus['sender_bank'] ?? $billStatus['payment_method'] ?? $expiredTransaction->payment_method,
                ]);

                return [
                    'bill_id' => $expiredTransaction->flip_bill_id,
                    'payment_url' => null,
                    'transaction' => $expiredTransaction->fresh(),
                    'is_existing' => true,
                    'is_completed' => true,
                ];
            }
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

        // Wrap database operations in a transaction with retry logic to handle
        // auto-increment issues and race conditions
        $maxRetries = 3;
        $attempt = 0;
        $lastException = null;

        while ($attempt < $maxRetries) {
            $attempt++;
            
            try {
                return DB::transaction(function () use ($user, $course, $billId, $billData, $paymentUrl) {
                    // Check if there's an existing transaction with this flip_bill_id
                    // Use lockForUpdate to prevent race conditions
                    $existingByBillId = Transaction::where('flip_bill_id', $billId)
                        ->lockForUpdate()
                        ->first();

                    if ($existingByBillId) {
                        Log::info('Found existing transaction with same flip_bill_id, updating instead of creating', [
                            'flip_bill_id' => $billId,
                            'existing_status' => $existingByBillId->status,
                            'user_id' => $user->id,
                            'course_id' => $course->id,
                        ]);

                        // Update the existing transaction with new data
                        $existingByBillId->update([
                            'user_id' => $user->id,
                            'transactionable_id' => $course->id,
                            'transactionable_type' => Course::class,
                            'payment_gateway' => 'flip',
                            'amount' => (int) $course->price,
                            'status' => 'pending',
                            'payment_details' => [
                                'flip_response' => $billData,
                                'payment_url' => $paymentUrl,
                                'bill_link' => $paymentUrl,
                                'title' => $billData['title'] ?? null,
                                'created_at' => now()->toISOString(),
                                'reactivated_from' => $existingByBillId->status,
                                'reactivated_at' => now()->toISOString(),
                            ],
                        ]);

                        Log::info('Updated existing Flip transaction', [
                            'transaction_id' => $existingByBillId->id,
                            'flip_bill_id' => $billId,
                            'user_id' => $user->id,
                            'course_id' => $course->id,
                            'payment_url' => $paymentUrl,
                        ]);

                        return [
                            'bill_id' => $billId,
                            'payment_url' => $paymentUrl,
                            'transaction' => $existingByBillId->fresh(),
                            'is_existing' => true,
                        ];
                    }

                    // Create new transaction record
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
                });
            } catch (\Illuminate\Database\QueryException $e) {
                $lastException = $e;
                
                // Check if it's an auto-increment error (1467) or duplicate entry error (1062)
                $errorCode = $e->errorInfo[1] ?? 0;
                
                Log::warning('Database error during Flip transaction creation, attempt ' . $attempt, [
                    'error_code' => $errorCode,
                    'error_message' => $e->getMessage(),
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'flip_bill_id' => $billId,
                    'attempt' => $attempt,
                ]);

                // For auto-increment error (1467), try to repair and retry
                if ($errorCode === 1467 && $attempt < $maxRetries) {
                    $this->repairAutoIncrement();
                    usleep(100000); // Wait 100ms before retry
                    continue;
                }

                // For duplicate entry (1062), try to find and return existing
                if ($errorCode === 1062) {
                    $existingTransaction = Transaction::where('flip_bill_id', $billId)->first();
                    if ($existingTransaction) {
                        Log::info('Found existing transaction after duplicate key error', [
                            'transaction_id' => $existingTransaction->id,
                            'flip_bill_id' => $billId,
                        ]);
                        
                        return [
                            'bill_id' => $billId,
                            'payment_url' => $existingTransaction->payment_details['payment_url'] ?? $paymentUrl,
                            'transaction' => $existingTransaction,
                            'is_existing' => true,
                        ];
                    }
                }

                // For other errors or max retries reached, throw
                if ($attempt >= $maxRetries) {
                    throw $e;
                }
                
                usleep(100000); // Wait 100ms before retry
            }
        }

        // If we get here, all retries failed
        throw $lastException ?? new \Exception('Failed to create transaction after ' . $maxRetries . ' attempts');
    }

    /**
     * Attempt to repair auto-increment value for transactions table
     */
    private function repairAutoIncrement(): void
    {
        try {
            $maxId = DB::selectOne("SELECT MAX(id) as max_id FROM transactions");
            $newAutoIncrement = max(1, (int) ($maxId->max_id ?? 0) + 1);
            
            // MySQL doesn't support placeholders for ALTER TABLE, so we use
            // intval to ensure it's a safe integer value
            DB::statement("ALTER TABLE transactions AUTO_INCREMENT = " . $newAutoIncrement);
            
            Log::info('Auto-increment repaired for transactions table', [
                'new_auto_increment' => $newAutoIncrement,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to repair auto-increment', [
                'error' => $e->getMessage(),
            ]);
        }
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
        // Validate secret key is configured
        if (empty($this->secretKey)) {
            Log::error('Flip: Secret key is not configured');
            throw new \Exception('Konfigurasi Flip tidak lengkap. Hubungi administrator.');
        }

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

        // Validate course price
        $amount = (int) $course->price;
        if ($amount < 10000) {
            Log::error('Flip: Course price is below minimum', ['price' => $amount]);
            throw new \Exception('Harga kursus minimal Rp 10.000 untuk pembayaran via Flip.');
        }

        // Clean and limit the title (Flip has max 55 chars for title)
        $title = 'Kursus: ' . Str::limit($course->title, 45, '');

        // Build payload according to Flip API documentation
        // Reference: https://docs.flip.id/accept-payment/create-bill
        $payload = [
            'title' => $title,
            'amount' => $amount,
            'type' => 'SINGLE',
            'expired_date' => now()->addHours($expiryHours)->format('Y-m-d H:i'),
            'step' => $step,
            'sender_name' => Str::limit($user->name, 50, ''),
            'sender_email' => $user->email,
        ];

        // Only add optional fields if they are configured
        if (config('flip.is_address_required', false)) {
            $payload['is_address_required'] = 1;
        }

        if (config('flip.is_phone_required', false)) {
            $payload['is_phone_number_required'] = 1;
        }

        // Only include redirect_url if it's a valid public URL
        // Flip rejects localhost URLs - in local dev, users will need to
        // check payment status manually on the payment page
        if (!$isLocalhost) {
            $payload['redirect_url'] = $redirectUrl;
        } else {
            Log::info('Flip: Skipping redirect_url for localhost development');
        }

        // Build the full API URL
        $apiUrl = rtrim($this->baseUrl, '/') . '/pwf/bill';

        Log::info('Creating Flip Bill', [
            'api_url' => $apiUrl,
            'payload' => array_merge($payload, ['sender_email' => '***']),
            'is_production' => $this->isProduction,
        ]);

        try {
            // Make the API request with proper authentication
            // Flip uses Basic Auth with secret_key as username and empty password
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(30)
                ->connectTimeout(10)
                ->asForm()
                ->post($apiUrl, $payload);

            Log::info('Flip API Response', [
                'status_code' => $response->status(),
                'successful' => $response->successful(),
                'body_preview' => Str::limit($response->body(), 500),
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Validate response has required fields
                if (empty($data['link_id']) && empty($data['bill_link_id'])) {
                    Log::error('Flip: Response missing link_id', ['response' => $data]);
                    throw new \Exception('Respons Flip tidak valid: link_id tidak ditemukan.');
                }

                // Ensure link_url has proper https:// prefix
                if (isset($data['link_url']) && !str_starts_with($data['link_url'], 'http')) {
                    $data['link_url'] = 'https://' . $data['link_url'];
                }

                Log::info('Flip Bill Created Successfully', [
                    'link_id' => $data['link_id'] ?? $data['bill_link_id'] ?? null,
                    'link_url' => $data['link_url'] ?? null,
                    'amount' => $data['amount'] ?? null,
                ]);

                return $data;
            }

            // Handle error responses
            $statusCode = $response->status();
            $errorBody = $response->json() ?? [];
            $rawBody = $response->body();

            Log::error('Flip API Error Response', [
                'status_code' => $statusCode,
                'body' => $errorBody,
                'raw_body' => Str::limit($rawBody, 1000),
                'api_url' => $apiUrl,
            ]);

            // Parse error message from response
            $errorMessage = $this->parseFlipErrorMessage($errorBody, $statusCode);

            throw new \Exception('Flip API Error: ' . $errorMessage);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Flip API Connection Failed', [
                'error' => $e->getMessage(),
                'api_url' => $apiUrl,
            ]);
            throw new \Exception('Gagal terhubung ke server Flip. Silakan coba lagi.');
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('Flip API Request Exception', [
                'error' => $e->getMessage(),
                'response' => $e->response?->body(),
            ]);
            throw new \Exception('Gagal menghubungi server Flip: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Flip API Request Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't wrap already formatted exceptions
            if (
                str_starts_with($e->getMessage(), 'Flip API Error:') ||
                str_starts_with($e->getMessage(), 'Gagal') ||
                str_starts_with($e->getMessage(), 'Konfigurasi') ||
                str_starts_with($e->getMessage(), 'Harga') ||
                str_starts_with($e->getMessage(), 'Respons')
            ) {
                throw $e;
            }

            throw new \Exception('Gagal membuat tagihan pembayaran via Flip: ' . $e->getMessage());
        }
    }

    /**
     * Parse error message from Flip API response
     */
    private function parseFlipErrorMessage(array $errorBody, int $statusCode): string
    {
        // Handle specific HTTP status codes
        if ($statusCode === 401) {
            return 'Autentikasi gagal. Periksa konfigurasi FLIP_SECRET_KEY.';
        }

        if ($statusCode === 403) {
            return 'Akses ditolak oleh Flip. Periksa izin akun Flip Anda.';
        }

        if ($statusCode === 404) {
            return 'Endpoint Flip tidak ditemukan. Hubungi administrator.';
        }

        if ($statusCode === 429) {
            return 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.';
        }

        if ($statusCode >= 500) {
            return 'Server Flip sedang mengalami gangguan. Silakan coba lagi nanti.';
        }

        // Parse error message from response body
        if (isset($errorBody['errors']) && is_array($errorBody['errors'])) {
            $messages = [];
            foreach ($errorBody['errors'] as $error) {
                if (is_array($error)) {
                    $messages[] = $error['message'] ?? $error['attribute'] ?? json_encode($error);
                } else {
                    $messages[] = (string) $error;
                }
            }
            $errorMessage = implode(', ', array_filter($messages));
            if (!empty($errorMessage)) {
                return $errorMessage;
            }
        }

        if (isset($errorBody['message'])) {
            return $errorBody['message'];
        }

        if (isset($errorBody['error'])) {
            return is_string($errorBody['error']) ? $errorBody['error'] : json_encode($errorBody['error']);
        }

        if (isset($errorBody['code'])) {
            return 'Error code: ' . $errorBody['code'];
        }

        return 'Terjadi kesalahan tidak diketahui (HTTP ' . $statusCode . ')';
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
