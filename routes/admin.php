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
    
    // Institution Management (Single Institution)
    Route::get('/institution', [AdminInstitutionController::class, 'edit'])->name('institution.edit');
    Route::patch('/institution', [AdminInstitutionController::class, 'update'])->name('institution.update');
    
    // Transaction Management (Dummy System)
    Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{transaction}', [AdminTransactionController::class, 'show'])->name('transactions.show');
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
    
    // Reviews (Institution and Course Reviews)
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::patch('/reviews/update-status', [AdminReviewController::class, 'updateStatus'])->name('reviews.update-status');
    Route::delete('/reviews/destroy', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');
    
    // Settings
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings');
    Route::patch('/settings', [AdminSettingController::class, 'update'])->name('settings.update');
});