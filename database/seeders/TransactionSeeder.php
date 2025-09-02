<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $users = User::where('role', 'user')->get();
    $paidCourses = Course::where('price', '>', 0)->get();

    $paymentMethods = ['bank_transfer', 'credit_card', 'e_wallet', 'virtual_account'];
    $statuses = ['completed', 'pending', 'failed', 'cancelled'];

    foreach ($users as $user) {
      // Setiap user akan memiliki 1-3 transaksi
      $transactionCount = rand(1, 3);

      for ($i = 0; $i < $transactionCount; $i++) {
        $course = $paidCourses->random();
        $status = $statuses[array_rand($statuses)];
        $paymentMethod = $paymentMethods[array_rand($paymentMethods)];

        // Lebih banyak transaksi completed
        if (rand(1, 100) <= 70) {
          $status = 'completed';
        }

        $createdAt = now()->subDays(rand(1, 60));

        Transaction::create([
          'user_id' => $user->id,
          'transactionable_id' => $course->id,
          'transactionable_type' => Course::class,
          'midtrans_order_id' => 'ORDER-' . $user->id . '-' . $course->id . '-' . time() . rand(100, 999),
          'amount' => $course->price,
          'payment_method' => $paymentMethod,
          'status' => $status,
          'payment_details' => [
            'payment_type' => $paymentMethod,
            'transaction_time' => $createdAt->toISOString(),
            'gross_amount' => $course->price,
            'currency' => 'IDR',
          ],
          'created_at' => $createdAt,
          'updated_at' => $createdAt,
        ]);
      }
    }

    // Tambahkan beberapa transaksi dengan amount yang berbeda (diskon, promo, dll)
    $discountTransactions = [
      ['user_id' => $users->random()->id, 'discount_percentage' => 50],
      ['user_id' => $users->random()->id, 'discount_percentage' => 30],
      ['user_id' => $users->random()->id, 'discount_percentage' => 20],
      ['user_id' => $users->random()->id, 'discount_percentage' => 10],
    ];

    foreach ($discountTransactions as $discountData) {
      $course = $paidCourses->random();
      $originalPrice = $course->price;
      $discountAmount = ($originalPrice * $discountData['discount_percentage']) / 100;
      $finalPrice = $originalPrice - $discountAmount;

      $createdAt = now()->subDays(rand(1, 30));

      Transaction::create([
        'user_id' => $discountData['user_id'],
        'transactionable_id' => $course->id,
        'transactionable_type' => Course::class,
        'midtrans_order_id' => 'PROMO-' . $discountData['user_id'] . '-' . $course->id . '-' . time() . rand(100, 999),
        'amount' => $finalPrice,
        'payment_method' => $paymentMethods[array_rand($paymentMethods)],
        'status' => 'completed',
        'payment_details' => [
          'payment_type' => 'promo',
          'transaction_time' => $createdAt->toISOString(),
          'gross_amount' => $finalPrice,
          'original_amount' => $originalPrice,
          'discount_amount' => $discountAmount,
          'discount_percentage' => $discountData['discount_percentage'],
          'currency' => 'IDR',
        ],
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
      ]);
    }
  }
}
