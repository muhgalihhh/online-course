<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$flip = app(App\Services\FlipService::class);

echo "Checking Flip Bill Status for bill 294875...\n";
$status = $flip->getBillStatus('294875');
print_r($status);

echo "\n\nChecking Flip Bill Payments for bill 294875...\n";
$payments = $flip->getBillPayments('294875');
print_r($payments);
