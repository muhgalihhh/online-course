<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::table('institutions', function (Blueprint $table) {
      // Social media links
      $table->string('tiktok_url')->nullable()->after('photo_path');
      $table->string('instagram_url')->nullable()->after('tiktok_url');
      $table->string('facebook_url')->nullable()->after('instagram_url');
      $table->string('twitter_url')->nullable()->after('facebook_url');
      // App store links
      $table->string('ios_app_url')->nullable()->after('twitter_url');
      $table->string('android_app_url')->nullable()->after('ios_app_url');
    });
  }

  public function down(): void
  {
    Schema::table('institutions', function (Blueprint $table) {
      $table->dropColumn([
        'tiktok_url',
        'instagram_url',
        'facebook_url',
        'twitter_url',
        'ios_app_url',
        'android_app_url',
      ]);
    });
  }
};
