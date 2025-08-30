<?php

namespace App\Http\Middleware;

use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Handle the incoming request.
     */
    public function handle(Request $request, \Closure $next): Response
    {
        // Skip Inertia processing for API routes
        if ($request->is('api/*')) {
            return $next($request);
        }

        return parent::handle($request, $next);
    }

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'is_admin' => $request->user()->isAdmin(),
                    'is_user' => $request->user()->isUser(),
                    'profile_photo_url' => $request->user()->profile_photo_url,
                ] : null,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'institution' => fn() => Institution::first(),
            'url' => $request->path() ? '/' . $request->path() : '/',
        ];
    }

    /**
     * Determines what props should be always available on error pages.
     *
     * @see https://inertiajs.com/error-handling
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function resolveValidationErrors(Request $request)
    {
        if (!$request->hasSession() || !$request->session()->has('errors')) {
            return [];
        }

        return collect($request->session()->get('errors')->getBags())->mapWithKeys(function ($bag, $key) {
            return [$key === 'default' ? 'errors' : $key => $bag->messages()];
        })->all();
    }
}
