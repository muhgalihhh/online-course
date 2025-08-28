<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

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
            // Store the intended URL
            session(['url.intended' => $request->url()]);
            
            // For Inertia requests
            if ($request->inertia()) {
                return redirect()->route('login')
                    ->with('error', 'Silakan login terlebih dahulu untuk mengakses halaman ini.');
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