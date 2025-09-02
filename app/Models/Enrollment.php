<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'enrolled_at',
        'completed_at',
        'progress',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress' => 'integer',
    ];

    /**
     * Get the user that owns the enrollment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course that owns the enrollment.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the chapter progress for this enrollment.
     */
    public function chapterProgress()
    {
        return $this->hasMany(ChapterProgress::class);
    }

    /**
     * Get the material progress for this enrollment.
     */
    public function materialProgress()
    {
        return $this->hasMany(MaterialProgress::class);
    }

    /**
     * Calculate and update progress based on completed materials.
     */
    public function updateProgress()
    {
        // Get total materials in course
        $totalMaterials = \App\Models\CourseMaterial::whereHas('chapter', function ($query) {
            $query->where('course_id', $this->course_id);
        })->count();

        if ($totalMaterials > 0) {
            $completedMaterials = $this->materialProgress()
                ->where('is_completed', true)
                ->count();

            $progress = round(($completedMaterials / $totalMaterials) * 100);

            $this->update([
                'progress' => $progress,
                'completed_at' => $progress === 100 ? now() : null,
            ]);
        }
    }
}
