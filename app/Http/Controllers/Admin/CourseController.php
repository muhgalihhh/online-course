<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Course;
use App\Models\Category;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Menampilkan daftar semua kursus dengan paginasi.
     */
    public function index(Request $request): Response
    {
        $query = Course::with(['institution', 'category']);

        // Filter by search (title or description)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        // Filter by institution
        if ($request->filled('institution_id')) {
            $query->where('institution_id', $request->get('institution_id'));
        }

        // Filter by pro status
        if ($request->filled('is_pro')) {
            $query->where('is_pro', $request->get('is_pro') === 'true');
        }

        // Filter by price range
        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->get('price_min'));
        }
        
        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->get('price_max'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $courses = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/courses/index', [
            'courses' => $courses,
            'categories' => Category::all(),
            'institutions' => Institution::all(),
            'filters' => $request->only(['search', 'category_id', 'institution_id', 'is_pro', 'price_min', 'price_max', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Tampilkan form untuk membuat kursus baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/courses/create', [
            'categories' => Category::all(),
            'institutions' => Institution::all(),
        ]);
    }

    /**
     * Simpan kursus baru ke database.
     */
    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail_path')) {
            $thumbnailPath = $request->file('thumbnail_path')->store('courses', 'public');
            $validated['thumbnail_path'] = $thumbnailPath;
        }

        Course::create($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Kursus berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit kursus.
     */
    public function edit(Course $course): Response
    {
        return Inertia::render('admin/courses/edit', [
            'course' => $course->load(['institution', 'category']),
            'categories' => Category::all(),
            'institutions' => Institution::all(),
        ]);
    }

    /**
     * Update data kursus di database.
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $validated = $request->validated();

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail_path')) {
            // Hapus thumbnail lama jika ada
            if ($course->thumbnail_path) {
                Storage::disk('public')->delete($course->thumbnail_path);
            }
            
            // Upload thumbnail baru
            $thumbnailPath = $request->file('thumbnail_path')->store('courses', 'public');
            $validated['thumbnail_path'] = $thumbnailPath;
        }

        $course->update($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Kursus berhasil diperbarui.');
    }

    /**
     * Hapus kursus dari database.
     */
    public function destroy(Course $course)
    {
        // Hapus thumbnail jika ada
        if ($course->thumbnail_path) {
            Storage::disk('public')->delete($course->thumbnail_path);
        }
        
        // Hapus semua file materi yang terkait dengan kursus
        foreach ($course->chapters as $chapter) {
            foreach ($chapter->courseMaterials as $material) {
                if ($material->file_path) {
                    Storage::disk('public')->delete($material->file_path);
                }
            }
        }
        
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Kursus berhasil dihapus.');
    }
    
    /**
     * Tampilkan detail kursus.
     */
    public function show(Course $course): Response
    {
        return Inertia::render('admin/courses/show', [
            'course' => $course->load(['institution', 'category', 'chapters' => function($query) {
                $query->withCount('courseMaterials');
            }, 'users']),
        ]);
    }
}