<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // Clean existing duplicates (keep the earliest id)
    DB::transaction(function () {
      $duplicates = DB::table('enrollments')
        ->select('user_id', 'course_id', DB::raw('COUNT(*) as total'))
        ->groupBy('user_id', 'course_id')
        ->having('total', '>', 1)
        ->get();

      foreach ($duplicates as $dup) {
        $ids = DB::table('enrollments')
          ->where('user_id', $dup->user_id)
          ->where('course_id', $dup->course_id)
          ->orderBy('id')
          ->pluck('id');

        // Keep first id, delete the rest
        $idsToDelete = $ids->slice(1); // skip the first
        if ($idsToDelete->isNotEmpty()) {
          DB::table('enrollments')->whereIn('id', $idsToDelete)->delete();
        }
      }
    });

    Schema::table('enrollments', function (Blueprint $table) {
      // Add unique index if not exists
      // Some DBs (like SQLite used in testing) will ignore if already exists; try/catch for safety
      try {
        $table->unique(['user_id', 'course_id'], 'enrollments_user_course_unique');
      } catch (\Throwable $e) {
        // Ignore if cannot add (e.g., already exists)
      }
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('enrollments', function (Blueprint $table) {
      try {
        $table->dropUnique('enrollments_user_course_unique');
      } catch (\Throwable $e) {
        // Ignore
      }
    });
  }
};
