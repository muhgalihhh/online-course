<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PreventAdminAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated and is admin
        if (Auth::check() && Auth::user()->isAdmin()) {
            // If it's an AJAX request, return JSON error
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Admin tidak diperbolehkan untuk mendaftar kelas atau melakukan pembayaran.',
                    'error' => 'Access denied for admin users'
                ], 403);
            }

            // For regular requests, redirect with error message
            return redirect()->route('admin.dashboard')
                ->with('error', 'Admin tidak diperbolehkan untuk mendaftar kelas atau mengakses fitur pembayaran.');
        }

        return $next($request);
    }
}
