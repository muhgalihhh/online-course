<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialProgress extends Model
{
  use HasFactory;

  protected $table = 'material_progress';

  protected $fillable = [
    'user_id',
    'course_material_id',
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
   * Get the course material that this progress belongs to.
   */
  public function courseMaterial(): BelongsTo
  {
    return $this->belongsTo(CourseMaterial::class);
  }

  /**
   * Get the enrollment that this progress belongs to.
   */
  public function enrollment(): BelongsTo
  {
    return $this->belongsTo(Enrollment::class);
  }

  /**
   * Mark this material as completed.
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
   * Update the enrollment progress based on completed materials.
   */
  protected function updateEnrollmentProgress(): void
  {
    $enrollment = $this->enrollment;

    // Get total materials in course
    $totalMaterials = CourseMaterial::whereHas('chapter', function ($query) use ($enrollment) {
      $query->where('course_id', $enrollment->course_id);
    })->count();

    if ($totalMaterials > 0) {
      $completedMaterials = self::where('enrollment_id', $enrollment->id)
        ->where('is_completed', true)
        ->count();

      $progress = round(($completedMaterials / $totalMaterials) * 100);

      $enrollment->update([
        'progress' => $progress,
        'completed_at' => $progress === 100 ? now() : null,
      ]);
    }
  }
}
