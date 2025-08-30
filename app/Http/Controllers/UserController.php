<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();

        // Get user's enrolled courses with progress
        $enrollmentsQuery = \App\Models\Enrollment::with([
            'course' => function ($query) {
                $query->with(['category', 'institution', 'chapters'])
                    ->where('status', 'published')
                    ->withAvg('reviews', 'rating')
                    ->withCount(['enrollments', 'chapters']);
            }
        ])
            ->where('user_id', $user->id);

        // Check if enrolled_at column exists and order accordingly
        try {
            $enrollments = $enrollmentsQuery->orderBy('enrolled_at', 'desc')->get();
        } catch (\Exception $e) {
            // If enrolled_at doesn't exist, use created_at
            $enrollments = $enrollmentsQuery->orderBy('created_at', 'desc')->get();
        }

        $enrollments = $enrollments->map(function ($enrollment) {
            $course = $enrollment->course;
            if ($course) {
                $course->average_rating = (float) ($course->reviews_avg_rating ?? 0);
                $course->total_students = $course->enrollments_count;
                $course->total_chapters = $course->chapters_count;

                // Safely access columns that might not exist
                $course->user_progress = $enrollment->progress ?? 0;
                $course->enrolled_at = $enrollment->enrolled_at ?? $enrollment->created_at;
                $course->completed_at = $enrollment->completed_at ?? null;
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
        $user = auth()->user();
        return Inertia::render('user/profile', [
            'user' => $user->only([
                'id',
                'name',
                'email',
                'phone',
                'bio',
                'birth_date',
                'gender',
                'city',
                'profile_photo_path',
                'profile_photo_url',
                'created_at'
            ])
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = auth()->user();
        $validated = $request->validated();

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old profile photo if exists
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            // Store new profile photo
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $validated['profile_photo_path'] = $path;
        }

        // Remove profile_photo from validated data since we handle it separately
        unset($validated['profile_photo']);

        // Handle password update
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Remove current_password from validated data
        unset($validated['current_password']);

        // Update user profile
        $user->update($validated);

        return redirect()->back()->with('success', 'Profile berhasil diperbarui.');
    }

    public function deleteProfilePhoto()
    {
        $user = auth()->user();

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
            $user->update(['profile_photo_path' => null]);
        }

        return redirect()->back()->with('success', 'Foto profile berhasil dihapus.');
    }

    public function myCourses()
    {
        $user = auth()->user();

        // Get user's enrolled courses with progress
        $enrollmentsQuery = \App\Models\Enrollment::with([
            'course' => function ($query) {
                $query->with(['category', 'institution', 'chapters'])
                    ->where('status', 'published')
                    ->withAvg('reviews', 'rating')
                    ->withCount(['enrollments', 'chapters']);
            }
        ])
            ->where('user_id', $user->id);

        // Check if enrolled_at column exists and order accordingly
        try {
            $enrollments = $enrollmentsQuery->orderBy('enrolled_at', 'desc')->get();
        } catch (\Exception $e) {
            // If enrolled_at doesn't exist, use created_at
            $enrollments = $enrollmentsQuery->orderBy('created_at', 'desc')->get();
        }

        $enrollments = $enrollments->map(function ($enrollment) {
            $course = $enrollment->course;
            if ($course) {
                $course->average_rating = (float) ($course->reviews_avg_rating ?? 0);
                $course->total_students = $course->enrollments_count;
                $course->total_chapters = $course->chapters_count;

                // Safely access columns that might not exist
                $course->user_progress = $enrollment->progress ?? 0;
                $course->enrolled_at = $enrollment->enrolled_at ?? $enrollment->created_at;
                $course->completed_at = $enrollment->completed_at ?? null;
            }
            return $course;
        })
            ->filter(); // Remove null courses

        return Inertia::render('user/my-courses', [
            'enrollments' => $enrollments
        ]);
    }
}
