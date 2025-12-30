<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class PaymentGatewayManager
{
    private array $gateways = [];
    private ?string $defaultGateway = null;

    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly FlipService $flip
    ) {
        $this->defaultGateway = (string) config('services.payment.default', 'midtrans');

        Log::info('PaymentGatewayManager initialized', [
            'default_gateway' => $this->defaultGateway,
        ]);
    }

    /**
     * Get the default payment gateway
     */
    public function getDefaultGateway(): string
    {
        return $this->defaultGateway ?? 'midtrans';
    }

    /**
     * Get a specific gateway instance
     */
    public function gateway(?string $name = null): MidtransService|FlipService
    {
        $gatewayName = $name ?? $this->defaultGateway;

        return match ($gatewayName) {
            'flip' => $this->flip,
            'midtrans' => $this->midtrans,
            default => throw new InvalidArgumentException("Unknown payment gateway: {$gatewayName}"),
        };
    }

    /**
     * Get the Midtrans gateway
     */
    public function midtrans(): MidtransService
    {
        return $this->midtrans;
    }

    /**
     * Get the Flip gateway
     */
    public function flip(): FlipService
    {
        return $this->flip;
    }

    /**
     * Check if Flip is the default gateway
     */
    public function isFlipDefault(): bool
    {
        return $this->defaultGateway === 'flip';
    }

    /**
     * Check if Midtrans is the default gateway
     */
    public function isMidtransDefault(): bool
    {
        return $this->defaultGateway === 'midtrans';
    }

    /**
     * Get list of available gateways
     */
    public function availableGateways(): array
    {
        return ['midtrans', 'flip'];
    }

    /**
     * Check if gateway is valid
     */
    public function isValidGateway(string $name): bool
    {
        return in_array($name, $this->availableGateways(), true);
    }
}
