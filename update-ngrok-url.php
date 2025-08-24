<?php

/**
 * Update Ngrok URL Script
 * Usage: php update-ngrok-url.php [NGROK_URL]
 * Example: php update-ngrok-url.php https://abc123.ngrok-free.app
 */

if ($argc < 2) {
    echo "❌ Usage: php update-ngrok-url.php [NGROK_URL]\n";
    echo "Example: php update-ngrok-url.php https://abc123.ngrok-free.app\n";
    exit(1);
}

$ngrokUrl = $argv[1];
$ngrokDomain = parse_url($ngrokUrl, PHP_URL_HOST);

if (!$ngrokDomain) {
    echo "❌ URL ngrok tidak valid: {$ngrokUrl}\n";
    exit(1);
}

echo "🔄 Updating ngrok URL: {$ngrokUrl}\n";

$envFile = '.env';
if (!file_exists($envFile)) {
    echo "❌ File .env tidak ditemukan\n";
    exit(1);
}

$envContent = file_get_contents($envFile);

// Update environment variables
$updates = [
    'APP_URL' => $ngrokUrl,
    'SESSION_DOMAIN' => $ngrokDomain,
    'VITE_BASE_URL' => $ngrokUrl,
    'SANCTUM_STATEFUL_DOMAINS' => $ngrokDomain,
];

foreach ($updates as $key => $value) {
    if (str_contains($envContent, $key . '=')) {
        $envContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envContent);
        echo "✅ Updated {$key}={$value}\n";
    } else {
        $envContent .= "\n{$key}={$value}";
        echo "✅ Added {$key}={$value}\n";
    }
}

// Write back to .env
file_put_contents($envFile, $envContent);

echo "\n🎯 Ngrok URL updated successfully!\n";
echo "🔧 Restart your servers to apply changes:\n";
echo "   - Laravel server\n";
echo "   - Vite development server\n";
echo "   - Ngrok tunnel\n";