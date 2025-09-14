<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class SharedHostingStorageHelper
{
  /**
   * Upload file ke storage dengan konfigurasi shared hosting
   *
   * @param UploadedFile $file
   * @param string $directory
   * @param string $disk
   * @return string|false
   */
  public static function uploadFile(UploadedFile $file, string $directory, string $disk = 'public')
  {
    try {
      // Buat direktori jika belum ada
      $storagePath = public_path('storage/' . $directory);
      if (!file_exists($storagePath)) {
        mkdir($storagePath, 0755, true);
      }

      // Generate nama file unik
      $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
      $filePath = $directory . '/' . $fileName;

      // Upload file
      if ($disk === 'public') {
        // Langsung simpan ke public/storage
        $file->move($storagePath, $fileName);
        return $filePath;
      } else {
        // Gunakan Storage facade untuk disk lain
        return Storage::disk($disk)->putFileAs($directory, $file, $fileName);
      }
    } catch (\Exception $e) {
      Log::error('File upload failed: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Hapus file dari storage
   *
   * @param string $filePath
   * @param string $disk
   * @return bool
   */
  public static function deleteFile(string $filePath, string $disk = 'public'): bool
  {
    try {
      if ($disk === 'public') {
        $fullPath = public_path('storage/' . $filePath);
        if (file_exists($fullPath)) {
          return unlink($fullPath);
        }
        return true;
      } else {
        return Storage::disk($disk)->delete($filePath);
      }
    } catch (\Exception $e) {
      Log::error('File deletion failed: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Dapatkan URL file
   *
   * @param string $filePath
   * @param string $disk
   * @return string
   */
  public static function getFileUrl(string $filePath, string $disk = 'public'): string
  {
    if ($disk === 'public') {
      return asset('storage/' . $filePath);
    } else {
      return Storage::disk($disk)->path($filePath);
    }
  }

  /**
   * Cek apakah file exists
   *
   * @param string $filePath
   * @param string $disk
   * @return bool
   */
  public static function fileExists(string $filePath, string $disk = 'public'): bool
  {
    if ($disk === 'public') {
      return file_exists(public_path('storage/' . $filePath));
    } else {
      return Storage::disk($disk)->exists($filePath);
    }
  }

  /**
   * Buat symbolic link untuk storage (untuk shared hosting)
   *
   * @return bool
   */
  public static function createStorageLink(): bool
  {
    try {
      $target = storage_path('app/public');
      $link = public_path('storage');

      // Hapus link lama jika ada
      if (is_link($link)) {
        unlink($link);
      }

      // Buat direktori target jika belum ada
      if (!file_exists($target)) {
        mkdir($target, 0755, true);
      }

      // Untuk shared hosting, kadang symbolic link tidak berfungsi
      // Jadi kita copy saja isinya
      if (!is_link($link) && !file_exists($link)) {
        // Coba buat symbolic link dulu
        if (function_exists('symlink') && symlink($target, $link)) {
          return true;
        }

        // Jika gagal, buat direktori biasa dan copy file
        mkdir($link, 0755, true);
        self::recursiveCopy($target, $link);
        return true;
      }

      return true;
    } catch (\Exception $e) {
      Log::error('Storage link creation failed: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Copy direktori secara recursive
   *
   * @param string $src
   * @param string $dst
   */
  private static function recursiveCopy(string $src, string $dst): void
  {
    $dir = opendir($src);
    if (!file_exists($dst)) {
      mkdir($dst, 0755, true);
    }

    while (($file = readdir($dir)) !== false) {
      if (($file != '.') && ($file != '..')) {
        if (is_dir($src . '/' . $file)) {
          self::recursiveCopy($src . '/' . $file, $dst . '/' . $file);
        } else {
          copy($src . '/' . $file, $dst . '/' . $file);
        }
      }
    }
    closedir($dir);
  }

  /**
   * Dapatkan ukuran direktori storage
   *
   * @param string $directory
   * @return int bytes
   */
  public static function getDirectorySize(string $directory = ''): int
  {
    $path = public_path('storage/' . $directory);
    $size = 0;

    if (is_dir($path)) {
      foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path)) as $file) {
        $size += $file->getSize();
      }
    }

    return $size;
  }

  /**
   * Format ukuran file menjadi human readable
   *
   * @param int $bytes
   * @return string
   */
  public static function formatFileSize(int $bytes): string
  {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];

    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
      $bytes /= 1024;
    }

    return round($bytes, 2) . ' ' . $units[$i];
  }
}
