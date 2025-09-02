<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessEnrollmentAfterPayment implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  public $tries = 3; // Retry 3 times if failed
  public $backoff = [10, 30, 60]; // Wait 10s, 30s, 60s between retries

  public function __construct(
    public Transaction $transaction
  ) {
  }

  public function handle(): void
  {
    // Only process course transactions
    if ($this->transaction->transactionable_type !== Course::class) {
      return;
    }

    // Only process completed transactions
    if ($this->transaction->status !== 'completed') {
      return;
    }

    $user = $this->transaction->user;
    $courseId = $this->transaction->transactionable_id;

    if (!$user) {
      Log::warning('User not found for transaction job', [
        'transaction_id' => $this->transaction->id,
        'order_id' => $this->transaction->midtrans_order_id
      ]);
      return;
    }

    // Check if user is already enrolled
    if ($user->isEnrolledIn($courseId)) {
      Log::info('User already enrolled in course (job)', [
        'user_id' => $user->id,
        'course_id' => $courseId,
        'transaction_id' => $this->transaction->id
      ]);
      return;
    }

    // Create enrollment with database transaction for consistency
    DB::transaction(function () use ($user, $courseId) {
      $enrollment = Enrollment::firstOrCreate(
        [
          'user_id' => $user->id,
          'course_id' => $courseId,
        ],
        [
          'enrolled_at' => now(),
          'progress' => 0,
        ]
      );

      Log::info('User auto-enrolled via job after payment', [
        'enrollment_id' => $enrollment->id,
        'was_recently_created' => $enrollment->wasRecentlyCreated,
        'user_id' => $user->id,
        'course_id' => $courseId,
        'transaction_id' => $this->transaction->id,
        'order_id' => $this->transaction->midtrans_order_id
      ]);
    });
  }

  public function failed(\Throwable $exception): void
  {
    Log::error('Failed to process enrollment after payment (job)', [
      'transaction_id' => $this->transaction->id,
      'order_id' => $this->transaction->midtrans_order_id,
      'error' => $exception->getMessage(),
      'trace' => $exception->getTraceAsString()
    ]);
  }
}
