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
     * Menampilkan daftar semua bab dengan paginasi.
     */
    public function index(): Response
    {
        return Inertia::render('admin/chapters/index', [
            'chapters' => Chapter::with(['course'])
                ->withCount('courseMaterials')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'courses' => Course::all(),
        ]);
    }

    /**
     * Tampilkan form untuk membuat bab baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/chapters/create', [
            'courses' => Course::all(),
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

        Chapter::create($validated);

        return redirect()->route('admin.chapters.index')
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

        return redirect()->route('admin.chapters.index')
            ->with('success', 'Bab berhasil diperbarui.');
    }

    /**
     * Hapus bab dari database.
     */
    public function destroy(Chapter $chapter)
    {
        // Hapus semua file materi yang terkait dengan bab
        foreach ($chapter->courseMaterials as $material) {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
        }
        
        $chapter->delete();

        return redirect()->route('admin.chapters.index')
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
        return Inertia::render('admin/chapters/by-course', [
            'course' => $course->load(['institution', 'category']),
            'chapters' => $course->chapters()->with(['courseMaterials'])->orderBy('order')->get(),
        ]);
    }
}