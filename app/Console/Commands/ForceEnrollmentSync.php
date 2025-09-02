<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Http\Controllers\PaymentController;
use Illuminate\Console\Command;

class ForceEnrollmentSync extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'enrollment:force-sync {--user-id= : Specific user ID} {--transaction-id= : Specific transaction ID}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Force sync enrollment for completed transactions';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $userId = $this->option('user-id');
    $transactionId = $this->option('transaction-id');

    $query = Transaction::where('status', 'completed')
      ->where('transactionable_type', \App\Models\Course::class)
      ->with(['user', 'transactionable']);

    if ($userId) {
      $query->where('user_id', $userId);
    }

    if ($transactionId) {
      $query->where('id', $transactionId);
    }

    $transactions = $query->get();

    if ($transactions->isEmpty()) {
      $this->info('No completed transactions found.');
      return Command::SUCCESS;
    }

    $this->info("Found {$transactions->count()} completed transactions to process");

    $paymentController = app(PaymentController::class);
    $processed = 0;
    $errors = 0;

    foreach ($transactions as $transaction) {
      try {
        $this->line("Processing transaction {$transaction->midtrans_order_id} for user {$transaction->user->email}");

        $paymentController->autoEnrollUserToCourse($transaction);

        $this->info("✅ Processed transaction {$transaction->midtrans_order_id}");
        $processed++;
      } catch (\Exception $e) {
        $this->error("❌ Failed to process transaction {$transaction->midtrans_order_id}: " . $e->getMessage());
        $errors++;
      }
    }

    $this->newLine();
    $this->info("Summary:");
    $this->info("✅ Processed: {$processed}");
    $this->info("❌ Errors: {$errors}");

    return Command::SUCCESS;
  }
}
