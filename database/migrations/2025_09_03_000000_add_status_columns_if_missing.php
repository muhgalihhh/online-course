<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // Ensure status column exists on reviews
    if (Schema::hasTable('reviews') && !Schema::hasColumn('reviews', 'status')) {
      Schema::table('reviews', function (Blueprint $table) {
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('comment');
      });
    }

    // Ensure status column exists on course_reviews
    if (Schema::hasTable('course_reviews') && !Schema::hasColumn('course_reviews', 'status')) {
      Schema::table('course_reviews', function (Blueprint $table) {
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->after('comment');
      });
    }
  }

  public function down(): void
  {
    // Don't drop columns to avoid data loss (safe rollback)
    // If needed, uncomment below
    // if (Schema::hasTable('reviews') && Schema::hasColumn('reviews', 'status')) {
    //     Schema::table('reviews', function (Blueprint $table) { $table->dropColumn('status'); });
    // }
    // if (Schema::hasTable('course_reviews') && Schema::hasColumn('course_reviews', 'status')) {
    //     Schema::table('course_reviews', function (Blueprint $table) { $table->dropColumn('status'); });
    // }
  }
};
