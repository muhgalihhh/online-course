<?php

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\GalleryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Institution location for weather widget
Route::get('/institution/location', function () {
    $institution = \App\Models\Institution::first();
    return response()->json([
        'address' => $institution?->address ?? 'Pare, Kediri'
    ]);
});

// Transaction API routes
Route::middleware(['web', 'auth', 'prevent.admin'])->group(function () {
    Route::get('/transactions', [PaymentController::class, 'getUserTransactions'])
        ->name('api.transactions');
    Route::delete('/transactions/{orderId}', [PaymentController::class, 'cancelTransaction'])
        ->name('api.transactions.cancel');
    Route::get('/transactions/{orderId}/status', [PaymentController::class, 'checkTransactionStatus'])
        ->name('api.transactions.status');
});

// User enrollment check API
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/user/enrollment/{courseId}/check', [EnrollmentController::class, 'checkEnrollment'])
        ->name('api.user.enrollment.check');
});

// Public Gallery API
Route::prefix('gallery')->group(function () {
    Route::get('/', [GalleryController::class, 'index'])->name('api.gallery.index');
    Route::get('/{gallery}', [GalleryController::class, 'show'])->name('api.gallery.show');
    Route::get('/youtube/videos', [GalleryController::class, 'youtubeVideos'])->name('api.gallery.youtube');
});
