<?php

namespace App\Listeners;

use App\Events\TransactionCompleted;
use App\Jobs\ProcessEnrollmentAfterPayment;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AutoEnrollUserToCourse
{
  public function handle(TransactionCompleted $event): void
  {
    Log::info('TransactionCompleted event received', [
      'transaction_id' => $event->transaction->id,
      'order_id' => $event->transaction->midtrans_order_id,
      'status' => $event->transaction->status
    ]);

    // Try immediate enrollment first
    try {
      $this->processImmediateEnrollment($event->transaction);
    } catch (\Exception $e) {
      Log::warning('Immediate enrollment failed, dispatching job', [
        'transaction_id' => $event->transaction->id,
        'error' => $e->getMessage()
      ]);
    }

    // Also dispatch job as backup for reliability
    ProcessEnrollmentAfterPayment::dispatch($event->transaction)
      ->delay(now()->addSeconds(5)); // Small delay to ensure transaction is committed
  }

  private function processImmediateEnrollment($transaction): void
  {
    if (!$transaction->isCourseTransaction()) {
      return;
    }

    $user = $transaction->user;
    $courseId = $transaction->transactionable_id;

    if (!$user) {
      Log::warning('User not found for immediate enrollment', [
        'transaction_id' => $transaction->id,
        'order_id' => $transaction->midtrans_order_id
      ]);
      return;
    }

    // Check if user is already enrolled
    if ($user->isEnrolledIn($courseId)) {
      Log::info('User already enrolled (immediate check)', [
        'user_id' => $user->id,
        'course_id' => $courseId,
        'transaction_id' => $transaction->id
      ]);
      return;
    }

    // Create enrollment immediately
    DB::transaction(function () use ($user, $courseId, $transaction) {
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

      Log::info('User immediately enrolled after payment', [
        'enrollment_id' => $enrollment->id,
        'was_recently_created' => $enrollment->wasRecentlyCreated,
        'user_id' => $user->id,
        'course_id' => $courseId,
        'transaction_id' => $transaction->id,
        'order_id' => $transaction->midtrans_order_id
      ]);
    });
  }
}
