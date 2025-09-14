<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\Course;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Http\Request;

Route::get('/test-payment', function (Request $request) {
  // Get first available course
  $course = Course::where('status', 'published')->where('price', '>', 0)->first();

  if (!$course) {
    return response()->json(['error' => 'No paid courses found'], 404);
  }

  // Get first user or create one
  $user = User::first();
  if (!$user) {
    $user = User::create([
      'name' => 'Test User',
      'email' => 'test@example.com',
      'password' => bcrypt('password'),
      'email_verified_at' => now(),
    ]);
  }

  // Login the user
  Auth::login($user);

  try {
    $midtrans = new MidtransService();
    $result = $midtrans->createCourseTransaction($user, $course);

    return response()->json([
      'success' => true,
      'course' => $course->only(['id', 'title', 'price']),
      'user' => $user->only(['id', 'name', 'email']),
      'transaction' => [
        'order_id' => $result['order_id'],
        'snap_token' => $result['snap_token'] ? substr($result['snap_token'], 0, 20) . '...' : null,
        'has_token' => !empty($result['snap_token'])
      ],
      'payment_url' => route('payment.course', $course->id)
    ]);

  } catch (\Exception $e) {
    return response()->json([
      'error' => $e->getMessage(),
      'trace' => config('app.debug') ? $e->getTraceAsString() : null
    ], 500);
  }
});
