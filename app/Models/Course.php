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
        'thumbnail_path',
    ];

    protected $casts = [
        'is_pro' => 'boolean',
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
}
