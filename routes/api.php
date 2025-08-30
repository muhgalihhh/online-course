<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Transaction API routes
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/transactions', [PaymentController::class, 'getUserTransactions'])
        ->name('api.transactions');
    Route::delete('/transactions/{orderId}', [PaymentController::class, 'cancelTransaction'])
        ->name('api.transactions.cancel');
    Route::get('/transactions/{orderId}/status', [PaymentController::class, 'checkTransactionStatus'])
        ->name('api.transactions.status');
});
