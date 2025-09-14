<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Accommodation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image_path',
        'description',
        'price_per_night',
        'is_active',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the single institution (PareeduHub).
     */
    public function getInstitutionAttribute()
    {
        return Institution::first() ?? new Institution();
    }

    /**
     * Get the full URL for the accommodation image.
     */
    public function getImageUrlAttribute(): string
    {
        if ($this->image_path && Storage::disk('public')->exists($this->image_path)) {
            return asset('storage/' . $this->image_path);
        }

        return asset('hero-1.jpg'); // Default image
    }

    /**
     * Get formatted price per night.
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->price_per_night, 0, ',', '.');
    }

    /**
     * Get WhatsApp booking URL.
     */
    public function getWhatsappBookingUrlAttribute(): string
    {
        $institution = Institution::first();
        $phone = $institution->phone ?? '';
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Convert to international format if starts with 0
        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }

        $message = urlencode("Halo, saya ingin memesan akomodasi '{$this->name}' dengan harga {$this->formatted_price} per malam. Mohon informasi ketersediaan dan cara pemesanannya.");

        return "https://wa.me/{$phone}?text={$message}";
    }

    /**
     * Scope for active accommodations only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
