<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AntiPiracyMiddleware
{
  /**
   * Handle an incoming request.
   */
  public function handle(Request $request, Closure $next): Response
  {
    // Check if the request is for a video-related route
    $protectedRoutes = [
      'secure.video.stream',
      'secure.youtube.embed',
      'courses.learn'
    ];

    if (in_array($request->route()->getName(), $protectedRoutes)) {
      // Add security headers
      $response = $next($request);

      if ($response instanceof \Illuminate\Http\Response || $response instanceof \Illuminate\Http\JsonResponse) {
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        // Prevent embedding in external sites
        $response->headers->set(
          'Content-Security-Policy',
          "frame-ancestors 'self'; " .
          "default-src 'self'; " .
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.youtube.com https://*.google.com; " .
          "frame-src 'self' https://*.youtube.com; " .
          "img-src 'self' data: https:; " .
          "media-src 'self' blob:; " .
          "style-src 'self' 'unsafe-inline';"
        );
      }

      return $response;
    }

    return $next($request);
  }
}
