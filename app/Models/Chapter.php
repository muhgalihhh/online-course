<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'order',
        'duration',
        'is_free',
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'duration' => 'integer',
    ];

    /**
     * Kursus yang memiliki bab ini.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Materi yang ada di dalam bab ini.
     */
    public function courseMaterials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    /**
     * Alias relation for courseMaterials to match frontend expectation.
     */
    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    /**
     * Progress records for this chapter.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(ChapterProgress::class);
    }

    /**
     * Get progress for a specific user.
     */
    public function getUserProgress($userId)
    {
        return $this->progress()->where('user_id', $userId)->first();
    }
}