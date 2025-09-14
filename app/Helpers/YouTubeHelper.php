<?php

namespace App\Helpers;

class YouTubeHelper
{
  /**
   * Validasi URL YouTube
   */
  public static function isValidYouTubeUrl(string $url): bool
  {
    $pattern = '/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/';
    return preg_match($pattern, $url);
  }

  /**
   * Ekstrak YouTube video ID dari URL
   */
  public static function extractVideoId(string $url): ?string
  {
    $patterns = [
      '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/',
      '/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/',
    ];

    foreach ($patterns as $pattern) {
      if (preg_match($pattern, $url, $matches)) {
        return $matches[1] ?? $matches[2] ?? null;
      }
    }

    return null;
  }

  /**
   * Generate YouTube thumbnail URL
   */
  public static function getThumbnailUrl(string $videoId, string $quality = 'maxresdefault'): string
  {
    return "https://img.youtube.com/vi/{$videoId}/{$quality}.jpg";
  }

  /**
   * Generate YouTube embed URL
   */
  public static function getEmbedUrl(string $videoId, array $params = []): string
  {
    $baseUrl = "https://www.youtube.com/embed/{$videoId}";

    if (!empty($params)) {
      $baseUrl .= '?' . http_build_query($params);
    }

    return $baseUrl;
  }

  /**
   * Generate YouTube watch URL
   */
  public static function getWatchUrl(string $videoId): string
  {
    return "https://www.youtube.com/watch?v={$videoId}";
  }

  /**
   * Cek apakah video ID valid (11 karakter alphanumeric)
   */
  public static function isValidVideoId(string $videoId): bool
  {
    return preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId);
  }
}
