<?php

namespace App\Rules;

use App\Helpers\YouTubeHelper;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class YouTubeUrl implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('The :attribute must be a valid URL string.');
            return;
        }

        // Cek apakah URL valid secara format
        if (!filter_var($value, FILTER_VALIDATE_URL)) {
            $fail('The :attribute must be a valid URL.');
            return;
        }

        // Cek apakah URL adalah YouTube URL yang valid
        if (!YouTubeHelper::isValidYouTubeUrl($value)) {
            $fail('The :attribute must be a valid YouTube URL.');
            return;
        }

        // Cek apakah bisa ekstrak video ID
        $videoId = YouTubeHelper::extractVideoId($value);
        if (!$videoId || !YouTubeHelper::isValidVideoId($videoId)) {
            $fail('The :attribute contains an invalid YouTube video ID.');
            return;
        }
    }
}
