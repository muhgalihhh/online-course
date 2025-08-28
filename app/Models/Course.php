<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id',
        'category_id',
        'title',
        'description',
        'price',
        'is_pro',
        'status',
        'thumbnail_path',
    ];

    protected $casts = [
        'is_pro' => 'boolean',
    ];

    protected $appends = [
        'thumbnail',
    ];

    /**
     * Institusi yang memiliki kursus ini.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Kategori dari kursus ini.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Bab yang ada di dalam kursus ini.
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    /**
     * Pengguna yang mendaftar di kursus ini.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments');
    }

    /**
     * Enrollments for this course.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Course materials through chapters.
     */
    public function courseMaterials(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(CourseMaterial::class, Chapter::class);
    }

    /**
     * Transaksi yang terkait dengan kursus ini.
     */
    public function transactions(): MorphMany
    {
        return $this->morphMany(Transaction::class, 'transactionable');
    }

    /**
     * Ulasan untuk kursus ini.
     */
    public function courseReviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    /**
     * Alias untuk courseReviews untuk konsistensi
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    /**
     * Get formatted price accessor
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get search display name
     */
    public function getSearchDisplayAttribute()
    {
        $status = $this->is_pro ? 'Pro' : 'Free';
        return "{$this->title} ({$status})";
    }

    /**
     * Get the full URL for the course thumbnail
     */
    public function getThumbnailAttribute()
    {
        if ($this->thumbnail_path) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url($this->thumbnail_path);
        }
        return null;
    }

    /**
     * Check if the course is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if the course is draft
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Publish the course
     */
    public function publish(): bool
    {
        return $this->update(['status' => 'published']);
    }

    /**
     * Unpublish the course (set to draft)
     */
    public function unpublish(): bool
    {
        return $this->update(['status' => 'draft']);
    }
}
