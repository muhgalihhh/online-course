<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseMaterialRequest;
use App\Http\Requests\Admin\UpdateCourseMaterialRequest;
use App\Models\CourseMaterial;
use App\Models\Chapter;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourseMaterialController extends Controller
{
    /**
     * Menampilkan daftar semua materi dengan paginasi.
     */
    public function index(): Response
    {
        $search = request('search');
        $courseId = request('course_id');
        $chapterId = request('chapter_id');
        $type = request('type');

        $query = CourseMaterial::with(['chapter.course'])
            ->when($search, function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            })
            ->when($type, function ($q) use ($type) {
                $q->where('type', $type);
            })
            ->when($chapterId, function ($q) use ($chapterId) {
                $q->where('chapter_id', $chapterId);
            })
            ->when($courseId, function ($q) use ($courseId) {
                $q->whereHas('chapter', function ($chapterQuery) use ($courseId) {
                    $chapterQuery->where('course_id', $courseId);
                });
            })
            ->latest();

        return Inertia::render('admin/materials/index', [
            'materials' => $query->paginate(10)->withQueryString(),
            'chapters' => Chapter::with(['course'])->get(),
            'courses' => Course::all(),
            'filters' => [
                'search' => $search,
                'course_id' => $courseId,
                'chapter_id' => $chapterId,
                'type' => $type,
            ],
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
    public function store(StoreCourseMaterialRequest $request)
    {
        $data = $request->validated();
        
        // Handle file upload untuk type pdf dan image
        if ($request->hasFile('file_path') && in_array($data['type'], ['pdf', 'image'])) {
            $filePath = $request->file('file_path')->store('materials', 'public');
            $data['file_path'] = $filePath;
        }
        
        // Pastikan youtube_url kosong jika type bukan video
        if ($data['type'] !== 'video') {
            $data['youtube_url'] = null;
        }
        
        // Pastikan file_path kosong jika type adalah video
        if ($data['type'] === 'video') {
            $data['file_path'] = null;
        }

        CourseMaterial::create($data);

        return redirect()->route('admin.materials.index')
            ->with('success', 'Materi kursus berhasil dibuat.');
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
    public function update(UpdateCourseMaterialRequest $request, CourseMaterial $material)
    {
        $data = $request->validated();
        $oldType = $material->type;
        
        // Jika type berubah, hapus file lama yang tidak relevan
        if ($oldType !== $data['type']) {
            if ($oldType !== 'video' && $material->file_path) {
                Storage::disk('public')->delete($material->file_path);
                $material->file_path = null;
            }
        }
        
        // Handle file upload untuk type pdf dan image
        if ($request->hasFile('file_path') && in_array($data['type'], ['pdf', 'image'])) {
            // Hapus file lama jika ada
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
            
            // Upload file baru
            $filePath = $request->file('file_path')->store('materials', 'public');
            $data['file_path'] = $filePath;
        }
        
        // Pastikan youtube_url kosong jika type bukan video
        if ($data['type'] !== 'video') {
            $data['youtube_url'] = null;
        }
        
        // Pastikan file_path kosong jika type adalah video
        if ($data['type'] === 'video') {
            $data['file_path'] = null;
        }

        $material->update($data);

        return redirect()->route('admin.materials.index')
            ->with('success', 'Materi kursus berhasil diperbarui.');
    }

    /**
     * Hapus materi dari database.
     */
    public function destroy(CourseMaterial $material)
    {
        // Hapus file terkait jika ada
        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }
        
        $material->delete();

        return redirect()->route('admin.materials.index')
            ->with('success', 'Materi kursus berhasil dihapus.');
    }
    
    /**
     * Tampilkan detail materi.
     */
    public function show(CourseMaterial $material): Response
    {
        return Inertia::render('admin/materials/show', [
            'material' => $material->load(['chapter.course']),
        ]);
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