<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CourseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'order',
        'type',
        'file_path',
        'youtube_url',
        'is_preview',
    ];

    protected $casts = [
        'is_preview' => 'boolean',
    ];

    protected $appends = ['file_url'];

    /**
     * Get the full URL for the file_path
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_path) {
            return Storage::disk('public')->url($this->file_path);
        }
        return null;
    }

    /**
     * Bab yang memiliki materi ini.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}