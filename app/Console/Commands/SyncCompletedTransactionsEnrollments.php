<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncCompletedTransactionsEnrollments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:sync-enrollments {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync completed course transactions with enrollments. Creates missing enrollments for completed payments.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        $this->info('🔍 Scanning for completed course transactions without enrollments...');

        // Find completed course transactions that don't have enrollments
        $completedTransactions = Transaction::where('status', 'completed')
            ->where('transactionable_type', Course::class)
            ->with(['user', 'transactionable'])
            ->get();

        $missingEnrollments = [];

        foreach ($completedTransactions as $transaction) {
            if (!$transaction->user) {
                $this->warn("⚠️  Transaction {$transaction->midtrans_order_id} has no user associated");
                continue;
            }

            if (!$transaction->transactionable) {
                $this->warn("⚠️  Transaction {$transaction->midtrans_order_id} has no course associated");
                continue;
            }

            // Check if enrollment exists
            $enrollmentExists = Enrollment::where('user_id', $transaction->user_id)
                ->where('course_id', $transaction->transactionable_id)
                ->exists();

            if (!$enrollmentExists) {
                $missingEnrollments[] = $transaction;
                $this->line("🔸 Missing enrollment: User {$transaction->user->name} ({$transaction->user->email}) for course \"{$transaction->transactionable->title}\"");
            }
        }

        if (empty($missingEnrollments)) {
            $this->info('✅ All completed transactions already have enrollments. No action needed.');
            return Command::SUCCESS;
        }

        $this->info("\n📊 Found " . count($missingEnrollments) . " missing enrollments");

        if ($dryRun) {
            $this->warn('🔥 DRY RUN MODE - No changes will be made');
            $this->info('Run without --dry-run to create the missing enrollments');
            return Command::SUCCESS;
        }

        if (!$this->confirm('Do you want to create these missing enrollments?')) {
            $this->info('Operation cancelled');
            return Command::SUCCESS;
        }

        $created = 0;
        $errors = 0;

        DB::transaction(function () use ($missingEnrollments, &$created, &$errors) {
            foreach ($missingEnrollments as $transaction) {
                try {
                    // Check if enrollment already exists to avoid duplicate
                    $existingEnrollment = Enrollment::where('user_id', $transaction->user_id)
                        ->where('course_id', $transaction->transactionable_id)
                        ->first();

                    if ($existingEnrollment) {
                        $this->info("ℹ️  Enrollment already exists for user {$transaction->user->email} in course \"{$transaction->transactionable->title}\"");
                        continue;
                    }

                    $enrollment = Enrollment::create([
                        'user_id' => $transaction->user_id,
                        'course_id' => $transaction->transactionable_id,
                        'enrolled_at' => $transaction->updated_at, // Use transaction completion time
                        'progress' => 0,
                    ]);

                    $this->info("✅ Created enrollment ID {$enrollment->id} for user {$transaction->user->email} in course \"{$transaction->transactionable->title}\"");
                    $created++;

                } catch (\Exception $e) {
                    $this->error("❌ Failed to create enrollment for transaction {$transaction->midtrans_order_id}: " . $e->getMessage());
                    $errors++;
                }
            }
        });

        $this->info("\n🎉 Summary:");
        $this->info("✅ Created: {$created} enrollments");
        if ($errors > 0) {
            $this->warn("❌ Errors: {$errors} enrollments");
        }

        return Command::SUCCESS;
    }
}
