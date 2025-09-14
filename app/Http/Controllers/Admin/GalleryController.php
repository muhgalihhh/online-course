<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Rules\YouTubeUrl;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    /**
     * Menampilkan daftar semua item galeri dengan paginasi.
     */
    public function index(Request $request): Response
    {
        $query = Gallery::query();

        // Filter by search (title or description)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by file type
        if ($request->filled('file_type')) {
            $query->where('file_type', $request->get('file_type'));
        }

        // Filter by active status
        if ($request->filled('is_active')) {
            // Pastikan hanya value 'true' atau 'false'
            if (in_array($request->get('is_active'), ['true', 'false'], true)) {
                $query->where('is_active', $request->get('is_active') === 'true');
            }
        }

        // (Opsional) Date range filter jika nanti diaktifkan di UI
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                $request->get('date_from') . ' 00:00:00',
                $request->get('date_to') . ' 23:59:59',
            ]);
        }

        // Ordering
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        if (in_array($sortBy, ['title', 'file_type', 'is_active', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $galleries = $query->paginate(10)->withQueryString();

        // Transform untuk konsistensi front-end (pastikan file_url null untuk YouTube)
        $galleries->getCollection()->transform(function (Gallery $g) {
            return [
                'id' => $g->id,
                'title' => $g->title,
                'description' => $g->description,
                'file_type' => $g->file_type,
                'video_source' => $g->video_source,
                'file_path' => $g->file_path,
                'file_url' => $g->file_url, // Sudah null jika YouTube
                'youtube_url' => $g->youtube_url,
                'youtube_video_id' => $g->youtube_video_id,
                'youtube_thumbnail' => $g->youtube_thumbnail,
                'youtube_embed_url' => $g->youtube_embed_url,
                'is_active' => $g->is_active,
                'created_at' => $g->created_at?->toISOString(),
            ];
        });

        return Inertia::render('admin/gallery/Index', [
            'galleries' => $galleries,
            'filters' => [
                'search' => $request->get('search', ''),
                'file_type' => $request->get('file_type', ''),
                'is_active' => $request->get('is_active', ''),
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
            ],
        ]);
    }

    /**
     * Menampilkan form untuk membuat item galeri baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/gallery/Create');
    }

    /**
     * Menyimpan item galeri baru ke database.
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file_type' => ['required', Rule::in(Gallery::getValidFileTypes())],
            'is_active' => 'boolean',
        ];

        // Tambahkan validasi berdasarkan file_type dan video_source
        if ($request->file_type === 'video') {
            $rules['video_source'] = ['required', Rule::in(Gallery::getValidVideoSources())];

            if ($request->video_source === 'youtube') {
                $rules['youtube_url'] = [
                    'required',
                    new YouTubeUrl()
                ];
            } else {
                $rules['file'] = 'required|file|mimes:mp4,mov,avi,wmv|max:50000'; // 50MB untuk video
            }
        } else {
            $rules['file'] = 'required|file|mimes:jpg,jpeg,png,gif,webp|max:10240'; // 10MB untuk gambar
        }

        $validated = $request->validate($rules);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_type' => $validated['file_type'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        // Handle file upload atau YouTube URL
        if ($validated['file_type'] === 'video' && ($request->video_source === 'youtube')) {
            $data['youtube_url'] = $validated['youtube_url'];
            $data['video_source'] = 'youtube';
            $data['file_path'] = null; // Tidak ada file untuk YouTube
        } else {
            // Upload file (image atau video file)
            $file = $request->file('file');
            $data['file_path'] = $file->store('gallery', 'public');
            $data['video_source'] = 'file';
            $data['youtube_url'] = null;
        }

        // Create gallery item
        Gallery::create($data);

        return redirect()->route('admin.galleries.index')
            ->with('success', 'Item galeri berhasil dibuat.');
    }

    /**
     * Menampilkan detail item galeri.
     */
    public function show(Gallery $gallery): Response
    {
        $resource = [
            'id' => $gallery->id,
            'title' => $gallery->title,
            'description' => $gallery->description,
            'file_type' => $gallery->file_type,
            'video_source' => $gallery->video_source,
            'file_path' => $gallery->file_path,
            'file_url' => $gallery->file_url,
            'youtube_url' => $gallery->youtube_url,
            'youtube_video_id' => $gallery->youtube_video_id,
            'youtube_thumbnail' => $gallery->youtube_thumbnail,
            'youtube_embed_url' => $gallery->youtube_embed_url,
            'is_active' => $gallery->is_active,
            'created_at' => $gallery->created_at?->toISOString(),
            'updated_at' => $gallery->updated_at?->toISOString(),
        ];

        return Inertia::render('admin/gallery/Show', [
            'gallery' => $resource,
        ]);
    }

    /**
     * Menampilkan form untuk mengedit item galeri.
     */
    public function edit(Gallery $gallery): Response
    {
        $resource = [
            'id' => $gallery->id,
            'title' => $gallery->title,
            'description' => $gallery->description,
            'file_type' => $gallery->file_type,
            'video_source' => $gallery->video_source,
            'file_path' => $gallery->file_path,
            'file_url' => $gallery->file_url,
            'youtube_url' => $gallery->youtube_url,
            'youtube_video_id' => $gallery->youtube_video_id,
            'youtube_thumbnail' => $gallery->youtube_thumbnail,
            'youtube_embed_url' => $gallery->youtube_embed_url,
            'is_active' => $gallery->is_active,
            'created_at' => $gallery->created_at?->toISOString(),
            'updated_at' => $gallery->updated_at?->toISOString(),
        ];

        return Inertia::render('admin/gallery/Edit', [
            'gallery' => $resource,
        ]);
    }

    /**
     * Update item galeri di database.
     */
    public function update(Request $request, Gallery $gallery): RedirectResponse
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file_type' => ['required', Rule::in(Gallery::getValidFileTypes())],
            'is_active' => 'boolean',
        ];

        // Tambahkan validasi berdasarkan file_type dan video_source
        if ($request->file_type === 'video') {
            $rules['video_source'] = ['required', Rule::in(Gallery::getValidVideoSources())];

            if ($request->video_source === 'youtube') {
                $rules['youtube_url'] = [
                    'required',
                    new YouTubeUrl()
                ];
            } else {
                // File hanya required jika belum ada file atau ingin mengupdate
                $rules['file'] = 'nullable|file|mimes:mp4,mov,avi,wmv|max:50000'; // 50MB untuk video
            }
        } else {
            // File hanya required jika belum ada file atau ingin mengupdate
            $rules['file'] = 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240'; // 10MB untuk gambar
        }

        $validated = $request->validate($rules);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'file_type' => $validated['file_type'],
            'is_active' => $validated['is_active'] ?? $gallery->is_active,
        ];

        // Handle perubahan dari/ke YouTube
        if ($validated['file_type'] === 'video' && $request->video_source === 'youtube') {
            // Jika berubah ke YouTube, hapus file lama jika ada
            if ($gallery->file_path && Storage::disk('public')->exists($gallery->file_path)) {
                Storage::disk('public')->delete($gallery->file_path);
            }

            $data['youtube_url'] = $validated['youtube_url'];
            $data['video_source'] = 'youtube';
            $data['file_path'] = null;
        } else {
            // Jika berubah ke file atau tetap file
            $data['video_source'] = 'file';
            $data['youtube_url'] = null;

            // Jika ada file baru yang diupload
            if ($request->hasFile('file')) {
                // Hapus file lama
                if ($gallery->file_path && Storage::disk('public')->exists($gallery->file_path)) {
                    Storage::disk('public')->delete($gallery->file_path);
                }

                // Upload file baru
                $file = $request->file('file');
                $data['file_path'] = $file->store('gallery', 'public');
            } else {
                // Pertahankan file lama
                $data['file_path'] = $gallery->file_path;
            }
        }

        // Update gallery item
        $gallery->update($data);

        return redirect()->route('admin.galleries.index')
            ->with('success', 'Item galeri berhasil diperbarui.');
    }

    /**
     * Hapus item galeri dari database.
     */
    public function destroy(Gallery $gallery): RedirectResponse
    {
        // Hapus file dari storage
        if ($gallery->file_path && Storage::disk('public')->exists($gallery->file_path)) {
            Storage::disk('public')->delete($gallery->file_path);
        }

        // Hapus dari database
        $gallery->delete();

        return redirect()->route('admin.galleries.index')
            ->with('success', 'Item galeri berhasil dihapus.');
    }

    /**
     * Toggle status aktif/non-aktif item galeri.
     */
    public function toggleActive(Gallery $gallery): RedirectResponse
    {
        $gallery->update([
            'is_active' => !$gallery->is_active,
        ]);

        $status = $gallery->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('admin.galleries.index')
            ->with('success', "Item galeri berhasil {$status}.");
    }
}
