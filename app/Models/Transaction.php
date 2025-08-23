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
}