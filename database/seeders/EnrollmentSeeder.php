<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $users = User::where('role', 'user')->get();
    $courses = Course::where('status', 'published')->get();

    foreach ($users as $user) {
      // Setiap user akan enroll ke 2-4 course secara random
      $coursesToEnroll = $courses->random(rand(2, 4));

      foreach ($coursesToEnroll as $course) {
        // Cek apakah sudah enrolled
        if (!Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
          $enrolledAt = now()->subDays(rand(1, 30));
          $progress = rand(0, 100);
          $completedAt = $progress === 100 ? $enrolledAt->copy()->addDays(rand(1, 10)) : null;

          Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'enrolled_at' => $enrolledAt,
            'completed_at' => $completedAt,
            'progress' => $progress,
          ]);
        }
      }
    }

    // Beberapa enrollments untuk free courses
    $freeCourses = Course::where('price', 0)->get();
    foreach ($users as $user) {
      $freeCoursesToEnroll = $freeCourses->random(rand(1, 2));

      foreach ($freeCoursesToEnroll as $course) {
        if (!Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
          $enrolledAt = now()->subDays(rand(1, 15));
          $progress = rand(20, 100);
          $completedAt = $progress === 100 ? $enrolledAt->copy()->addDays(rand(1, 7)) : null;

          Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'enrolled_at' => $enrolledAt,
            'completed_at' => $completedAt,
            'progress' => $progress,
          ]);
        }
      }
    }
  }
}
