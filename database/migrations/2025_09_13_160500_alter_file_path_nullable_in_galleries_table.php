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
    // Ubah kolom file_path menjadi nullable untuk mendukung video YouTube
    Schema::table('galleries', function (Blueprint $table) {
      $table->string('file_path')->nullable()->change();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('galleries', function (Blueprint $table) {
      $table->string('file_path')->nullable(false)->change();
    });
  }
};
