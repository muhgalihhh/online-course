<?php

namespace App\Http\Middleware;

use App\Services\MidtransService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyMidtransWebhook
{
    public function __construct(private readonly MidtransService $midtrans)
    {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $payload = $request->all();

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signature = (string) ($payload['signature_key'] ?? '');

        // Log the webhook request for debugging
        Log::info('Midtrans webhook received', [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => $payload['transaction_status'] ?? null,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Check required fields
        if (!$orderId || !$statusCode || !$grossAmount || !$signature) {
            Log::warning('Midtrans webhook missing required fields', [
                'order_id' => $orderId,
                'status_code' => $statusCode,
                'gross_amount' => $grossAmount,
                'has_signature' => !empty($signature),
                'payload' => $payload,
            ]);

            return response()->json(['message' => 'Invalid payload'], 400);
        }

        // Verify signature
        if (!$this->midtrans->verifySignature($orderId, $statusCode, $grossAmount, $signature)) {
            Log::warning('Midtrans webhook signature verification failed', [
                'order_id' => $orderId,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['message' => 'Invalid signature'], 403);
        }

        Log::info('Midtrans webhook signature verified successfully', [
            'order_id' => $orderId,
        ]);

        return $next($request);
    }
}
