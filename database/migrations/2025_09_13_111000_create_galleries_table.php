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
    Schema::create('galleries', function (Blueprint $table) {
      $table->id();
      $table->string('title');
      $table->text('description')->nullable();
      $table->string('file_path');
      $table->enum('file_type', ['image', 'video'])->default('image');
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Indexes untuk performa
      $table->index(['is_active', 'created_at']);
      $table->index('file_type');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('galleries');
  }
};
