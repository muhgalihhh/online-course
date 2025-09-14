<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'file_path',
        'file_type',
        'youtube_url',
        'video_source',
        'is_active',
    ];

    // Append computed attributes automatically when model serialized
    protected $appends = [
        'file_url',
        'youtube_video_id',
        'youtube_thumbnail',
        'youtube_embed_url',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    // Konstanta untuk file type
    const TYPE_IMAGE = 'image';
    const TYPE_VIDEO = 'video';

    // Konstanta untuk video source
    const VIDEO_SOURCE_FILE = 'file';
    const VIDEO_SOURCE_YOUTUBE = 'youtube';

    // Scope untuk media aktif
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    // Scope untuk filter berdasarkan tipe
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('file_type', $type);
    }

    // Accessor untuk mendapatkan URL file
    public function getFileUrlAttribute(): ?string
    {
        // Jika video YouTube atau file_path kosong, tidak ada file URL lokal
        if ($this->isYouTubeVideo() || empty($this->file_path)) {
            return null;
        }
        return asset('storage/' . ltrim($this->file_path, '/'));
    }

    // Method untuk mendapatkan semua tipe file yang valid
    public static function getValidFileTypes(): array
    {
        return [self::TYPE_IMAGE, self::TYPE_VIDEO];
    }

    // Method untuk cek apakah file adalah gambar
    public function isImage(): bool
    {
        return $this->file_type === self::TYPE_IMAGE;
    }

    // Method untuk cek apakah file adalah video
    public function isVideo(): bool
    {
        return $this->file_type === self::TYPE_VIDEO;
    }

    // Method untuk cek apakah video dari YouTube
    public function isYouTubeVideo(): bool
    {
        return $this->file_type === self::TYPE_VIDEO && $this->video_source === self::VIDEO_SOURCE_YOUTUBE;
    }

    // Method untuk cek apakah video dari file
    public function isFileVideo(): bool
    {
        return $this->file_type === self::TYPE_VIDEO && $this->video_source === self::VIDEO_SOURCE_FILE;
    }

    // Method untuk mendapatkan YouTube video ID dari URL
    public function getYouTubeVideoId(): ?string
    {
        if (!$this->isYouTubeVideo() || !$this->youtube_url) {
            return null;
        }

        // Pattern untuk berbagai format YouTube URL
        $patterns = [
            '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/',
            '/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $this->youtube_url, $matches)) {
                return $matches[1] ?? $matches[2] ?? null;
            }
        }

        return null;
    }

    // Method untuk mendapatkan YouTube thumbnail URL
    public function getYouTubeThumbnail(): ?string
    {
        $videoId = $this->getYouTubeVideoId();

        if (!$videoId) {
            return null;
        }

        return "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg";
    }

    // Method untuk mendapatkan YouTube embed URL
    public function getYouTubeEmbedUrl(): ?string
    {
        $videoId = $this->getYouTubeVideoId();

        if (!$videoId) {
            return null;
        }

        return "https://www.youtube.com/embed/{$videoId}";
    }

    // Method untuk mendapatkan semua video source yang valid
    public static function getValidVideoSources(): array
    {
        return [self::VIDEO_SOURCE_FILE, self::VIDEO_SOURCE_YOUTUBE];
    }

    // Accessors untuk penambahan otomatis di serialization
    public function getYoutubeVideoIdAttribute(): ?string
    {
        return $this->getYouTubeVideoId();
    }

    public function getYoutubeThumbnailAttribute(): ?string
    {
        return $this->getYouTubeThumbnail();
    }

    public function getYoutubeEmbedUrlAttribute(): ?string
    {
        return $this->getYouTubeEmbedUrl();
    }
}
