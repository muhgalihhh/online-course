<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->timestamp('enrolled_at')->nullable()->after('course_id');
            $table->timestamp('completed_at')->nullable()->after('enrolled_at');
            $table->integer('progress')->default(0)->after('completed_at');
        });

        // Update existing records to have enrolled_at set to created_at
        DB::table('enrollments')->whereNull('enrolled_at')->update(['enrolled_at' => DB::raw('created_at')]);
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn(['enrolled_at', 'completed_at', 'progress']);
        });
    }
};