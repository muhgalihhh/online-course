<?php
// Test script to verify average_rating handling
require_once 'vendor/autoload.php';

// Test the logic we implemented
$testValues = [null, 0, 5.5, "4.2", ""];

foreach ($testValues as $value) {
    $result = (float) ($value ?? 0);
    echo "Input: " . var_export($value, true) . " -> Output: " . $result . "\n";
}

echo "\nTesting toFixed equivalent in PHP:\n";
foreach ($testValues as $value) {
    $result = (float) ($value ?? 0);
    echo "Input: " . var_export($value, true) . " -> toFixed(1): " . number_format($result, 1) . "\n";
}
