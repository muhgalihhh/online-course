<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Category;
use App\Models\Institution;
use Illuminate\Http\Request;
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'institution_id' => 'required|exists:institutions,id',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'is_pro' => 'boolean',
        ]);

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
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'institution_id' => 'required|exists:institutions,id',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'is_pro' => 'boolean',
        ]);

        $course->update($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Kursus berhasil diperbarui.');
    }

    /**
     * Hapus kursus dari database.
     */
    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Kursus berhasil dihapus.');
    }
}