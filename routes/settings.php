<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // Redirect old settings routes to admin settings for admin users
    Route::redirect('settings', '/admin/settings')->middleware('role:admin');
    Route::redirect('settings/profile', '/admin/settings')->middleware('role:admin');
    Route::redirect('settings/password', '/admin/settings')->middleware('role:admin');
    Route::redirect('settings/appearance', '/admin/settings')->middleware('role:admin');
    
    // Keep the old routes for non-admin users (will show 403 if they try to access)
    Route::get('settings', function () {
        return redirect('/dashboard');
    })->name('profile.edit');
    
    Route::get('settings/profile', function () {
        return redirect('/dashboard');
    })->name('profile.update');
    
    Route::get('settings/password', function () {
        return redirect('/dashboard');
    })->name('password.edit');
    
    Route::get('settings/appearance', function () {
        return redirect('/dashboard');
    })->name('appearance');
});
