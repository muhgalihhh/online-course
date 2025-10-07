<?php
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\SecureVideoController;
use App\Models\User;

// Include test route for debugging
require __DIR__ . '/test-youtube.php';
require __DIR__ . '/test-youtube-web.php';
require __DIR__ . '/debug-admin.php';
require __DIR__ . '/debug-materials.php';
require __DIR__ . '/test-video.php';
require __DIR__ . '/quick-admin.php';
require __DIR__ . '/test-payment.php';

Route::get('/', function () {
    // Fetch institution data for contact info
    $institution = \App\Models\Institution::first();

    // Fetch all categories for display
    $categories = \App\Models\Category::withCount('courses')->get();

    // Get payment status service
    $paymentStatusService = app(\App\Services\CoursePaymentStatusService::class);

    // Fetch top courses for the welcome page
    $topCoursesQuery = \App\Models\Course::with(['category', 'institution', 'reviews'])
        ->where('status', 'published')
        ->withAvg('reviews', 'rating')
        ->withCount('enrollments');

    if (Auth::check()) {
        $topCoursesQuery->withCount([
            'enrollments as is_enrolled' => function ($q) {
                $q->where('user_id', Auth::id());
            }
        ]);
    }

    $topCourses = $topCoursesQuery
        ->orderBy('enrollments_count', 'desc')
        ->limit(6)
        ->get();

    // Add computed properties and payment status
    $topCourses->each(function ($course) use ($paymentStatusService) {
        $course->average_rating = (float) ($course->reviews_avg_rating ?? 0);
        $course->total_reviews = $course->reviews->count();
        $course->total_students = $course->enrollments_count;

        // Get payment status for authenticated users
        if (Auth::check()) {
            $paymentStatus = $paymentStatusService->getCourseStatus(Auth::user(), $course);
            $course->is_enrolled = $paymentStatus['status'] === 'enrolled';
            $course->payment_status = $paymentStatus['status'];
            $course->button_text = $paymentStatus['button_text'];
            $course->transaction = $paymentStatus['transaction'];
        } else {
            $course->is_enrolled = false;
            $course->payment_status = 'can_purchase';
            $course->button_text = $course->is_pro ? 'Beli Sekarang' : 'Ikuti Kursus';
            $course->transaction = null;
        }
    });

    // Fetch featured gallery items for homepage
    $galleryItems = \App\Models\Gallery::active()
        ->latest()
        ->limit(6)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'file_type' => $item->file_type,
                'file_url' => $item->file_url,
                'youtube_thumbnail' => $item->youtube_thumbnail,
                'youtube_embed_url' => $item->youtube_embed_url,
                'is_youtube_video' => $item->isYouTubeVideo(),
                'is_image' => $item->isImage(),
                'is_video' => $item->isVideo(),
            ];
        });

    // Fetch frequently asked questions for homepage
    $faqItems = \App\Models\Faq::active()
        ->ordered()
        ->limit(5)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'question' => $item->question,
                'answer' => $item->answer,
                'category' => $item->category,
                'category_name' => $item->category_name,
            ];
        });

    // Calculate real statistics from database
    $totalCourses = \App\Models\Course::where('status', 'published')->count();
    $totalStudents = \App\Models\Enrollment::distinct('user_id')->count();
    $averageRating = \App\Models\CourseReview::avg('rating') ?? 0;

    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'topCourses' => $topCourses,
        'galleryItems' => $galleryItems,
        'faqItems' => $faqItems,
        'institution' => $institution,
        'categories' => $categories,
        'stats' => [
            'total_courses' => $totalCourses,
            'total_students' => $totalStudents,
            'average_rating' => round($averageRating, 1)
        ]
    ]);
})->name('home');

// Public course routes (accessible without login)
Route::get('/courses', [\App\Http\Controllers\CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{id}', [\App\Http\Controllers\CourseController::class, 'show'])->name('courses.show');
Route::get('/kelas-pro', [\App\Http\Controllers\CourseController::class, 'pro'])->name('courses.pro');
Route::get('/kelas-free', [\App\Http\Controllers\CourseController::class, 'free'])->name('courses.free');
Route::get('/katalog-lembaga', [\App\Http\Controllers\CourseController::class, 'institutions'])->name('institutions.index');

// Public accommodation routes (accessible without login)
Route::get('/accommodations', [\App\Http\Controllers\AccommodationController::class, 'index'])->name('accommodations.index');
Route::get('/accommodations/{accommodation}', [\App\Http\Controllers\AccommodationController::class, 'show'])->name('accommodations.show');

// Public FAQ route (accessible without login)
Route::get('/faq', [\App\Http\Controllers\FaqController::class, 'index'])->name('faq.index');

// Other institutions routes (accessible without login)
Route::get('/lembaga-lain', [\App\Http\Controllers\OtherInstitutionController::class, 'index'])->name('other-institutions.index');
Route::get('/lembaga-lain/{institution}', [\App\Http\Controllers\OtherInstitutionController::class, 'show'])->name('other-institutions.show');

// Gallery routes (accessible without login)
Route::get('/galeri', [\App\Http\Controllers\GalleryController::class, 'index'])->name('gallery.index');

// Live Chat Demo route (for testing purposes)
Route::get('/live-chat-demo', function () {
    return Inertia::render('live-chat-demo');
})->name('live-chat-demo');

// API routes for gallery
Route::get('/api/gallery', [\App\Http\Controllers\GalleryController::class, 'api'])->name('api.gallery');

// Course enrollment (requires authentication and prevent admin access)
Route::middleware(['auth', 'prevent.admin'])->group(function () {
    Route::get('/courses/{id}/enroll', [\App\Http\Controllers\CourseController::class, 'enroll'])->name('courses.enroll');
    Route::post('/courses/{id}/enroll-free', [\App\Http\Controllers\CourseController::class, 'enrollFree'])->name('courses.enroll-free');
    Route::post('/payments/courses/{id}', [\App\Http\Controllers\PaymentController::class, 'createCourseTransaction'])
        ->name('payments.courses.create');
    Route::get('/payments/courses/{id}', [\App\Http\Controllers\PaymentController::class, 'showPaymentPage'])
        ->name('payments.show');
    Route::post('/payments/{orderId}/refresh-token', [\App\Http\Controllers\PaymentController::class, 'refreshSnapToken'])
        ->name('payments.refresh-token');
    Route::post('/payments/{orderId}/verify-and-enroll', [\App\Http\Controllers\PaymentController::class, 'verifyPaymentAndEnroll'])
        ->name('payments.verify-enroll');
    Route::get('/transactions/{orderId}', [\App\Http\Controllers\PaymentController::class, 'showTransaction'])
        ->name('transactions.show');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/courses/{id}/learn', [\App\Http\Controllers\CourseController::class, 'learn'])->name('courses.learn');
    // Course discussions
    Route::get('/courses/{course}/discussion', [\App\Http\Controllers\DiscussionController::class, 'index'])->name('courses.discussion.index');
    Route::post('/courses/{course}/discussion', [\App\Http\Controllers\DiscussionController::class, 'store'])->name('courses.discussion.store');
    Route::post('/courses/{course}/chapters/{chapter}/complete', [\App\Http\Controllers\CourseController::class, 'completeChapter'])
        ->name('courses.chapters.complete');
    Route::post('/courses/{course}/materials/{material}/complete', [\App\Http\Controllers\CourseController::class, 'completeMaterial'])
        ->name('courses.materials.complete');

    // Review routes (requires authentication)
    Route::post('/reviews/institution', [\App\Http\Controllers\ReviewController::class, 'storeInstitutionReview'])
        ->name('reviews.institution.store');
    Route::post('/reviews/course/{course}', [\App\Http\Controllers\ReviewController::class, 'storeCourseReview'])
        ->name('reviews.course.store');

    // My Courses route (redirects based on role)
    Route::get('/my-courses', function () {
        /** @var User $user */
        $user = Auth::user();

        if ($user->isAdmin()) {
            // Admins don't have enrolled courses, redirect to courses management
            return redirect()->route('admin.courses.index');
        }

        return redirect()->route('user.my-courses');
    })->name('my-courses');
});

// Midtrans webhook (no auth, but with signature verification)
Route::post('/payments/midtrans/webhook', [\App\Http\Controllers\PaymentController::class, 'handleMidtransWebhook'])
    ->middleware('midtrans.webhook')
    ->name('payments.midtrans.webhook');

// Static pages
Route::get('/tentang', function () {
    // Fetch institution data for about page
    $institution = \App\Models\Institution::first();

    // Calculate real statistics from database
    $totalCourses = \App\Models\Course::where('status', 'published')->count();
    $totalStudents = \App\Models\Enrollment::distinct('user_id')->count();
    $averageRating = \App\Models\CourseReview::avg('rating') ?? 0;
    $satisfactionRate = 98; // You can calculate this from reviews or user feedback later

    // Fetch institution reviews
    $institutionReviews = \App\Models\Review::with(['user'])
        ->where('institution_id', $institution->id ?? 1)
        ->where('status', 'approved')
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

    return Inertia::render('tentang', [
        'institution' => $institution,
        'reviews' => $institutionReviews,
        'stats' => [
            'total_students' => $totalStudents,
            'total_courses' => $totalCourses,
            'satisfaction_rate' => $satisfactionRate,
            'average_rating' => round($averageRating, 1)
        ]
    ]);
})->name('about');

// Redirect old contact route to about page
Route::get('/kontak', function () {
    return redirect()->route('about');
})->name('contact');

// Dashboard untuk semua user yang login
Route::get('/dashboard', function () {
    /** @var User $user */
    $user = Auth::user();

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

// Secure video routes MUST be placed BEFORE the catch-all fallback route.
// Previously these routes were below the fallback, causing /secure/... URLs
// to be intercepted by the wildcard and returning a 404 page inside the iframe/video.
Route::middleware(['auth', 'anti.piracy'])->group(function () {
    Route::get('/secure/video/{token}', [SecureVideoController::class, 'streamVideo'])->name('secure.video.stream');
    Route::get('/secure/youtube/embed', [SecureVideoController::class, 'youtubeEmbed'])->name('secure.youtube.embed');
});

// Catch all route for handling 404 and undefined routes
// This must remain at the very bottom AFTER all other explicit routes
Route::any('/{any}', function () {
    // Check if user is authenticated and trying to access admin/user routes
    $path = request()->path();
    $segments = explode('/', trim($path, '/'));

    if (Auth::check() && count($segments) > 0) {
        /** @var User $user */
        $user = Auth::user();
        $prefix = $segments[0];

        // If user is trying to access admin routes but doesn't have permission
        if ($prefix === 'admin' && !$user->isAdmin()) {
            return Inertia::render('errors/403', [
                'status' => 403,
                'message' => 'You do not have permission to access this area.'
            ]);
        }

        // If admin is trying to access user routes
        if ($prefix === 'user' && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
    }

    // Return 404 for all other cases
    return Inertia::render('errors/404', [
        'status' => 404,
        'message' => 'The page you are looking for could not be found.'
    ]);
})->where('any', '.*')->name('fallback');
