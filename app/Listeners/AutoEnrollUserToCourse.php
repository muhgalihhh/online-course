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

      Log::info('Immediate enrollment completed successfully', [
        'transaction_id' => $event->transaction->id,
        'order_id' => $event->transaction->midtrans_order_id
      ]);
    } catch (\Exception $e) {
      Log::error('Immediate enrollment failed, dispatching backup job', [
        'transaction_id' => $event->transaction->id,
        'order_id' => $event->transaction->midtrans_order_id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      // Dispatch backup job immediately without delay for sync queue
      ProcessEnrollmentAfterPayment::dispatch($event->transaction);
    }
  }

  private function processImmediateEnrollment($transaction): void
  {
    if (!$transaction->isCourseTransaction()) {
      Log::info('Not a course transaction, skipping enrollment', [
        'transaction_id' => $transaction->id,
        'type' => $transaction->transactionable_type
      ]);
      return;
    }

    $user = $transaction->user;
    $courseId = $transaction->transactionable_id;

    if (!$user) {
      $error = 'User not found for immediate enrollment';
      Log::error($error, [
        'transaction_id' => $transaction->id,
        'order_id' => $transaction->midtrans_order_id
      ]);
      throw new \Exception($error);
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
    try {
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
    } catch (\Exception $e) {
      Log::error('Database error during immediate enrollment', [
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'course_id' => $courseId,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }
}
