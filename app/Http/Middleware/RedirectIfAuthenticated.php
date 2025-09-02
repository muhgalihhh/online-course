<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                /** @var \App\Models\User $user */
                $user = Auth::guard($guard)->user();

                // For Inertia requests
                if ($request->inertia()) {
                    if ($user->isAdmin()) {
                        return Inertia::location(route('admin.dashboard'));
                    }
                    return Inertia::location(route('user.dashboard'));
                }

                // For regular requests
                if ($user->isAdmin()) {
                    return redirect()->route('admin.dashboard');
                }

                return redirect()->route('user.dashboard');
            }
        }

        return $next($request);
    }
}
