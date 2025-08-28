<?php
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

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
