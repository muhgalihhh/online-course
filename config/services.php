<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Tambahkan di dalam return [ ... ]

    'payment' => [
        'default' => env('PAYMENT_DEFAULT_GATEWAY', 'midtrans'),
    ],

    'flip' => [
        'secret_key' => env('FLIP_SECRET_KEY'),
        'validation_token' => env('FLIP_VALIDATION_TOKEN'),
        'is_production' => env('FLIP_IS_PRODUCTION', false),
        'base_url' => env('FLIP_IS_PRODUCTION', false)
            ? 'https://bigflip.id/api/v2'
            : 'https://bigflip.id/big_sandbox_api/v2',
    ],

];
