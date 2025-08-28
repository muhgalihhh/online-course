<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, return null (will throw AuthenticationException)
        if ($request->expectsJson()) {
            return null;
        }

        // For Inertia requests, redirect to login
        if ($request->inertia()) {
            return route('login');
        }

        // For regular web requests, redirect to login
        return route('login');
    }
}