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
    public function index(): Response
    {
        return Inertia::render('admin/courses/index', [
            'courses' => Course::with(['institution', 'category'])
                ->latest()
                ->paginate(10)
                ->withQueryString(),
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