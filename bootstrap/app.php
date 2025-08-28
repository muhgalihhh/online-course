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
        $exceptions->respond(function ($response, $exception, $request) {
            // List of error codes we have custom pages for
            $customErrorPages = [403, 404, 419, 500, 503];
            $statusCode = $response->getStatusCode();
            
            // Handle Inertia requests
            if ($request->inertia()) {
                // Handle 419 (CSRF token mismatch) specially
                if ($statusCode === 419) {
                    return Inertia::render('errors/419', [
                        'status' => 419
                    ])->toResponse($request)->setStatusCode(419);
                }
                
                // Handle custom error pages
                if (in_array($statusCode, $customErrorPages)) {
                    return Inertia::render('errors/' . $statusCode, [
                        'status' => $statusCode
                    ])->toResponse($request)->setStatusCode($statusCode);
                }
                
                // For other errors, use the generic error page
                if ($statusCode >= 400) {
                    return Inertia::render('errors/index', [
                        'status' => $statusCode,
                        'message' => $exception->getMessage() ?: null
                    ])->toResponse($request)->setStatusCode($statusCode);
                }
            }

            return $response;
        });
    })->create();