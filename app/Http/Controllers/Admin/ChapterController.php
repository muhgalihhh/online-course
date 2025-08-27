<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    /**
     * Menampilkan daftar courses untuk memilih chapter yang akan dikelola.
     */
    public function index(Request $request): Response
    {
        // Get courses with chapter and material counts
        $courses = Course::with(['category', 'institution'])
            ->withCount(['chapters', 'courseMaterials'])
            ->withSum('chapters as total_duration', 'duration')
            ->withCount(['chapters as free_chapters_count' => function ($query) {
                $query->where('is_free', true);
            }])
            ->withCount('enrollments')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        // Get categories and institutions for filtering
        $categories = \App\Models\Category::orderBy('name')->get();
        $institutions = \App\Models\Institution::orderBy('name')->get();

        return Inertia::render('admin/chapters/index', [
            'courses' => $courses,
            'categories' => $categories,
            'institutions' => $institutions,
        ]);
    }

    /**
     * Tampilkan form untuk membuat bab baru.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('admin/chapters/create', [
            'courses' => Course::all(),
            'selected_course_id' => $request->get('course_id'),
        ]);
    }

    /**
     * Simpan bab baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'required|integer|min:1',
            'duration' => 'nullable|integer|min:1',
            'is_free' => 'boolean',
        ]);

        $chapter = Chapter::create($validated);

        // Redirect to the course's chapter list
        return redirect()->route('admin.chapters.by-course', $chapter->course_id)
            ->with('success', 'Bab berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit bab.
     */
    public function edit(Chapter $chapter): Response
    {
        return Inertia::render('admin/chapters/edit', [
            'chapter' => $chapter->load(['course']),
            'courses' => Course::all(),
        ]);
    }

    /**
     * Update data bab di database.
     */
    public function update(Request $request, Chapter $chapter)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'required|integer|min:1',
            'duration' => 'nullable|integer|min:1',
            'is_free' => 'boolean',
        ]);

        $chapter->update($validated);

        return redirect()->route('admin.chapters.by-course', $chapter->course_id)
            ->with('success', 'Bab berhasil diperbarui.');
    }

    /**
     * Hapus bab dari database.
     */
    public function destroy(Chapter $chapter)
    {
        $courseId = $chapter->course_id;
        
        // Hapus semua file materi yang terkait dengan bab
        foreach ($chapter->courseMaterials as $material) {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
        }
        
        $chapter->delete();

        return redirect()->route('admin.chapters.by-course', $courseId)
            ->with('success', 'Bab berhasil dihapus.');
    }
    
    /**
     * Tampilkan detail bab.
     */
    public function show(Chapter $chapter): Response
    {
        return Inertia::render('admin/chapters/show', [
            'chapter' => $chapter->load(['course.institution', 'course.category', 'courseMaterials' => function($query) {
                $query->orderBy('order');
            }]),
        ]);
    }

    /**
     * Tampilkan bab berdasarkan kursus tertentu.
     */
    public function byCourse(Course $course): Response
    {
        // Load course with relationships
        $course->load(['institution', 'category']);
        
        // Get chapters with materials for this course
        $chapters = $course->chapters()
            ->with(['courseMaterials' => function($query) {
                $query->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        return Inertia::render('admin/chapters/by-course', [
            'course' => $course,
            'chapters' => $chapters,
        ]);
    }
}