<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Test routes untuk memverifikasi redirect dan error handling
 * 
 * Test scenarios:
 * 1. /admin -> redirect ke /admin/dashboard
 * 2. /user -> redirect ke /user/dashboard  
 * 3. /admin/nonexistent -> custom 404 page
 * 4. /user/kocak -> custom 404 page
 * 5. /random/path -> custom 404 page
 */

// Test untuk memverifikasi behavior
Route::get('/test-redirects', function () {
    $tests = [
        [
            'url' => '/admin',
            'expected' => 'Redirect to /admin/dashboard (if authenticated as admin)',
            'description' => 'Accessing /admin should redirect to admin dashboard'
        ],
        [
            'url' => '/user', 
            'expected' => 'Redirect to /user/dashboard (if authenticated as user)',
            'description' => 'Accessing /user should redirect to user dashboard'
        ],
        [
            'url' => '/admin/nonexistent',
            'expected' => 'Custom 404 error page',
            'description' => 'Non-existent admin route should show custom 404'
        ],
        [
            'url' => '/user/kocak',
            'expected' => 'Custom 404 error page',
            'description' => 'Non-existent user route should show custom 404'
        ],
        [
            'url' => '/random/path/here',
            'expected' => 'Custom 404 error page',
            'description' => 'Random path should show custom 404'
        ]
    ];
    
    return response()->json([
        'message' => 'Redirect and Error Handling Test Cases',
        'tests' => $tests,
        'note' => 'Access each URL to test the behavior'
    ]);
});