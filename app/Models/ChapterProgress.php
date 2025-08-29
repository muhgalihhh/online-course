<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChapterProgress extends Model
{
    use HasFactory;

    protected $table = 'chapter_progress';

    protected $fillable = [
        'user_id',
        'chapter_id',
        'enrollment_id',
        'is_completed',
        'completed_at',
        'time_spent',
        'last_accessed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'time_spent' => 'integer',
    ];

    /**
     * Get the user that owns the progress.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the chapter that this progress belongs to.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Get the enrollment that this progress belongs to.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Mark this chapter as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);

        // Update the enrollment progress
        $this->updateEnrollmentProgress();
    }

    /**
     * Update the enrollment progress based on completed chapters.
     */
    protected function updateEnrollmentProgress(): void
    {
        $enrollment = $this->enrollment;
        $totalChapters = $enrollment->course->chapters()->count();
        
        if ($totalChapters > 0) {
            $completedChapters = self::where('enrollment_id', $enrollment->id)
                ->where('is_completed', true)
                ->count();
            
            $progress = round(($completedChapters / $totalChapters) * 100);
            
            $enrollment->update([
                'progress' => $progress,
                'completed_at' => $progress === 100 ? now() : null,
            ]);
        }
    }
}