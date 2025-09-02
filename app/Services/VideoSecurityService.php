<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;

class VideoSecurityService
{
    /**
     * Generate secure video URL with expiration
     */
    public function generateSecureVideoUrl($materialId, $userId, $expirationMinutes = null)
    {
        $expirationMinutes = $expirationMinutes ?? config('video_security.token_expiration', 120);

        $payload = [
            'material_id' => $materialId,
            'user_id' => $userId,
            'expires_at' => Carbon::now()->addMinutes($expirationMinutes)->timestamp,
            'hash' => hash('sha256', $materialId . $userId . config('app.key'))
        ];

        $encrypted = Crypt::encrypt($payload);

        return route('secure.video.stream', ['token' => urlencode($encrypted)]);
    }

    /**
     * Validate and decode secure video token
     */
    public function validateSecureToken($token)
    {
        try {
            $payload = Crypt::decrypt(urldecode($token));

            // Check expiration
            if (Carbon::now()->timestamp > $payload['expires_at']) {
                return false;
            }

            // Verify hash
            $expectedHash = hash('sha256', $payload['material_id'] . $payload['user_id'] . config('app.key'));
            if ($payload['hash'] !== $expectedHash) {
                return false;
            }

            return $payload;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Generate secure YouTube embed URL
     */
    public function generateSecureYouTubeUrl($youtubeUrl, $materialId, $userId)
    {
        // Extract video ID from YouTube URL
        $videoId = $this->extractYouTubeVideoId($youtubeUrl);
        if (!$videoId) {
            return null;
        }

        // Create secure parameters
        $params = [
            'material_id' => $materialId,
            'user_id' => $userId,
            'video_id' => $videoId,
            'timestamp' => time()
        ];

        $signature = hash_hmac('sha256', http_build_query($params), config('app.key'));

        return route('secure.youtube.embed', array_merge($params, ['signature' => $signature]));
    }

    /**
     * Extract YouTube video ID from URL
     */
    public function extractYouTubeVideoId($url)
    {
        $patterns = [
            '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/',
            '/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Generate anti-piracy watermark data
     */
    public function generateWatermarkData($userId, $courseName)
    {
        $user = auth()->user();
        $watermarkText = $user->name . ' - ' . $courseName . ' - ' . date('Y-m-d H:i');

        return [
            'text' => $watermarkText,
            'position' => config('video_security.watermark.position', 'bottom-right'),
            'opacity' => config('video_security.watermark.opacity', 0.7),
            'color' => config('video_security.watermark.color', 'rgba(255, 255, 255, 0.8)')
        ];
    }
}
