<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Category;
use App\Models\Institution;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Services\VideoSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseController extends Controller
{
    protected $videoSecurityService;

    public function __construct(VideoSecurityService $videoSecurityService)
    {
        $this->videoSecurityService = $videoSecurityService;
    }
    /**
     * Display all courses (catalog)
     */
    public function index(Request $request)
    {
        $query = Course::with(['category', 'institution', 'reviews'])
            ->where('status', 'published');

        // Include current user's enrollment status efficiently
        if (Auth::check()) {
            $query->withCount([
                'enrollments as is_enrolled' => function ($q) {
                    $q->where('user_id', Auth::id());
                }
            ]);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // Filter by type (pro/free)
        if ($request->has('type')) {
            if ($request->type === 'pro') {
                $query->where('is_pro', true);
            } elseif ($request->type === 'free') {
                $query->where('is_pro', false);
            }
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'latest');
        switch ($sortBy) {
            case 'popular':
                $query->withCount('enrollments')
                    ->orderBy('enrollments_count', 'desc');
                break;
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->withAvg('reviews', 'rating')
                    ->orderBy('reviews_avg_rating', 'desc');
                break;
            default: // latest
                $query->orderBy('created_at', 'desc');
        }

        $courses = $query->paginate(12)->withQueryString();
        $categories = Category::all();

        // Add computed properties to each course
        $courses->through(function ($course) {
            $course->average_rating = (float) ($course->reviews->avg('rating') ?? 0);
            $course->total_reviews = $course->reviews->count();
            $course->total_students = $course->enrollments()->count();
            $course->is_enrolled = (bool) ($course->is_enrolled ?? false);
            return $course;
        });

        return Inertia::render('courses/index', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => [
                'category' => $request->category,
                'type' => $request->type,
                'search' => $request->search,
                'sort' => $sortBy,
            ]
        ]);
    }

    /**
     * Display course details
     */
    public function show($id)
    {
        $course = Course::with([
            'category',
            'institution',
            'chapters.courseMaterials',
            'reviews.user'
        ])->findOrFail($id);

        // Check if course is published
        if ($course->status !== 'published') {
            abort(404);
        }

        // Calculate statistics
        $course->average_rating = (float) ($course->reviews->avg('rating') ?? 0);
        $course->total_reviews = $course->reviews->count();
        $course->total_students = $course->enrollments()->count();
        $course->total_chapters = $course->chapters->count();
        $course->total_materials = $course->chapters->sum(function ($chapter) {
            return $chapter->courseMaterials->count();
        });

        // Check if user is enrolled (if logged in)
        $isEnrolled = false;
        $hasCompletedTransaction = false;

        if (Auth::check()) {
            $isEnrolled = $course->enrollments()
                ->where('user_id', Auth::id())
                ->exists();

            // Also check if user has completed transaction but not enrolled yet
            if (!$isEnrolled) {
                $completedTransaction = \App\Models\Transaction::where('user_id', Auth::id())
                    ->where('transactionable_id', $course->id)
                    ->where('transactionable_type', Course::class)
                    ->where('status', 'completed')
                    ->first();

                if ($completedTransaction) {
                    $hasCompletedTransaction = true;

                    // Try to auto-enroll user if they have completed transaction
                    try {
                        $paymentController = app(\App\Http\Controllers\PaymentController::class);
                        $paymentController->autoEnrollUserToCourse($completedTransaction);

                        // Re-check enrollment status after auto-enrollment attempt
                        $isEnrolled = $course->enrollments()
                            ->where('user_id', Auth::id())
                            ->exists();

                        if ($isEnrolled) {
                            $hasCompletedTransaction = false; // Clear this since user is now enrolled
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Failed to auto-enroll user in course show method', [
                            'user_id' => Auth::id(),
                            'course_id' => $course->id,
                            'transaction_id' => $completedTransaction->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        }

        // Get related courses
        $relatedCourses = Course::with(['category', 'institution'])
            ->where('status', 'published')
            ->where('id', '!=', $course->id)
            ->where('category_id', $course->category_id)
            ->limit(4)
            ->get();

        $relatedCourses->each(function ($relatedCourse) {
            $relatedCourse->average_rating = (float) ($relatedCourse->reviews->avg('rating') ?? 0);
            $relatedCourse->total_reviews = $relatedCourse->reviews->count();
            $relatedCourse->total_students = $relatedCourse->enrollments()->count();
        });

        return Inertia::render('courses/show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'hasCompletedTransaction' => $hasCompletedTransaction,
            'relatedCourses' => $relatedCourses
        ]);
    }

    /**
     * Display pro courses only
     */
    public function pro(Request $request)
    {
        // Allow guest access but filter for pro courses
        $request->merge(['type' => 'pro']);
        return $this->index($request);
    }

    /**
     * Display free courses only
     */
    public function free(Request $request)
    {
        // Allow guest access but filter for free courses
        $request->merge(['type' => 'free']);
        return $this->index($request);
    }

    /**
     * Display institution catalog
     */
    public function institutions(Request $request)
    {
        $institutions = Institution::withCount([
            'courses' => function ($query) {
                $query->where('status', 'published');
            }
        ])->paginate(12);

        // Calculate real statistics from database
        $totalCourses = Course::where('status', 'published')->count();
        $totalStudents = \App\Models\Enrollment::distinct('user_id')->count();
        $averageRating = \App\Models\CourseReview::avg('rating') ?? 0;

        return Inertia::render('institutions/index', [
            'institutions' => $institutions,
            'stats' => [
                'total_institutions' => $institutions->total(),
                'total_courses' => $totalCourses,
                'total_students' => $totalStudents,
                'average_rating' => round($averageRating, 1)
            ]
        ]);
    }

    /**
     * Show enrollment page for a course
     */
    public function enroll($id)
    {
        $course = Course::with(['category', 'institution'])->findOrFail($id);

        // Check if course is published
        if ($course->status !== 'published') {
            abort(404);
        }

        // Check if user is already enrolled
        $isEnrolled = false;
        if (Auth::check()) {
            $isEnrolled = $course->enrollments()
                ->where('user_id', Auth::id())
                ->exists();
        }

        if ($isEnrolled) {
            return redirect()->route('courses.learn', $course->id)
                ->with('info', 'Anda sudah terdaftar di kursus ini.');
        }

        // If course is pro/paid, redirect to payment page
        if ($course->is_pro && $course->price > 0) {
            return redirect()->route('payments.show', $course->id);
        }

        return Inertia::render('courses/enroll', [
            'course' => $course
        ]);
    }

    /**
     * Handle free course enrollment
     */
    public function enrollFree($id)
    {
        Log::info('enrollFree method called', ['course_id' => $id, 'user_id' => Auth::id()]);

        $course = Course::with(['category', 'institution'])->findOrFail($id);

        // Check if course is published
        if ($course->status !== 'published') {
            Log::warning('Course not published', ['course_id' => $id, 'status' => $course->status]);
            abort(404);
        }

        // Check if course is free
        if ($course->is_pro || $course->price > 0) {
            Log::warning('Course is not free', ['course_id' => $id, 'is_pro' => $course->is_pro, 'price' => $course->price]);
            return redirect()->route('courses.show', $course->id)
                ->with('error', 'Kursus ini adalah kursus berbayar.');
        }

        // Check if user is authenticated
        if (!Auth::check()) {
            Log::warning('User not authenticated');
            return redirect()->route('login')
                ->with('info', 'Silakan login untuk mendaftar di kursus ini.');
        }

        // Check if user is already enrolled
        $isEnrolled = $course->enrollments()
            ->where('user_id', Auth::id())
            ->exists();

        if ($isEnrolled) {
            Log::info('User already enrolled', ['course_id' => $id, 'user_id' => Auth::id()]);
            return redirect()->route('courses.learn', $course->id)
                ->with('info', 'Anda sudah terdaftar di kursus ini.');
        }

        try {
            // Create enrollment with database transaction
            DB::transaction(function () use ($course) {
                // Idempotent creation to avoid duplicate enrollments under race conditions
                $enrollment = \App\Models\Enrollment::firstOrCreate(
                    [
                        'user_id' => Auth::id(),
                        'course_id' => $course->id,
                    ],
                    [
                        'enrolled_at' => now(),
                        'progress' => 0,
                    ]
                );

                Log::info('Enrollment created successfully', [
                    'enrollment_id' => $enrollment->id,
                    'user_id' => Auth::id(),
                    'course_id' => $course->id
                ]);
            });

            return redirect()->route('courses.learn', $course->id)
                ->with('success', 'Selamat! Anda berhasil mendaftar di kursus ini.');
        } catch (\Exception $e) {
            Log::error('Failed to enroll user in free course', [
                'user_id' => Auth::id(),
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('courses.show', $course->id)
                ->with('error', 'Terjadi kesalahan saat mendaftar. Silakan coba lagi. Error: ' . $e->getMessage());
        }
    }

    /**
     * Display the learning page for a course
     */
    public function learn($id)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login')
                ->with('error', 'Silakan login untuk mengakses halaman belajar.');
        }

        $course = Course::with([
            'category',
            'institution',
            'chapters' => function ($query) {
                $query->orderBy('order');
            },
            'chapters.materials' => function ($query) {
                $query->orderBy('order');
            }
        ])
            ->findOrFail($id);

        // Check if user is enrolled
        $enrollment = \App\Models\Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('courses.show', $course->id)
                ->with('error', 'Anda harus terdaftar di kursus ini untuk mengaksesnya.');
        }

        // Get user progress
        $course->user_progress = $enrollment->progress;
        $course->enrolled_at = $enrollment->enrolled_at;
        $course->completed_at = $enrollment->completed_at;

        // Get completed materials for this user based on material progress
        $completedMaterials = \App\Models\MaterialProgress::where('user_id', Auth::id())
            ->where('enrollment_id', $enrollment->id)
            ->where('is_completed', true)
            ->pluck('course_material_id')
            ->toArray();

        // Generate secure URLs for videos
        foreach ($course->chapters as $chapter) {
            foreach ($chapter->materials as $material) {
                if ($material->type === 'video_local' && $material->file_path) {
                    // Generate secure URL for local videos
                    try {
                        $material->secure_video_url = $this->videoSecurityService->generateSecureVideoUrl(
                            $material->id,
                            Auth::id(),
                            120 // 2 hours expiration
                        );
                        Log::info('Generated secure video URL for material ' . $material->id);
                    } catch (\Exception $e) {
                        // Log error but don't break the page
                        Log::warning('Failed to generate secure video URL for material ' . $material->id . ': ' . $e->getMessage());

                        // Try to set a direct URL if available
                        if ($material->file_path) {
                            $material->file_url = asset('storage/' . $material->file_path);
                        }
                    }
                } elseif ($material->type === 'video_youtube' && $material->youtube_url) {
                    // Generate secure URL for YouTube videos
                    try {
                        $material->secure_youtube_url = $this->videoSecurityService->generateSecureYouTubeUrl(
                            $material->youtube_url,
                            $material->id,
                            Auth::id()
                        );
                        Log::info('Generated secure YouTube URL for material ' . $material->id . ' with URL: ' . $material->youtube_url);
                    } catch (\Exception $e) {
                        // Log error but don't break the page
                        Log::warning('Failed to generate secure YouTube URL for material ' . $material->id . ': ' . $e->getMessage());
                        // Keep the original YouTube URL for fallback
                    }
                }

                // Log material info for debugging
                Log::info('Material ' . $material->id . ' - Type: ' . $material->type . ', Title: ' . $material->title);
                if ($material->type === 'video_youtube') {
                    Log::info('YouTube URL: ' . ($material->youtube_url ?? 'null') . ', Secure URL: ' . ($material->secure_youtube_url ?? 'null'));
                }
            }
        }

        return Inertia::render('courses/learn', [
            'course' => $course,
            'completedMaterials' => $completedMaterials,
            'enrollment' => $enrollment
        ]);
    }

    /**
     * Mark a material as completed for the current user and enrollment.
     */
    public function completeMaterial($courseId, $materialId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $course = Course::findOrFail($courseId);
        $material = \App\Models\CourseMaterial::whereHas('chapter', function ($query) use ($course) {
            $query->where('course_id', $course->id);
        })->where('id', $materialId)->firstOrFail();

        $enrollment = \App\Models\Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        // Find or create progress record for this material
        $progress = \App\Models\MaterialProgress::firstOrCreate(
            [
                'user_id' => Auth::id(),
                'course_material_id' => $material->id,
                'enrollment_id' => $enrollment->id,
            ],
            [
                'is_completed' => false,
            ]
        );

        if (!$progress->is_completed) {
            $progress->markAsCompleted();
        }

        // Get all completed materials for this enrollment
        $completedMaterials = \App\Models\MaterialProgress::where('enrollment_id', $enrollment->id)
            ->where('is_completed', true)
            ->pluck('course_material_id')
            ->toArray();

        return response()->json([
            'message' => 'Material marked as completed',
            'enrollment' => [
                'progress' => $enrollment->fresh()->progress,
                'completed_at' => $enrollment->fresh()->completed_at,
            ],
            'completedMaterials' => $completedMaterials,
        ]);
    }

    /**
     * Mark a chapter as completed for the current user and enrollment.
     */
    public function completeChapter($courseId, $chapterId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $course = Course::with('chapters')->findOrFail($courseId);
        $chapter = $course->chapters()->where('id', $chapterId)->firstOrFail();

        $enrollment = \App\Models\Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        // Mark all materials in this chapter as completed
        $materials = \App\Models\CourseMaterial::where('chapter_id', $chapter->id)->get();

        foreach ($materials as $material) {
            $progress = \App\Models\MaterialProgress::firstOrCreate(
                [
                    'user_id' => Auth::id(),
                    'course_material_id' => $material->id,
                    'enrollment_id' => $enrollment->id,
                ],
                [
                    'is_completed' => false,
                ]
            );

            if (!$progress->is_completed) {
                $progress->update([
                    'is_completed' => true,
                    'completed_at' => now(),
                ]);
            }
        }

        // Update enrollment progress
        $enrollment->updateProgress();

        // Get all completed materials for this enrollment
        $completedMaterials = \App\Models\MaterialProgress::where('enrollment_id', $enrollment->id)
            ->where('is_completed', true)
            ->pluck('course_material_id')
            ->toArray();

        return response()->json([
            'message' => 'Chapter marked as completed',
            'enrollment' => [
                'progress' => $enrollment->fresh()->progress,
                'completed_at' => $enrollment->fresh()->completed_at,
            ],
            'completedMaterials' => $completedMaterials,
        ]);
    }
}
