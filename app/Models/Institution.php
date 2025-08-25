<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institution extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'phone',
        'email',
        'address',
        'website',
        'photo_path',
    ];

    /**
     * Kursus yang dimiliki oleh institusi ini.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Ulasan yang dimiliki oleh institusi ini.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
