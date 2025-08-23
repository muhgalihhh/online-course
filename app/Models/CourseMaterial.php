<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    /**
     * Bab yang memiliki materi ini.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}