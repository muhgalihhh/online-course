<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // Redirect old settings routes to admin settings for admin users
    Route::redirect('settings', '/admin/settings')->middleware('role:admin');
    
    // For non-admin users, redirect to dashboard
    Route::get('settings', function () {
        return redirect('/dashboard');
    })->name('profile.edit');
});