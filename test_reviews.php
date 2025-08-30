<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Testing database connection...\n";
    
    // Test basic DB connection
    $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "Database connected successfully\n";
    
    // Check if tables exist
    $tables = \Illuminate\Support\Facades\DB::select("SELECT name FROM sqlite_master WHERE type='table'");
    echo "Available tables:\n";
    foreach ($tables as $table) {
        echo "- " . $table->name . "\n";
    }
    
    // Check reviews count
    $reviewsCount = \App\Models\Review::count();
    echo "\nInstitution reviews count: $reviewsCount\n";
    
    $courseReviewsCount = \App\Models\CourseReview::count();
    echo "Course reviews count: $courseReviewsCount\n";
    
    // Check if status column exists
    $reviewColumns = \Illuminate\Support\Facades\Schema::getColumnListing('reviews');
    echo "\nReviews table columns: " . implode(', ', $reviewColumns) . "\n";
    
    $courseReviewColumns = \Illuminate\Support\Facades\Schema::getColumnListing('course_reviews');
    echo "Course reviews table columns: " . implode(', ', $courseReviewColumns) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
