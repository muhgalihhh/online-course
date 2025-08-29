<?php
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Fetch institution data for contact info
    $institution = \App\Models\Institution::first();

    // Fetch all categories for display
    $categories = \App\Models\Category::withCount('courses')->get();

    // Fetch top courses for the welcome page
    $topCourses = \App\Models\Course::with(['category', 'institution', 'reviews'])
        ->where('status', 'published')
        ->withAvg('reviews', 'rating')
        ->withCount('enrollments')
        ->orderBy('enrollments_count', 'desc')
        ->limit(6)
        ->get();

    // Add computed properties
    $topCourses->each(function ($course) {
        $course->average_rating = $course->reviews_avg_rating ?? 0;
        $course->total_reviews = $course->reviews->count();
        $course->total_students = $course->enrollments_count;
    });

    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'topCourses' => $topCourses,
        'institution' => $institution,
        'categories' => $categories,
    ]);
})->name('home');

// Public course routes (accessible without login)
Route::get('/courses', [\App\Http\Controllers\CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{id}', [\App\Http\Controllers\CourseController::class, 'show'])->name('courses.show');
Route::get('/kelas-pro', [\App\Http\Controllers\CourseController::class, 'pro'])->name('courses.pro');
Route::get('/kelas-free', [\App\Http\Controllers\CourseController::class, 'free'])->name('courses.free');
Route::get('/katalog-lembaga', [\App\Http\Controllers\CourseController::class, 'institutions'])->name('institutions.index');

// Course enrollment (requires authentication)
Route::middleware(['auth'])->group(function () {
    Route::get('/courses/{id}/enroll', [\App\Http\Controllers\CourseController::class, 'enroll'])->name('courses.enroll');
    Route::get('/courses/{id}/learn', [\App\Http\Controllers\CourseController::class, 'learn'])->name('courses.learn');
    Route::post('/payments/courses/{id}', [\App\Http\Controllers\PaymentController::class, 'createCourseTransaction'])
        ->name('payments.courses.create');
    
    // My Courses route (redirects based on role)
    Route::get('/my-courses', function () {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            // Admins don't have enrolled courses, redirect to courses management
            return redirect()->route('admin.courses.index');
        }
        
        return redirect()->route('user.my-courses');
    })->name('my-courses');
});

// Midtrans webhook (no auth)
Route::post('/payments/midtrans/webhook', [\App\Http\Controllers\PaymentController::class, 'handleMidtransWebhook'])
    ->name('payments.midtrans.webhook');

// Static pages
Route::get('/tentang', function () {
    // Fetch institution data for about page
    $institution = \App\Models\Institution::first();
    
    return Inertia::render('tentang', [
        'institution' => $institution
    ]);
})->name('about');

// Redirect old contact route to about page
Route::get('/kontak', function () {
    return redirect()->route('about');
})->name('contact');

// Dashboard untuk semua user yang login
Route::get('/dashboard', function () {
    $user = auth()->user();

    // Redirect berdasarkan role
    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('user.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');



// Test routes for error pages (remove in production)
if (app()->environment('local')) {
    Route::get('/test-404', function () {
        abort(404);
    });

    Route::get('/test-500', function () {
        abort(500);
    });

    Route::get('/test-403', function () {
        abort(403);
    });

    Route::get('/test-503', function () {
        abort(503);
    });

    Route::get('/test-419', function () {
        abort(419);
    });

    // Include test redirect routes
    require __DIR__ . '/test-redirect.php';
}

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/user.php';

// Catch all route for handling 404 and undefined routes
// This must be at the very bottom of all routes
Route::any('/{any}', function () {
    // Check if user is authenticated and trying to access admin/user routes
    $path = request()->path();
    $segments = explode('/', trim($path, '/'));

    if (auth()->check() && count($segments) > 0) {
        $prefix = $segments[0];

        // If user is trying to access admin routes but doesn't have permission
        if ($prefix === 'admin' && !auth()->user()->isAdmin()) {
            return Inertia::render('errors/403', [
                'status' => 403,
                'message' => 'You do not have permission to access this area.'
            ]);
        }

        // If admin is trying to access user routes
        if ($prefix === 'user' && auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
    }

    // Return 404 for all other cases
    return Inertia::render('errors/404', [
        'status' => 404,
        'message' => 'The page you are looking for could not be found.'
    ]);
})->where('any', '.*')->name('fallback');
