<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('material_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_material_id')->constrained('course_materials')->onDelete('cascade');
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->integer('time_spent')->default(0); // in seconds
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();

            // Add indexes for better performance
            $table->index(['user_id', 'course_material_id']);
            $table->index(['enrollment_id', 'is_completed']);

            // Prevent duplicate progress records for same user-material-enrollment
            $table->unique(['user_id', 'course_material_id', 'enrollment_id'], 'material_progress_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_progress');
    }
};
