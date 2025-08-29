<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Category;
use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display all courses (catalog)
     */
    public function index(Request $request)
    {
        $query = Course::with(['category', 'institution', 'reviews'])
            ->where('status', 'published');

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
            $course->average_rating = $course->reviews->avg('rating') ?? 0;
            $course->total_reviews = $course->reviews->count();
            $course->total_students = $course->enrollments()->count();
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
        $course->average_rating = $course->reviews->avg('rating') ?? 0;
        $course->total_reviews = $course->reviews->count();
        $course->total_students = $course->enrollments()->count();
        $course->total_chapters = $course->chapters->count();
        $course->total_materials = $course->chapters->sum(function ($chapter) {
            return $chapter->courseMaterials->count();
        });

        // Check if user is enrolled (if logged in)
        $isEnrolled = false;
        if (auth()->check()) {
            $isEnrolled = $course->enrollments()
                ->where('user_id', auth()->id())
                ->exists();
        }

        // Get related courses
        $relatedCourses = Course::with(['category', 'institution'])
            ->where('status', 'published')
            ->where('id', '!=', $course->id)
            ->where('category_id', $course->category_id)
            ->limit(4)
            ->get();

        $relatedCourses->each(function ($relatedCourse) {
            $relatedCourse->average_rating = $relatedCourse->reviews->avg('rating') ?? 0;
            $relatedCourse->total_reviews = $relatedCourse->reviews->count();
            $relatedCourse->total_students = $relatedCourse->enrollments()->count();
        });

        return Inertia::render('courses/show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
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
        $institutions = Institution::withCount(['courses' => function ($query) {
            $query->where('status', 'published');
        }])->paginate(12);

        return Inertia::render('institutions/index', [
            'institutions' => $institutions
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
        if (auth()->check()) {
            $isEnrolled = $course->enrollments()
                ->where('user_id', auth()->id())
                ->exists();
        }

        if ($isEnrolled) {
            return redirect()->route('courses.show', $course->id)
                ->with('info', 'Anda sudah terdaftar di kursus ini.');
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
        $course = Course::with(['category', 'institution'])->findOrFail($id);

        // Check if course is published
        if ($course->status !== 'published') {
            abort(404);
        }

        // Check if course is free
        if ($course->is_pro || $course->price > 0) {
            return redirect()->route('courses.show', $course->id)
                ->with('error', 'Kursus ini adalah kursus berbayar.');
        }

        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('login')
                ->with('info', 'Silakan login untuk mendaftar di kursus ini.');
        }

        // Check if user is already enrolled
        $isEnrolled = $course->enrollments()
            ->where('user_id', auth()->id())
            ->exists();

        if ($isEnrolled) {
            return redirect()->route('courses.learn', $course->id)
                ->with('info', 'Anda sudah terdaftar di kursus ini.');
        }

        // Create enrollment
        \App\Models\Enrollment::create([
            'user_id' => auth()->id(),
            'course_id' => $course->id,
            'enrolled_at' => now(),
            'progress' => 0,
        ]);

        return redirect()->route('courses.learn', $course->id)
            ->with('success', 'Selamat! Anda berhasil mendaftar di kursus ini.');
    }

    /**
     * Display the learning page for a course
     */
    public function learn($id)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('login')
                ->with('error', 'Silakan login untuk mengakses halaman belajar.');
        }

        $course = Course::with(['category', 'institution', 'chapters' => function($query) {
            $query->orderBy('order');
        }, 'chapters.materials' => function($query) {
            $query->orderBy('order');
        }])
        ->findOrFail($id);

        // Check if user is enrolled
        $enrollment = \App\Models\Enrollment::where('user_id', auth()->id())
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

        // Get completed materials for this user
        $completedMaterials = \App\Models\UserMaterialProgress::where('user_id', auth()->id())
            ->whereIn('material_id', $course->chapters->flatMap->materials->pluck('id'))
            ->pluck('material_id')
            ->toArray();

        return Inertia::render('courses/learn', [
            'course' => $course,
            'completedMaterials' => $completedMaterials,
            'enrollment' => $enrollment
        ]);
    }
}