<?php

namespace Database\Seeders;

use App\Models\ChapterProgress;
use App\Models\Enrollment;
use App\Models\Chapter;
use Illuminate\Database\Seeder;

class ChapterProgressSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $enrollments = Enrollment::with('course.chapters')->get();

    foreach ($enrollments as $enrollment) {
      $chapters = $enrollment->course->chapters()->orderBy('order')->get();
      $totalChapters = $chapters->count();

      if ($totalChapters === 0)
        continue;

      // Hitung berapa chapter yang harus completed berdasarkan progress enrollment
      $progressPercentage = $enrollment->progress;
      $completedChaptersCount = (int) floor(($progressPercentage / 100) * $totalChapters);

      foreach ($chapters as $index => $chapter) {
        $isCompleted = $index < $completedChaptersCount;
        $timeSpent = $isCompleted ? rand(60, $chapter->duration * 60) : rand(0, $chapter->duration * 30);
        $lastAccessedAt = $enrollment->enrolled_at->addDays(rand(0, 30));
        $completedAt = $isCompleted ? $lastAccessedAt->copy()->addMinutes(rand(30, 120)) : null;

        ChapterProgress::create([
          'user_id' => $enrollment->user_id,
          'chapter_id' => $chapter->id,
          'enrollment_id' => $enrollment->id,
          'is_completed' => $isCompleted,
          'completed_at' => $completedAt,
          'time_spent' => $timeSpent, // dalam detik
          'last_accessed_at' => $lastAccessedAt,
          'created_at' => $lastAccessedAt,
          'updated_at' => $completedAt ?? $lastAccessedAt,
        ]);
      }

      // Jika ada chapter yang partially completed (user sedang belajar)
      if ($completedChaptersCount < $totalChapters && $progressPercentage > 0) {
        $currentChapterIndex = $completedChaptersCount;
        if (isset($chapters[$currentChapterIndex])) {
          $currentChapter = $chapters[$currentChapterIndex];

          // Update chapter progress yang sedang dipelajari
          ChapterProgress::where('user_id', $enrollment->user_id)
            ->where('chapter_id', $currentChapter->id)
            ->update([
              'time_spent' => rand($currentChapter->duration * 15, $currentChapter->duration * 45), // 25-75% dari durasi
              'last_accessed_at' => now()->subHours(rand(1, 48)),
            ]);
        }
      }
    }
  }
}
