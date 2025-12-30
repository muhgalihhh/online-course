<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Flip Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Flip payment gateway integration.
    | Documentation: https://docs.flip.id/
    |
    */

    // Secret key untuk autentikasi API Flip
    'secret_key' => env('FLIP_SECRET_KEY'),

    // Token validasi untuk webhook verification
    'validation_token' => env('FLIP_VALIDATION_TOKEN'),

    // Mode production atau sandbox
    'is_production' => (bool) env('FLIP_IS_PRODUCTION', false),

    // Base URL API (otomatis berdasarkan mode)
    'base_url' => env('FLIP_IS_PRODUCTION', false)
        ? 'https://bigflip.id/api/v2'
        : 'https://bigflip.id/big_sandbox_api/v2',

    // Bill expiry time in hours
    'bill_expiry_hours' => (int) env('FLIP_BILL_EXPIRY_HOURS', 24),

    // Step pembayaran (1-3). Step 3 = langsung ke halaman pilih metode
    'payment_step' => (int) env('FLIP_PAYMENT_STEP', 3),

    // Apakah membutuhkan alamat dari pembeli
    'is_address_required' => (bool) env('FLIP_ADDRESS_REQUIRED', false),

    // Apakah membutuhkan nomor telepon dari pembeli
    'is_phone_required' => (bool) env('FLIP_PHONE_REQUIRED', false),
];
