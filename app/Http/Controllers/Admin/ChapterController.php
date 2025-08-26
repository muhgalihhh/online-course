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
    public function index(Request $request): Response
    {
        $query = Chapter::with(['course'])->withCount('courseMaterials');

        // Filter by search (title or description)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by course
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->get('course_id'));
        }

        // Filter by material count range
        if ($request->filled('material_count_min')) {
            $query->has('courseMaterials', '>=', $request->get('material_count_min'));
        }
        
        if ($request->filled('material_count_max')) {
            $query->has('courseMaterials', '<=', $request->get('material_count_max'));
        }

        // Filter by duration range
        if ($request->filled('duration_min')) {
            $query->where('duration', '>=', $request->get('duration_min'));
        }
        
        if ($request->filled('duration_max')) {
            $query->where('duration', '<=', $request->get('duration_max'));
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
        
        if ($sortBy === 'course_materials_count') {
            $query->orderBy('course_materials_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $chapters = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/chapters/index', [
            'chapters' => $chapters,
            'courses' => Course::all(),
            'filters' => $request->only(['search', 'course_id', 'material_count_min', 'material_count_max', 'duration_min', 'duration_max', 'date_from', 'date_to', 'sort_by', 'sort_order']),
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