<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use App\Helpers\SharedHostingStorageHelper;

class SharedHostingServiceProvider extends ServiceProvider
{
  /**
   * Register services.
   */
  public function register(): void
  {
    // Bind SharedHostingStorageHelper to the container
    $this->app->singleton('shared-hosting-storage', function ($app) {
      return new SharedHostingStorageHelper();
    });
  }

  /**
   * Bootstrap services.
   */
  public function boot(): void
  {
    // Auto-create storage directories on boot
    $this->ensureStorageDirectoriesExist();

    // Setup storage disk macros for shared hosting
    $this->setupStorageMacros();
  }

  /**
   * Ensure storage directories exist
   */
  protected function ensureStorageDirectoriesExist(): void
  {
    if (config('app.env') === 'production') {
      $directories = [
        'courses',
        'gallery',
        'institutions',
        'materials',
        'other-institutions',
        'profile-photos'
      ];

      foreach ($directories as $dir) {
        $path = public_path('storage/' . $dir);
        if (!file_exists($path)) {
          @mkdir($path, 0755, true);
        }
      }
    }
  }

  /**
   * Setup storage macros for shared hosting
   */
  protected function setupStorageMacros(): void
  {
    // Macro untuk upload file langsung ke public/storage
    Storage::macro('putFileSharedHosting', function ($directory, $file, $name = null) {
      return SharedHostingStorageHelper::uploadFile($file, $directory, 'public');
    });

    // Macro untuk mendapatkan URL file
    Storage::macro('urlSharedHosting', function ($path) {
      return SharedHostingStorageHelper::getFileUrl($path, 'public');
    });

    // Macro untuk cek file exists
    Storage::macro('existsSharedHosting', function ($path) {
      return SharedHostingStorageHelper::fileExists($path, 'public');
    });

    // Macro untuk delete file
    Storage::macro('deleteSharedHosting', function ($path) {
      return SharedHostingStorageHelper::deleteFile($path, 'public');
    });
  }
}
