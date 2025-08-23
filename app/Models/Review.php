<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'institution_id',
        'rating',
        'comment',
    ];

    /**
     * Pengguna yang memberikan ulasan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Institusi yang diulas.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}