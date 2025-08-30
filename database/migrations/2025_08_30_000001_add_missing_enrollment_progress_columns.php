<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('enrollments')) {
            Schema::table('enrollments', function (Blueprint $table) {
                if (!Schema::hasColumn('enrollments', 'enrolled_at')) {
                    $table->timestamp('enrolled_at')->nullable()->after('course_id');
                }
                if (!Schema::hasColumn('enrollments', 'completed_at')) {
                    $table->timestamp('completed_at')->nullable()->after('enrolled_at');
                }
                if (!Schema::hasColumn('enrollments', 'progress')) {
                    $table->integer('progress')->default(0)->after('completed_at');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('enrollments')) {
            Schema::table('enrollments', function (Blueprint $table) {
                if (Schema::hasColumn('enrollments', 'progress')) {
                    $table->dropColumn('progress');
                }
                if (Schema::hasColumn('enrollments', 'completed_at')) {
                    $table->dropColumn('completed_at');
                }
                if (Schema::hasColumn('enrollments', 'enrolled_at')) {
                    $table->dropColumn('enrolled_at');
                }
            });
        }
    }
};
