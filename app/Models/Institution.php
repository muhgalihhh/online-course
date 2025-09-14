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
        // Social media links
        'tiktok_url',
        'instagram_url',
        'facebook_url',
        'twitter_url',
        // Mobile app links
        'ios_app_url',
        'android_app_url',
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

    /**
     * Akomodasi yang dimiliki oleh institusi ini.
     * Since accommodations no longer have institution_id, return all accommodations.
     */
    public function accommodations()
    {
        // Return all accommodations since they all belong to this single institution
        return \App\Models\Accommodation::all();
    }

    /**
     * Get all accommodations (since there's only one institution).
     */
    public function getAllAccommodations()
    {
        return \App\Models\Accommodation::all();
    }
}
