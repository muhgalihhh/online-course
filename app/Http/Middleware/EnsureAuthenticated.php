<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class EnsureAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            // Don't store intended URL for API routes
            if (!$request->is('api/*')) {
                session(['url.intended' => $request->url()]);
            }

            // For Inertia requests
            if ($request->inertia()) {
                return Inertia::location(route('login'));
            }

            // For API requests
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            // For regular requests
            return redirect()->route('login');
        }

        return $next($request);
    }
}
