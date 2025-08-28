<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CorsMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Add CORS headers for ngrok
        $middleware->append(CorsMiddleware::class);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'auth' => \App\Http\Middleware\EnsureAuthenticated::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        ]);
        $middleware->redirectGuestsTo('/login');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle authentication exceptions
        $exceptions->respond(function (AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 401);
            }

            return redirect()->guest(route('login'))
                ->with('error', 'Anda harus login untuk mengakses halaman ini.');
        });

        // Handle Inertia error pages
        $exceptions->respond(function ($response, $exception, $request) {
            // Show custom error pages for common HTTP status codes
            if (in_array($response->getStatusCode(), [403, 404, 419, 500, 503])) {
                if ($request->inertia()) {
                    // Special handling for 419 (session expired)
                    if ($response->getStatusCode() === 419) {
                        return back()->with([
                            'error' => 'Sesi telah berakhir. Silakan refresh halaman.',
                        ]);
                    }
                    
                    // Render the appropriate error page
                    return Inertia::render('errors/' . $response->getStatusCode(), [
                        'status' => $response->getStatusCode()
                    ])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
                }
            }

            return $response;
        });
    })->create();