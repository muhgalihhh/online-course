<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profile_photo_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessor attributes that should be appended to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Kursus yang diikuti oleh pengguna.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'enrollments');
    }

    /**
     * Transaksi yang dimiliki oleh pengguna.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Ulasan institusi yang diberikan oleh pengguna.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Ulasan kursus yang diberikan oleh pengguna.
     */
    public function courseReviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    /**
     * Cek apakah pengguna adalah admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo_path) {
            // Pastikan URL menggunakan storage link yang benar
            return Storage::disk('public')->url($this->profile_photo_path);
        }

        // Jika tidak ada foto, gunakan API ui-avatars dengan warna yang lebih menarik
        $name = urlencode($this->name);
        $colors = ['7F9CF5', 'F56565', '48BB78', 'ED8936', '9F7AEA'];
        $color = $colors[array_rand($colors)];
        return "https://ui-avatars.com/api/?name={$name}&color=FFFFFF&background={$color}&size=200&bold=true";
    }

    /**
     * Get search display name with role
     */
    public function getSearchDisplayAttribute()
    {
        return "{$this->name} ({$this->role})";
    }

    /**
     * Get formatted role name
     */
    public function getFormattedRoleAttribute()
    {
        return ucfirst($this->role);
    }
}
