<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // First, update existing 'video' type to 'video_youtube' 
        DB::table('course_materials')
            ->where('type', 'video')
            ->update(['type' => 'video_youtube']);

        // For MySQL, we need to drop and recreate the enum
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE course_materials MODIFY COLUMN type ENUM('pdf', 'image', 'video_local', 'video_youtube') NOT NULL");
        } else {
            // For other databases like PostgreSQL, we'd handle it differently
            // This is a basic approach for this migration
            Schema::table('course_materials', function (Blueprint $table) {
                $table->string('type_temp')->nullable();
            });

            DB::table('course_materials')->update([
                'type_temp' => DB::raw('type')
            ]);

            Schema::table('course_materials', function (Blueprint $table) {
                $table->dropColumn('type');
            });

            Schema::table('course_materials', function (Blueprint $table) {
                $table->enum('type', ['pdf', 'image', 'video_local', 'video_youtube'])->after('order');
            });

            DB::table('course_materials')->update([
                'type' => DB::raw('type_temp')
            ]);

            Schema::table('course_materials', function (Blueprint $table) {
                $table->dropColumn('type_temp');
            });
        }
    }

    public function down(): void
    {
        // Revert video_youtube back to video for rollback
        DB::table('course_materials')
            ->where('type', 'video_youtube')
            ->update(['type' => 'video']);

        // Remove video_local entries or convert them if needed
        DB::table('course_materials')
            ->where('type', 'video_local')
            ->delete(); // or update to a different type as needed

        // Revert enum to original values
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE course_materials MODIFY COLUMN type ENUM('pdf', 'image', 'video') NOT NULL");
        } else {
            Schema::table('course_materials', function (Blueprint $table) {
                $table->dropColumn('type');
            });

            Schema::table('course_materials', function (Blueprint $table) {
                $table->enum('type', ['pdf', 'image', 'video'])->after('order');
            });
        }
    }
};