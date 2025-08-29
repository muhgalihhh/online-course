<?php

return [
    'merchant_id' => env('MIDTRANS_MERCHANT_ID'),
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),
    'is_3ds' => (bool) env('MIDTRANS_IS_3DS', true),
    'is_sanitized' => (bool) env('MIDTRANS_SANITIZED', true),
    'enable_log' => (bool) env('MIDTRANS_ENABLE_LOG', true),
    'currency' => env('MIDTRANS_CURRENCY', 'IDR'),
    'payment_methods' => array_filter(array_map('trim', explode(',', (string) env('MIDTRANS_PAYMENT_METHODS', 'qris,gopay,shopeepay,dana')))),
    'enable_pay_button' => (bool) env('MIDTRANS_ENABLE_PAY_BUTTON', true),
    'enable_order_id' => (bool) env('MIDTRANS_ENABLE_ORDER_ID', true),
];

