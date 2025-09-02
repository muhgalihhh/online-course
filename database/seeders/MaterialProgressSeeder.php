<?php

namespace Database\Seeders;

use App\Models\MaterialProgress;
use App\Models\Enrollment;
use App\Models\CourseMaterial;
use Illuminate\Database\Seeder;

class MaterialProgressSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $enrollments = Enrollment::with('course.chapters.courseMaterials')->get();

    foreach ($enrollments as $enrollment) {
      $allMaterials = collect();

      // Kumpulkan semua materials dari semua chapters dalam course
      foreach ($enrollment->course->chapters as $chapter) {
        $allMaterials = $allMaterials->merge($chapter->courseMaterials);
      }

      $totalMaterials = $allMaterials->count();
      if ($totalMaterials === 0)
        continue;

      // Hitung berapa material yang harus completed berdasarkan progress enrollment
      $progressPercentage = $enrollment->progress;
      $completedMaterialsCount = (int) floor(($progressPercentage / 100) * $totalMaterials);

      // Sort materials by chapter order and material order
      $sortedMaterials = $allMaterials->sortBy(function ($material) {
        return [$material->chapter->order, $material->order];
      });

      foreach ($sortedMaterials as $index => $material) {
        $isCompleted = $index < $completedMaterialsCount;

        // Tentukan time spent berdasarkan type material
        $baseTimeSpent = match ($material->type) {
          'video' => rand(300, 1800), // 5-30 menit untuk video
          'document' => rand(180, 900), // 3-15 menit untuk document
          'quiz' => rand(120, 600), // 2-10 menit untuk quiz
          'assignment' => rand(600, 3600), // 10-60 menit untuk assignment
          default => rand(300, 1200), // 5-20 menit default
        };

        $timeSpent = $isCompleted ? $baseTimeSpent : rand(0, (int) ($baseTimeSpent * 0.3));
        $lastAccessedAt = $enrollment->enrolled_at->addDays(rand(0, 45));
        $completedAt = $isCompleted ? $lastAccessedAt->copy()->addMinutes(rand(5, 60)) : null;

        MaterialProgress::create([
          'user_id' => $enrollment->user_id,
          'course_material_id' => $material->id,
          'enrollment_id' => $enrollment->id,
          'is_completed' => $isCompleted,
          'completed_at' => $completedAt,
          'time_spent' => $timeSpent, // dalam detik
          'last_accessed_at' => $lastAccessedAt,
          'created_at' => $lastAccessedAt,
          'updated_at' => $completedAt ?? $lastAccessedAt,
        ]);
      }

      // Jika ada material yang partially completed (user sedang belajar)
      if ($completedMaterialsCount < $totalMaterials && $progressPercentage > 0) {
        $currentMaterialIndex = $completedMaterialsCount;
        $sortedMaterialsArray = $sortedMaterials->values();

        if (isset($sortedMaterialsArray[$currentMaterialIndex])) {
          $currentMaterial = $sortedMaterialsArray[$currentMaterialIndex];

          // Update material progress yang sedang dipelajari
          MaterialProgress::where('user_id', $enrollment->user_id)
            ->where('course_material_id', $currentMaterial->id)
            ->update([
              'time_spent' => match ($currentMaterial->type) {
                'video' => rand(60, 300), // Baru nonton 1-5 menit
                'document' => rand(30, 180), // Baru baca 0.5-3 menit
                'quiz' => rand(30, 120), // Baru ngerjain 0.5-2 menit
                'assignment' => rand(120, 600), // Baru ngerjain 2-10 menit
                default => rand(60, 240),
              },
              'last_accessed_at' => now()->subHours(rand(1, 72)),
            ]);
        }
      }
    }
  }
}
