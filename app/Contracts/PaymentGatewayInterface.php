<?php

namespace App\Contracts;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\User;

interface PaymentGatewayInterface
{
    /**
     * Create a transaction for course purchase
     *
     * @return array{
     *     order_id?: string,
     *     bill_id?: string,
     *     snap_token?: string,
     *     payment_url?: string,
     *     redirect_url?: string,
     *     transaction: Transaction|null,
     *     is_existing: bool
     * }
     */
    public function createCourseTransaction(User $user, Course $course): array;

    /**
     * Get transaction status
     *
     * @return array{
     *     status: string,
     *     is_expired: bool
     * }|null
     */
    public function getTransactionStatus(string $transactionId): ?array;

    /**
     * Map gateway-specific status to local application status
     */
    public function mapStatus(string $gatewayStatus): string;

    /**
     * Check if status is still active (not final)
     */
    public function isActiveStatus(string $status): bool;

    /**
     * Cancel a transaction
     */
    public function cancelTransaction(string $transactionId): bool;

    /**
     * Get the gateway name
     */
    public function getName(): string;
}
