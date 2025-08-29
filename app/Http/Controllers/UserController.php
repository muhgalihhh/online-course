<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        
        // Get user's enrolled courses with progress
        $enrollments = \App\Models\Enrollment::with(['course' => function($query) {
            $query->with(['category', 'institution', 'chapters'])
                ->where('status', 'published')
                ->withAvg('reviews', 'rating')
                ->withCount(['enrollments', 'chapters']);
        }])
        ->where('user_id', $user->id)
        ->orderBy('enrolled_at', 'desc')
        ->get()
        ->map(function ($enrollment) {
            $course = $enrollment->course;
            if ($course) {
                $course->average_rating = $course->reviews_avg_rating ?? 0;
                $course->total_students = $course->enrollments_count;
                $course->total_chapters = $course->chapters_count;
                $course->user_progress = $enrollment->progress;
                $course->enrolled_at = $enrollment->enrolled_at;
                $course->completed_at = $enrollment->completed_at;
            }
            return $course;
        })
        ->filter(); // Remove null courses

        return Inertia::render('user/home', [
            'user' => $user->only(['name', 'email', 'role', 'created_at']),
            'enrollments' => $enrollments
        ]);
    }

    public function profile()
    {
        return Inertia::render('user/profile', [
            'user' => auth()->user()->only(['name', 'email', 'created_at'])
        ]);
    }

    public function myCourses()
    {
        $user = auth()->user();
        
        // Get user's enrolled courses with progress
        $enrollments = \App\Models\Enrollment::with(['course' => function($query) {
            $query->with(['category', 'institution', 'chapters'])
                ->where('status', 'published')
                ->withAvg('reviews', 'rating')
                ->withCount(['enrollments', 'chapters']);
        }])
        ->where('user_id', $user->id)
        ->orderBy('enrolled_at', 'desc')
        ->get()
        ->map(function ($enrollment) {
            $course = $enrollment->course;
            if ($course) {
                $course->average_rating = $course->reviews_avg_rating ?? 0;
                $course->total_students = $course->enrollments_count;
                $course->total_chapters = $course->chapters_count;
                $course->user_progress = $enrollment->progress;
                $course->enrolled_at = $enrollment->enrolled_at;
                $course->completed_at = $enrollment->completed_at;
            }
            return $course;
        })
        ->filter(); // Remove null courses

        return Inertia::render('user/my-courses', [
            'enrollments' => $enrollments
        ]);
    }
}