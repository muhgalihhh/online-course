<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\HandlePrefixRedirect;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Add CORS headers for ngrok
        $middleware->append(CorsMiddleware::class);

        $middleware->web(append: [
            HandleAppearance::class,
            HandlePrefixRedirect::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'auth' => \App\Http\Middleware\EnsureAuthenticated::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'midtrans.webhook' => \App\Http\Middleware\VerifyMidtransWebhook::class,
            'force.json' => \App\Http\Middleware\ForceJsonResponse::class,
            'anti.piracy' => \App\Http\Middleware\AntiPiracyMiddleware::class,
            'prevent.admin' => \App\Http\Middleware\PreventAdminAccess::class,
        ]);
        $middleware->redirectGuestsTo('/login');

        // Exclude Midtrans webhook from CSRF verification
        $middleware->validateCsrfTokens(except: [
            '/payments/midtrans/webhook',
            '/api/callback/flip'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle NotFoundHttpException (404 errors)
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->wantsJson() || $request->inertia()) {
                return Inertia::render('errors/404', [
                    'status' => 404
                ])->toResponse($request)->setStatusCode(404);
            }
        });

        // Handle AuthenticationException
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->wantsJson() || $request->inertia()) {
                return Inertia::render('errors/403', [
                    'status' => 403,
                    'message' => 'Unauthenticated.'
                ])->toResponse($request)->setStatusCode(403);
            }
        });

        // Handle any HttpException (403, 419, 500, 503, etc.)
        $exceptions->render(function (HttpException $e, $request) {
            if ($request->wantsJson() || $request->inertia()) {
                $statusCode = $e->getStatusCode();
                $customErrorPages = [403, 404, 419, 500, 503];

                // Log debugging info
                Log::info('HttpException caught in exception handler', [
                    'status' => $statusCode,
                    'message' => $e->getMessage(),
                    'url' => $request->url(),
                    'is_inertia' => $request->inertia(),
                    'wants_json' => $request->wantsJson(),
                    'user_id' => $request->user() ? $request->user()->id : null,
                ]);

                // Use specific error page if available
                if (in_array($statusCode, $customErrorPages)) {
                    return Inertia::render('errors/' . $statusCode, [
                        'status' => $statusCode
                    ])->toResponse($request)->setStatusCode($statusCode);
                }

                // For other HTTP errors, use the generic error page
                return Inertia::render('errors/index', [
                    'status' => $statusCode,
                    'message' => $e->getMessage() ?: null
                ])->toResponse($request)->setStatusCode($statusCode);
            }
        });

        // Handle any other exception (but skip ValidationException and other framework exceptions)
        $exceptions->render(function (\Throwable $e, $request) {
            // Don't handle ValidationException - let it be handled by Laravel's default validation handling
            if ($e instanceof ValidationException) {
                return null; // Return null to let Laravel handle it normally
            }

            // Don't handle AuthenticationException - it has its own handler above
            if ($e instanceof AuthenticationException) {
                return null;
            }

            // Don't handle HttpException - it has its own handler above
            if ($e instanceof HttpException) {
                return null;
            }

            // Only handle actual server errors (500) for unexpected exceptions
            if ($request->wantsJson() || $request->inertia()) {
                // In production, don't expose internal errors
                $isDebug = config('app.debug');

                return Inertia::render('errors/500', [
                    'status' => 500,
                    'message' => $isDebug ? $e->getMessage() : 'Server Error'
                ])->toResponse($request)->setStatusCode(500);
            }
        });

        $exceptions->respond(function ($response, $exception, $request) {
            // Skip validation errors - they should be handled by Inertia automatically
            if ($exception instanceof ValidationException) {
                return $response;
            }

            // List of error codes we have custom pages for
            $customErrorPages = [403, 404, 419, 500, 503];
            $statusCode = $response->getStatusCode();

            // Handle Inertia requests
            if ($request->inertia()) {
                // Don't interfere with 422 validation errors
                if ($statusCode === 422) {
                    return $response;
                }

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
