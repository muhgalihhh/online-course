<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Get the origin from the request
        $origin = $request->header('Origin');
        
        // Allow specific origins for ngrok
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'https://*.ngrok-free.app',
            'https://*.ngrok.io',
            'https://*.ngrok.app',
            'https://*.ngrok.dev',
            'https://*.ngrok.com',
        ];

        // Check if origin is allowed
        $isAllowed = false;
        foreach ($allowedOrigins as $allowedOrigin) {
            if (str_contains($allowedOrigin, '*')) {
                $pattern = str_replace('*', '.*', $allowedOrigin);
                if (preg_match('#^' . $pattern . '$#', $origin)) {
                    $isAllowed = true;
                    break;
                }
            } elseif ($allowedOrigin === $origin) {
                $isAllowed = true;
                break;
            }
        }

        // Set CORS headers
        if ($isAllowed) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin, Cache-Control');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400'); // 24 hours
        
        // Additional headers for ngrok
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            $response->setStatusCode(200);
            $response->setContent('');
            $response->headers->set('Content-Length', '0');
        }

        return $response;
    }
}
