<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
  /**
   * Check if user is enrolled in a specific course
   */
  public function checkEnrollment(Request $request, int $courseId): JsonResponse
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    $isEnrolled = Enrollment::where('user_id', $user->id)
      ->where('course_id', $courseId)
      ->exists();

    return response()->json([
      'is_enrolled' => $isEnrolled,
      'course_id' => $courseId,
    ]);
  }
}
