<?php

namespace App\Http\Middleware;

use App\Services\FlipService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyFlipWebhook
{
    public function __construct(private readonly FlipService $flip)
    {
    }

    /**
     * Handle an incoming Flip webhook request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log the incoming webhook with full details
        Log::info('Flip webhook received', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'all_headers' => $request->headers->all(),
            'all_input' => $request->all(),
        ]);

        // Flip sends webhook data as form-urlencoded with 'data' key containing JSON
        $dataString = $request->input('data');
        $token = $request->input('token');

        if (empty($dataString)) {
            // Try getting raw JSON body
            $payload = $request->json()->all();
            if (empty($payload)) {
                // Also try getting all input as payload (for test webhooks)
                $payload = $request->all();

                // If still empty, log and return error
                if (empty($payload) || count($payload) === 0) {
                    Log::warning('Flip webhook missing data payload', [
                        'request_all' => $request->all(),
                        'content' => $request->getContent(),
                    ]);

                    // For sandbox/test mode, allow empty payload
                    if (config('flip.is_production') === false) {
                        Log::info('Flip webhook: Allowing empty payload in sandbox mode');
                        $payload = ['test' => true];
                    } else {
                        return response()->json(['message' => 'Invalid payload: missing data'], 400);
                    }
                }
            }
        } else {
            // Parse the JSON data string
            $payload = json_decode($dataString, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('Flip webhook invalid JSON in data field', [
                    'data_string' => $dataString,
                    'json_error' => json_last_error_msg(),
                ]);
                return response()->json(['message' => 'Invalid JSON in data field'], 400);
            }
        }

        // Verify token if provided and if we have a validation token configured
        $validationToken = config('flip.validation_token');

        if (!empty($token) && !empty($validationToken)) {
            if (!$this->flip->verifyWebhookSignature($token)) {
                Log::warning('Flip webhook token verification failed', [
                    'ip' => $request->ip(),
                    'provided_token' => substr($token, 0, 10) . '...',
                ]);

                // In sandbox mode, just warn but don't reject
                if (config('flip.is_production') === false) {
                    Log::warning('Flip webhook: Token mismatch but allowing in sandbox mode');
                } else {
                    return response()->json(['message' => 'Invalid token'], 403);
                }
            } else {
                Log::info('Flip webhook token verified successfully');
            }
        } else {
            // If no token provided or validation token not configured
            if (empty($validationToken)) {
                Log::info('Flip webhook: Validation token not configured, skipping verification');
            } else {
                Log::info('Flip webhook received without token (test webhook from dashboard)');
            }
        }

        // Attach parsed payload to request for controller access
        $request->merge(['flip_payload' => $payload]);

        Log::info('Flip webhook verified and proceeding', [
            'bill_id' => $payload['bill_link_id'] ?? $payload['id'] ?? null,
            'status' => $payload['status'] ?? null,
            'payload_keys' => array_keys($payload),
        ]);

        return $next($request);
    }
}
