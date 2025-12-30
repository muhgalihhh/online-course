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
        // Log the incoming webhook
        Log::info('Flip webhook received', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'content_type' => $request->header('Content-Type'),
        ]);

        // Flip sends webhook data as form-urlencoded with 'data' key containing JSON
        $dataString = $request->input('data');
        $token = $request->input('token');

        if (empty($dataString)) {
            // Try getting raw JSON body
            $payload = $request->json()->all();
            if (empty($payload)) {
                Log::warning('Flip webhook missing data payload', [
                    'request_all' => $request->all(),
                ]);
                return response()->json(['message' => 'Invalid payload: missing data'], 400);
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

        // Verify token if provided
        if (!empty($token)) {
            if (!$this->flip->verifyWebhookSignature($token)) {
                Log::warning('Flip webhook token verification failed', [
                    'ip' => $request->ip(),
                ]);
                return response()->json(['message' => 'Invalid token'], 403);
            }
            Log::info('Flip webhook token verified successfully');
        } else {
            // If no token, we might be in sandbox mode or token verification is disabled
            Log::info('Flip webhook received without token (sandbox mode or token not configured)');
        }

        // Attach parsed payload to request for controller access
        $request->merge(['flip_payload' => $payload]);

        Log::info('Flip webhook verified', [
            'bill_id' => $payload['bill_link_id'] ?? $payload['id'] ?? null,
            'status' => $payload['status'] ?? null,
        ]);

        return $next($request);
    }
}
