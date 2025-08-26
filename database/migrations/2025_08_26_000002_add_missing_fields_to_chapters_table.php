<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->integer('duration')->nullable()->comment('Duration in minutes')->after('description');
            $table->boolean('is_free')->default(false)->after('duration');
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn(['description', 'duration', 'is_free']);
        });
    }
};