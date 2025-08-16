<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseMaterial;
use App\Models\Chapter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseMaterialController extends Controller
{
    /**
     * Menampilkan daftar semua materi dengan paginasi.
     */
    public function index(): Response
    {
        return Inertia::render('admin/materials/index', [
            'materials' => CourseMaterial::with(['chapter.course'])
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    /**
     * Tampilkan form untuk membuat materi baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/materials/create', [
            'chapters' => Chapter::with(['course'])->get(),
        ]);
    }

    /**
     * Simpan materi baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'chapter_id' => 'required|exists:chapters,id',
            'title' => 'required|string|max:255',
            'order' => 'required|integer|min:1',
            'type' => 'required|in:video,document,quiz',
            'file_path' => 'nullable|string',
            'youtube_url' => 'nullable|url',
            'is_preview' => 'boolean',
        ]);

        CourseMaterial::create($validated);

        return redirect()->route('admin.materials.index')
            ->with('success', 'Materi berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit materi.
     */
    public function edit(CourseMaterial $material): Response
    {
        return Inertia::render('admin/materials/edit', [
            'material' => $material->load(['chapter.course']),
            'chapters' => Chapter::with(['course'])->get(),
        ]);
    }

    /**
     * Update data materi di database.
     */
    public function update(Request $request, CourseMaterial $material)
    {
        $validated = $request->validate([
            'chapter_id' => 'required|exists:chapters,id',
            'title' => 'required|string|max:255',
            'order' => 'required|integer|min:1',
            'type' => 'required|in:video,document,quiz',
            'file_path' => 'nullable|string',
            'youtube_url' => 'nullable|url',
            'is_preview' => 'boolean',
        ]);

        $material->update($validated);

        return redirect()->route('admin.materials.index')
            ->with('success', 'Materi berhasil diperbarui.');
    }

    /**
     * Hapus materi dari database.
     */
    public function destroy(CourseMaterial $material)
    {
        $material->delete();

        return redirect()->route('admin.materials.index')
            ->with('success', 'Materi berhasil dihapus.');
    }

    /**
     * Tampilkan materi berdasarkan bab tertentu.
     */
    public function byChapter(Chapter $chapter): Response
    {
        return Inertia::render('admin/materials/by-chapter', [
            'chapter' => $chapter->load(['course']),
            'materials' => $chapter->courseMaterials()->orderBy('order')->get(),
        ]);
    }

    /**
     * Upload file materi.
     */
    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,mp4,mov,avi|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->store('materials', 'public');

        return response()->json([
            'file_path' => $path,
            'filename' => $file->getClientOriginalName(),
        ]);
    }
}