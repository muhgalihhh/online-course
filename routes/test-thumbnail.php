<?php

use App\Models\Course;
use Illuminate\Support\Facades\Route;

Route::get('/test-thumbnail', function () {
    $course = Course::first();

    if (!$course) {
        return 'No courses found';
    }

    return [
        'course_id' => $course->id,
        'title' => $course->title,
        'thumbnail_path' => $course->thumbnail_path,
        'thumbnail' => $course->thumbnail,
        'storage_url' => asset('storage/' . $course->thumbnail_path),
        'app_url' => config('app.url'),
    ];
});
