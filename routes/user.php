<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Routes untuk User
Route::middleware(['auth', 'verified', 'role:user'])->prefix('user')->name('user.')->group(function () {
    // Redirect /user to /user/dashboard
    Route::get('/', function () {
        return redirect()->route('user.dashboard');
    });
    
    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');
    Route::get('/profile', [UserController::class, 'profile'])->name('profile');
    Route::get('/my-courses', [UserController::class, 'myCourses'])->name('my-courses');
});