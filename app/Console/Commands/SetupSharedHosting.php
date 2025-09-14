<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Helpers\SharedHostingStorageHelper;
use Illuminate\Support\Facades\File;

class SetupSharedHosting extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'setup:shared-hosting
                           {--force : Force setup even if already configured}
                           {--skip-storage : Skip storage link creation}
                           {--skip-permissions : Skip permission settings}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Setup Laravel application for shared hosting environment';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('🚀 Setting up Laravel for shared hosting...');
    $this->newLine();

    // Check if we're in production
    if (config('app.env') !== 'production' && !$this->option('force')) {
      $this->warn('⚠️  This command should only be run in production environment.');
      if (!$this->confirm('Continue anyway?')) {
        return;
      }
    }

    $steps = [
      'checkRequirements',
      'setupStorage',
      'setPermissions',
      'optimizeApplication',
      'verifySetup'
    ];

    foreach ($steps as $step) {
      if ($step === 'setupStorage' && $this->option('skip-storage')) {
        $this->info('⏭️  Skipping storage setup...');
        continue;
      }

      if ($step === 'setPermissions' && $this->option('skip-permissions')) {
        $this->info('⏭️  Skipping permissions setup...');
        continue;
      }

      $this->$step();
    }

    $this->newLine();
    $this->info('✅ Shared hosting setup completed successfully!');
    $this->info('📝 Don\'t forget to:');
    $this->info('   • Update your .env file with production settings');
    $this->info('   • Set APP_DEBUG=false and APP_ENV=production');
    $this->info('   • Configure your database credentials');
    $this->info('   • Point your domain to the public/ folder');
  }

  protected function checkRequirements()
  {
    $this->info('🔍 Checking requirements...');

    $checks = [
      'PHP Version' => version_compare(PHP_VERSION, '8.1.0', '>='),
      'Laravel Installation' => class_exists('Illuminate\Foundation\Application'),
      'Storage Directory' => is_dir(storage_path()),
      'Public Directory' => is_dir(public_path()),
      'Writable Storage' => is_writable(storage_path()),
      'Writable Bootstrap Cache' => is_writable(base_path('bootstrap/cache'))
    ];

    foreach ($checks as $check => $status) {
      if ($status) {
        $this->info("  ✅ {$check}");
      } else {
        $this->error("  ❌ {$check}");
      }
    }

    $this->newLine();
  }

  protected function setupStorage()
  {
    $this->info('🔗 Setting up storage...');

    try {
      // Create storage directories if they don't exist
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
        if (!File::exists($path)) {
          File::makeDirectory($path, 0755, true);
          $this->info("  ✅ Created directory: storage/{$dir}");
        }
      }

      // Setup storage link
      if (SharedHostingStorageHelper::createStorageLink()) {
        $this->info('  ✅ Storage link created successfully');
      } else {
        $this->warn('  ⚠️  Storage link creation failed, but directories are ready');
      }

      // Copy existing files from storage/app/public if exists
      $sourceDir = storage_path('app/public');
      $targetDir = public_path('storage');

      if (File::exists($sourceDir) && File::isDirectory($sourceDir)) {
        $this->copyDirectory($sourceDir, $targetDir);
        $this->info('  ✅ Copied files from storage/app/public to public/storage');
      }

    } catch (\Exception $e) {
      $this->error("  ❌ Storage setup failed: {$e->getMessage()}");
    }

    $this->newLine();
  }

  protected function setPermissions()
  {
    $this->info('🔐 Setting permissions...');

    if (PHP_OS_FAMILY !== 'Windows') {
      $commands = [
        'chmod -R 755 ' . base_path(),
        'chmod -R 775 ' . storage_path(),
        'chmod -R 775 ' . base_path('bootstrap/cache'),
        'chmod 644 ' . base_path('.env')
      ];

      foreach ($commands as $command) {
        exec($command, $output, $returnCode);
        if ($returnCode === 0) {
          $this->info("  ✅ {$command}");
        } else {
          $this->warn("  ⚠️  {$command} (may need manual setting)");
        }
      }
    } else {
      $this->info('  ℹ️  Windows detected - permissions may need manual setting on server');
    }

    $this->newLine();
  }

  protected function optimizeApplication()
  {
    $this->info('⚡ Optimizing application...');

    $commands = [
      'config:clear' => 'Clear configuration cache',
      'cache:clear' => 'Clear application cache',
      'view:clear' => 'Clear view cache',
      'route:clear' => 'Clear route cache'
    ];

    foreach ($commands as $command => $description) {
      $this->call($command);
      $this->info("  ✅ {$description}");
    }

    // Only cache in production
    if (config('app.env') === 'production') {
      $cacheCommands = [
        'config:cache' => 'Cache configuration',
        'route:cache' => 'Cache routes',
        'view:cache' => 'Cache views'
      ];

      foreach ($cacheCommands as $command => $description) {
        $this->call($command);
        $this->info("  ✅ {$description}");
      }
    }

    $this->newLine();
  }

  protected function verifySetup()
  {
    $this->info('🔍 Verifying setup...');

    $verifications = [
      'Public storage exists' => File::exists(public_path('storage')),
      'Storage is accessible' => is_readable(public_path('storage')),
      'Can write to storage' => is_writable(storage_path()),
      'Bootstrap cache writable' => is_writable(base_path('bootstrap/cache'))
    ];

    foreach ($verifications as $check => $status) {
      if ($status) {
        $this->info("  ✅ {$check}");
      } else {
        $this->warn("  ⚠️  {$check} - may need manual fix");
      }
    }

    // Check storage disk
    try {
      Storage::disk('public')->put('test.txt', 'test');
      if (Storage::disk('public')->exists('test.txt')) {
        Storage::disk('public')->delete('test.txt');
        $this->info('  ✅ Storage disk working correctly');
      }
    } catch (\Exception $e) {
      $this->warn("  ⚠️  Storage disk test failed: {$e->getMessage()}");
    }

    $this->newLine();
  }

  protected function copyDirectory($source, $destination)
  {
    if (!File::exists($destination)) {
      File::makeDirectory($destination, 0755, true);
    }

    $files = File::allFiles($source);

    foreach ($files as $file) {
      $relativePath = $file->getRelativePathname();
      $targetPath = $destination . DIRECTORY_SEPARATOR . $relativePath;
      $targetDir = dirname($targetPath);

      if (!File::exists($targetDir)) {
        File::makeDirectory($targetDir, 0755, true);
      }

      if (!File::exists($targetPath)) {
        File::copy($file->getPathname(), $targetPath);
      }
    }
  }
}
