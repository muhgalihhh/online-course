<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\SharedHostingStorageHelper;
use Illuminate\Support\Facades\Log;

class EnsureStorageExists
{
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
   * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
   */
  public function handle(Request $request, Closure $next)
  {
    // Only run in production environment
    if (config('app.env') === 'production') {
      $this->ensureStorageSetup();
    }

    return $next($request);
  }

  /**
   * Ensure storage is properly setup
   */
  protected function ensureStorageSetup(): void
  {
    try {
      $storagePublic = public_path('storage');

      // Check if public/storage exists
      if (!file_exists($storagePublic)) {
        // Try to create storage link
        SharedHostingStorageHelper::createStorageLink();

        Log::info('Storage link created automatically by EnsureStorageExists middleware');
      }

      // Ensure key directories exist
      $directories = [
        'courses',
        'gallery',
        'institutions',
        'materials',
        'other-institutions',
        'profile-photos'
      ];

      foreach ($directories as $dir) {
        $path = $storagePublic . '/' . $dir;
        if (!file_exists($path)) {
          @mkdir($path, 0755, true);
        }
      }

    } catch (\Exception $e) {
      Log::warning('EnsureStorageExists middleware failed: ' . $e->getMessage());
    }
  }
}
