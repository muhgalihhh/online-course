<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Settings
    |--------------------------------------------------------------------------
    |
    | These are simple configuration settings for the application.
    | Following Laravel's convention, these settings are stored in a config file
    | instead of the database for simplicity.
    |
    */

    'platform' => [
        'name' => env('PLATFORM_NAME', 'EduPlatform'),
        'description' => env('PLATFORM_DESCRIPTION', 'Platform kursus online terbaik untuk pembelajaran digital'),
        'contact_email' => env('CONTACT_EMAIL', 'admin@eduplatform.com'),
        'support_phone' => env('SUPPORT_PHONE', '+62 812-3456-7890'),
    ],

    'appearance' => [
        'default_theme' => env('DEFAULT_THEME', 'light'),
        'primary_color' => env('PRIMARY_COLOR', '#3B82F6'),
        'show_logo' => env('SHOW_LOGO', true),
        'sidebar_position' => env('SIDEBAR_POSITION', 'left'),
        'collapsible_sidebar' => env('COLLAPSIBLE_SIDEBAR', true),
        'show_breadcrumbs' => env('SHOW_BREADCRUMBS', true),
    ],

    'features' => [
        'allow_registration' => env('ALLOW_REGISTRATION', true),
        'auto_approve_users' => env('AUTO_APPROVE_USERS', false),
        'user_verification' => env('USER_VERIFICATION', 'email'), // email, phone, both, none
        'max_users' => env('MAX_USERS', 10000),
    ],

    'security' => [
        'two_factor_auth' => env('TWO_FACTOR_AUTH', false),
        'session_timeout_enabled' => env('SESSION_TIMEOUT_ENABLED', false),
        'session_timeout_minutes' => env('SESSION_TIMEOUT_MINUTES', 30),
        'password_policy' => env('PASSWORD_POLICY', 'medium'), // low, medium, high
    ],

    'notifications' => [
        'notify_new_registration' => env('NOTIFY_NEW_REGISTRATION', true),
        'notify_course_enrollment' => env('NOTIFY_COURSE_ENROLLMENT', true),
        'notify_payment_confirmation' => env('NOTIFY_PAYMENT_CONFIRMATION', true),
        'push_notifications' => env('PUSH_NOTIFICATIONS', false),
    ],

    'payment' => [
        'default_currency' => env('DEFAULT_CURRENCY', 'IDR'),
        'payment_gateway' => env('PAYMENT_GATEWAY', 'midtrans'), // midtrans, xendit, stripe, paypal
    ],
];