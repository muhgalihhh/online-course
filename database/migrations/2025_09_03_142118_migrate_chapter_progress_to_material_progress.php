<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate chapter progress to material progress
        // For each completed chapter, mark all materials in that chapter as completed

        $completedChapters = DB::table('chapter_progress')
            ->where('is_completed', true)
            ->get();

        foreach ($completedChapters as $chapterProgress) {
            // Get all materials in this chapter
            $materials = DB::table('course_materials')
                ->where('chapter_id', $chapterProgress->chapter_id)
                ->get();

            foreach ($materials as $material) {
                // Create material progress record if not exists
                DB::table('material_progress')->insertOrIgnore([
                    'user_id' => $chapterProgress->user_id,
                    'course_material_id' => $material->id,
                    'enrollment_id' => $chapterProgress->enrollment_id,
                    'is_completed' => true,
                    'completed_at' => $chapterProgress->completed_at,
                    'time_spent' => 0,
                    'last_accessed_at' => $chapterProgress->completed_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Update enrollment progress based on completed materials
        $enrollments = DB::table('enrollments')->get();

        foreach ($enrollments as $enrollment) {
            // Get total materials in course
            $totalMaterials = DB::table('course_materials')
                ->join('chapters', 'course_materials.chapter_id', '=', 'chapters.id')
                ->where('chapters.course_id', $enrollment->course_id)
                ->count();

            if ($totalMaterials > 0) {
                // Get completed materials for this enrollment
                $completedMaterials = DB::table('material_progress')
                    ->where('enrollment_id', $enrollment->id)
                    ->where('is_completed', true)
                    ->count();

                $progress = round(($completedMaterials / $totalMaterials) * 100);

                DB::table('enrollments')
                    ->where('id', $enrollment->id)
                    ->update([
                            'progress' => $progress,
                            'completed_at' => $progress === 100 ? now() : null,
                            'updated_at' => now(),
                        ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear all material progress and revert to chapter-based progress
        DB::table('material_progress')->truncate();

        // Recalculate enrollment progress based on chapters
        $enrollments = DB::table('enrollments')->get();

        foreach ($enrollments as $enrollment) {
            $totalChapters = DB::table('chapters')
                ->where('course_id', $enrollment->course_id)
                ->count();

            if ($totalChapters > 0) {
                $completedChapters = DB::table('chapter_progress')
                    ->where('enrollment_id', $enrollment->id)
                    ->where('is_completed', true)
                    ->count();

                $progress = round(($completedChapters / $totalChapters) * 100);

                DB::table('enrollments')
                    ->where('id', $enrollment->id)
                    ->update([
                            'progress' => $progress,
                            'completed_at' => $progress === 100 ? now() : null,
                            'updated_at' => now(),
                        ]);
            }
        }
    }
};
