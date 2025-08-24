<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\InstitutionController as AdminInstitutionController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\ChapterController as AdminChapterController;
use App\Http\Controllers\Admin\CourseMaterialController as AdminCourseMaterialController;
use App\Http\Controllers\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Routes untuk Admin
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
    
    // User Management
    Route::resource('users', AdminUserController::class);
    
    // Course Management
    Route::resource('courses', AdminCourseController::class);
    
    // Category Management
    Route::resource('categories', AdminCategoryController::class);
    
    // Institution Management
    Route::resource('institutions', AdminInstitutionController::class);
    
    // Transaction Management
    Route::resource('transactions', AdminTransactionController::class)->except(['create', 'store', 'edit', 'update']);
    Route::patch('/transactions/{transaction}/status', [AdminTransactionController::class, 'updateStatus'])->name('transactions.update-status');
    
    // Chapter Management
    Route::resource('chapters', AdminChapterController::class);
    Route::get('/courses/{course}/chapters', [AdminChapterController::class, 'byCourse'])->name('chapters.by-course');
    
    // Course Material Management
    Route::resource('materials', AdminCourseMaterialController::class);
    Route::get('/chapters/{chapter}/materials', [AdminCourseMaterialController::class, 'byChapter'])->name('materials.by-chapter');
    Route::post('/materials/upload', [AdminCourseMaterialController::class, 'uploadFile'])->name('materials.upload');
    
    // Analytics
    Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
    
    // Reviews
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews');
    Route::patch('/reviews/{review}/status', [AdminReviewController::class, 'updateStatus'])->name('reviews.update-status');
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');
    
    // Settings
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings');
    Route::patch('/settings', [AdminSettingController::class, 'update'])->name('settings.update');
});