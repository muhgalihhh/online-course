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
        Schema::table('transactions', function (Blueprint $table) {
            // 1. Ubah midtrans_order_id jadi nullable (karena Flip tidak punya ini)
            $table->string('midtrans_order_id')->nullable()->change();

            // 2. Tambah kolom khusus Flip & Penanda Gateway
            $table->string('flip_bill_id')->nullable()->unique()->after('midtrans_order_id');
            $table->string('payment_gateway')->default('midtrans')->after('status');
            // payment_gateway isinya nanti 'midtrans' atau 'flip'
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable(false)->change();
            $table->dropColumn(['flip_bill_id', 'payment_gateway']);
        });
    }
};
