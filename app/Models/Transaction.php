<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transactionable_id',
        'transactionable_type',
        'midtrans_order_id',
        'amount',
        'payment_method',
        'status',
        'payment_details',
    ];

    protected $casts = [
        'payment_details' => 'array',
    ];

    /**
     * Pengguna yang melakukan transaksi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendapatkan model parent yang dapat ditransaksikan (e.g., Course).
     */
    public function transactionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Check if transaction is for a course
     */
    public function isCourseTransaction(): bool
    {
        return $this->transactionable_type === Course::class;
    }

    /**
     * Get the course if this is a course transaction
     */
    public function getCourse(): ?Course
    {
        if ($this->isCourseTransaction()) {
            return $this->transactionable;
        }
        return null;
    }

    /**
     * Check if payment is completed/settled
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if user is already enrolled in the course (for course transactions)
     */
    public function isUserAlreadyEnrolled(): bool
    {
        if (!$this->isCourseTransaction()) {
            return false;
        }

        return \App\Models\Enrollment::where('user_id', $this->user_id)
            ->where('course_id', $this->transactionable_id)
            ->exists();
    }
}
