<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$enrollments = App\Models\Enrollment::with(['user', 'course'])->get();
echo "Total enrollments: " . $enrollments->count() . "\n\n";

foreach ($enrollments as $e) {
  echo "ID: {$e->id}, User: {$e->user->name} ({$e->user->email}), Course: {$e->course->title}, Progress: {$e->progress}%\n";
}

echo "\n";

// Also check completed transactions
$completedTransactions = App\Models\Transaction::where('status', 'completed')
  ->where('transactionable_type', App\Models\Course::class)
  ->with(['user', 'transactionable'])
  ->get();

echo "Completed course transactions: " . $completedTransactions->count() . "\n\n";

foreach ($completedTransactions as $t) {
  $enrolled = App\Models\Enrollment::where('user_id', $t->user_id)
    ->where('course_id', $t->transactionable_id)
    ->exists();

  echo "Transaction: {$t->midtrans_order_id}, User: {$t->user->name}, Course: {$t->transactionable->title}, Enrolled: " . ($enrolled ? 'YES' : 'NO') . "\n";
}
