<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('transactionable'); // Menggunakan morphs untuk relasi polimorfik
            $table->string('midtrans_order_id')->unique();
            $table->unsignedInteger('amount');
            $table->string('status'); // e.g., 'pending', 'settlement', 'expire', 'cancel'
            $table->json('payment_details')->nullable(); // Menyimpan response dari Midtrans
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
