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
    | Important: Make sure FLIP_SECRET_KEY is set correctly in your .env file.
    | The secret key can be found in your Flip Business dashboard.
    |
    */

    // Secret key untuk autentikasi API Flip
    // Get from: https://flip.id/business/dashboard > Settings > API Keys
    'secret_key' => env('FLIP_SECRET_KEY'),

    // Token validasi untuk webhook verification
    // Get from: https://flip.id/business/dashboard > Settings > Webhook
    'validation_token' => env('FLIP_VALIDATION_TOKEN'),

    // Mode production atau sandbox
    'is_production' => (bool) env('FLIP_IS_PRODUCTION', false),

    // Base URL API (otomatis berdasarkan mode)
    // Sandbox: https://bigflip.id/big_sandbox_api/v2
    // Production: https://bigflip.id/api/v2
    'base_url' => env('FLIP_BASE_URL', env('FLIP_IS_PRODUCTION', false)
        ? 'https://bigflip.id/api/v2'
        : 'https://bigflip.id/big_sandbox_api/v2'),

    // Bill expiry time in hours (minimum 1 hour, maximum 720 hours / 30 days)
    'bill_expiry_hours' => max(1, min(720, (int) env('FLIP_BILL_EXPIRY_HOURS', 24))),

    // Step pembayaran (1-2). 
    // Step 1 = Shows bill info only
    // Step 2 = Shows bill info + payment method selection (recommended)
    // Note: Step 3 requires sender_bank parameter and is NOT supported without it
    //       If step 3 is configured, it will fallback to step 2
    'payment_step' => (int) env('FLIP_PAYMENT_STEP', 2),

    // Apakah membutuhkan alamat dari pembeli
    'is_address_required' => (bool) env('FLIP_ADDRESS_REQUIRED', false),

    // Apakah membutuhkan nomor telepon dari pembeli
    'is_phone_required' => (bool) env('FLIP_PHONE_REQUIRED', false),

    // Minimum amount for Flip transactions (in IDR)
    // Flip has a minimum transaction amount of Rp 10,000
    'minimum_amount' => (int) env('FLIP_MINIMUM_AMOUNT', 10000),
];
