<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;

        if (!in_array($userRole, $roles)) {
            // Log for debugging
            Log::info('RoleMiddleware: Access denied', [
                'user_id' => $request->user()->id,
                'user_role' => $userRole,
                'required_roles' => $roles,
                'url' => $request->url(),
                'is_inertia' => $request->inertia(),
                'headers' => $request->headers->all()
            ]);

            // For Inertia requests, return an Inertia error response
            if ($request->inertia()) {
                return Inertia::render('errors/403', [
                    'status' => 403,
                    'message' => 'Anda tidak memiliki akses ke halaman ini.'
                ])->toResponse($request)->setStatusCode(403);
            }

            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
