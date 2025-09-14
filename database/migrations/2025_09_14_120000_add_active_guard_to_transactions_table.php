<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Add virtual columns using raw SQL for MySQL
        // is_active: 1 when status in (pending, processing), else 0
        // active_guard: unique key materialized only for active rows (NULL for inactive) to leverage MySQL allowing multiple NULLs in UNIQUE index
        DB::statement("ALTER TABLE `transactions` ADD `is_active` TINYINT(1) AS (CASE WHEN `status` IN ('pending','processing') THEN 1 ELSE 0 END) VIRTUAL");
        DB::statement("ALTER TABLE `transactions` ADD `active_guard` VARCHAR(255) AS (CASE WHEN `status` IN ('pending','processing') THEN CONCAT(`user_id`,'#',`transactionable_type`,'#',`transactionable_id`) ELSE NULL END) VIRTUAL");

        // Unique index on active_guard ensures only one active row per user-course
        DB::statement("CREATE UNIQUE INDEX `uniq_active_tx_user_course` ON `transactions` (`active_guard`)");

        // Helpful composite index for lookups
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['user_id', 'transactionable_type', 'transactionable_id', 'is_active'], 'idx_tx_user_course_active');
        });
    }

    public function down(): void
    {
        // Drop the unique index and the virtual columns
        DB::statement("DROP INDEX `uniq_active_tx_user_course` ON `transactions`");
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_tx_user_course_active');
        });
        DB::statement("ALTER TABLE `transactions` DROP COLUMN `active_guard`");
        DB::statement("ALTER TABLE `transactions` DROP COLUMN `is_active`");
    }
};

