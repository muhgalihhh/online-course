<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\User;

class CoursePaymentStatusService
{
  /**
   * Get comprehensive payment and enrollment status for a course
   */
  public function getCourseStatus(User $user, Course $course): array
  {
    // Check if user is enrolled
    $isEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();

    if ($isEnrolled) {
      return [
        'status' => 'enrolled',
        'button_text' => 'Lanjutkan Belajar',
        'button_action' => 'learn',
        'can_purchase' => false,
        'message' => 'Anda sudah terdaftar di kursus ini',
        'transaction' => null
      ];
    }

    // Check for completed transaction
    $completedTransaction = Transaction::where('user_id', $user->id)
      ->where('transactionable_id', $course->id)
      ->where('transactionable_type', Course::class)
      ->where('status', 'completed')
      ->latest()
      ->first();

    if ($completedTransaction) {
      return [
        'status' => 'paid_processing',
        'button_text' => 'Sedang Diproses',
        'button_action' => 'disabled',
        'can_purchase' => false,
        'message' => 'Pembayaran berhasil, sedang memproses pendaftaran',
        'transaction' => $completedTransaction
      ];
    }

    // Check for pending transaction
    $pendingTransaction = Transaction::where('user_id', $user->id)
      ->where('transactionable_id', $course->id)
      ->where('transactionable_type', Course::class)
      ->whereIn('status', ['pending', 'processing'])
      ->latest()
      ->first();

    if ($pendingTransaction) {
      // Check if transaction is actually expired via Midtrans
      $midtransService = app(MidtransService::class);
      $statusInfo = $midtransService->getTransactionStatus($pendingTransaction->midtrans_order_id);

      if ($statusInfo && in_array($statusInfo['status'], ['expired', 'cancelled', 'failed'])) {
        // Mark as expired and allow new purchase
        $pendingTransaction->update(['status' => $statusInfo['status']]);

        return [
          'status' => 'can_purchase',
          'button_text' => $course->is_pro ? 'Beli Sekarang' : 'Ikuti Kursus',
          'button_action' => 'purchase',
          'can_purchase' => true,
          'message' => 'Transaksi sebelumnya telah expired, Anda dapat membeli lagi',
          'transaction' => null
        ];
      }

      // Transaction is still valid/pending
      return [
        'status' => 'pending_payment',
        'button_text' => 'Lanjutkan Pembayaran',
        'button_action' => 'continue_payment',
        'can_purchase' => false,
        'message' => 'Anda memiliki transaksi yang belum diselesaikan',
        'transaction' => $pendingTransaction
      ];
    }

    // No transaction, can purchase
    return [
      'status' => 'can_purchase',
      'button_text' => $course->is_pro ? 'Beli Sekarang' : 'Ikuti Kursus',
      'button_action' => 'purchase',
      'can_purchase' => true,
      'message' => null,
      'transaction' => null
    ];
  }

  /**
   * Get button configuration for course cards
   */
  public function getButtonConfig(User $user, Course $course): array
  {
    $status = $this->getCourseStatus($user, $course);

    $config = [
      'text' => $status['button_text'],
      'variant' => 'default',
      'disabled' => false,
      'href' => null,
      'onclick' => null
    ];

    switch ($status['button_action']) {
      case 'learn':
        $config['href'] = route('courses.learn', $course->id);
        $config['variant'] = 'default';
        break;

      case 'continue_payment':
        $config['href'] = route('payments.show', $course->id);
        $config['variant'] = 'outline';
        break;

      case 'purchase':
        if ($course->is_pro) {
          $config['href'] = route('courses.enroll', $course->id);
        } else {
          $config['onclick'] = 'enroll-free';
        }
        $config['variant'] = 'default';
        break;

      case 'disabled':
        $config['disabled'] = true;
        $config['variant'] = 'outline';
        break;
    }

    return $config;
  }
}
