<?php

/**
 * Ngrok Setup Script untuk Laravel + Vite
 * Jalankan: php setup-ngrok.php
 */

echo "🚀 Setting up Ngrok Environment...\n\n";

// 1. Generate APP_KEY jika belum ada
$envFile = '.env';
if (!file_exists($envFile)) {
    echo "❌ File .env tidak ditemukan. Buat file .env terlebih dahulu.\n";
    exit(1);
}

$envContent = file_get_contents($envFile);

// Check if APP_KEY exists
if (!str_contains($envContent, 'APP_KEY=') || str_contains($envContent, 'APP_KEY=base64:')) {
    echo "✅ APP_KEY sudah ada\n";
} else {
    echo "🔑 Generating APP_KEY...\n";
    $appKey = 'base64:' . base64_encode(random_bytes(32));
    $envContent = str_replace('APP_KEY=', 'APP_KEY=' . $appKey, $envContent);
}

// 2. Update environment variables untuk ngrok
$updates = [
    'APP_ENV' => 'local',
    'APP_DEBUG' => 'true',
    'APP_URL' => 'http://localhost:8000',
    'SESSION_DRIVER' => 'file',
    'SESSION_LIFETIME' => '120',
    'CACHE_DRIVER' => 'file',
    'QUEUE_CONNECTION' => 'sync',
    'VITE_BASE_URL' => 'http://localhost:5173',
];

foreach ($updates as $key => $value) {
    if (str_contains($envContent, $key . '=')) {
        $envContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envContent);
        echo "✅ Updated {$key}\n";
    } else {
        $envContent .= "\n{$key}={$value}";
        echo "✅ Added {$key}\n";
    }
}

// 3. Write back to .env
file_put_contents($envFile, $envContent);

echo "\n🎯 Environment setup selesai!\n\n";

// 4. Instructions
echo "📋 Langkah selanjutnya:\n";
echo "1. Jalankan: php artisan serve --host=0.0.0.0 --port=8000\n";
echo "2. Di terminal lain: npm run dev\n";
echo "3. Di terminal lain: ngrok http 8000\n";
echo "4. Copy URL ngrok dan update .env:\n";
echo "   - APP_URL=https://[URL-NGROK]\n";
echo "   - SESSION_DOMAIN=[DOMAIN-NGROK]\n";
echo "   - VITE_BASE_URL=https://[URL-NGROK]\n\n";

echo "🔧 Untuk update otomatis setelah ngrok berjalan:\n";
echo "php setup-ngrok.php --update-url=https://[URL-NGROK]\n";