<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): BaseResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        // Check if there's an intended URL
        $intended = session()->pull('url.intended');

        // Normalize and validate intended URL against role
        if ($intended) {
            // Disallow API as landing pages
            if (str_starts_with($intended, url('/api'))) {
                $intended = null;
            } else {
                $isAdmin = $user->isAdmin();
                $isAdminArea = str_starts_with($intended, url('/admin'));
                $isUserArea = str_starts_with($intended, url('/user'));

                // If role and intended area mismatch, ignore intended
                if ($isAdmin && $isUserArea) {
                    $intended = null;
                } elseif (!$isAdmin && $isAdminArea) {
                    $intended = null;
                }
            }
        }

        // For Inertia requests, return a proper Inertia response
        if ($request->inertia()) {
            if ($intended) {
                return Inertia::location($intended);
            }

            // Redirect based on role for Inertia requests
            return Inertia::location($user->isAdmin() ? route('admin.dashboard') : route('user.dashboard'));
        }

        // For regular requests, use standard redirects
        if ($intended) {
            return redirect($intended);
        }

        // Otherwise, redirect based on role
        return redirect()->route($user->isAdmin() ? 'admin.dashboard' : 'user.dashboard')
            ->with('success', 'Selamat datang kembali, ' . $user->name . '!');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
