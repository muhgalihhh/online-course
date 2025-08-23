<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            // Add description field
            $table->text('description')->nullable()->after('name');
            
            // Rename phone_number to phone for consistency
            $table->renameColumn('phone_number', 'phone');
            
            // Remove unique constraint from email since we only have one institution
            $table->dropUnique(['email']);
        });
    }

    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            // Remove description field
            $table->dropColumn('description');
            
            // Rename phone back to phone_number
            $table->renameColumn('phone', 'phone_number');
            
            // Add back unique constraint
            $table->unique('email');
        });
    }
};