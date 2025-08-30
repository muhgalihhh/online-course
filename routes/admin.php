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
use App\Http\Controllers\Admin\HelpSupportController as AdminHelpSupportController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Routes untuk Admin
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Redirect /admin to /admin/dashboard
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [AdminController::class, 'export'])->name('dashboard.export');


    // User Management
    Route::resource('users', AdminUserController::class);

    // Course Management
    Route::resource('courses', AdminCourseController::class);
    Route::patch('/courses/{course}/toggle-publish', [AdminCourseController::class, 'togglePublish'])->name('courses.toggle-publish');

    // Category Management
    Route::resource('categories', AdminCategoryController::class);

    // Institution Management (single profile: only index, edit, update)
    Route::get('/institutions', [AdminInstitutionController::class, 'index'])->name('institutions.index');
    Route::get('/institutions/edit', [AdminInstitutionController::class, 'edit'])->name('institutions.edit');
    Route::patch('/institutions', [AdminInstitutionController::class, 'update'])->name('institutions.update');

    // Transaction Management (Read-only)
    Route::resource('transactions', AdminTransactionController::class)->only(['index', 'show']);

    // Chapter Management
    Route::resource('chapters', AdminChapterController::class);
    Route::get('/courses/{course}/chapters', [AdminChapterController::class, 'byCourse'])->name('chapters.by-course');

    // Course Material Management
    Route::resource('materials', AdminCourseMaterialController::class);
    Route::get('/chapters/{chapter}/materials', [AdminCourseMaterialController::class, 'byChapter'])->name('materials.by-chapter');
    Route::post('/materials/upload', [AdminCourseMaterialController::class, 'uploadFile'])->name('materials.upload');

    // Analytics
    Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
    Route::get('/analytics/export', [AdminAnalyticsController::class, 'export'])->name('analytics.export');

    // Reviews
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews');
    Route::patch('/reviews/{review}/status', [AdminReviewController::class, 'updateStatus'])->name('reviews.update-status');
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    // Settings (simplified - only profile and password management)
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings');
    Route::post('/settings/profile', [AdminSettingController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/password', [AdminSettingController::class, 'updatePassword'])->name('settings.password');
    Route::delete('/settings/account', [AdminSettingController::class, 'deleteAccount'])->name('settings.account');

    // Help & Support
    Route::get('/help-support', [AdminHelpSupportController::class, 'index'])->name('help-support');
    Route::post('/help-support/ticket', [AdminHelpSupportController::class, 'submitTicket'])->name('help-support.ticket');
});
