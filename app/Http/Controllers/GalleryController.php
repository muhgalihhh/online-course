<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
  /**
   * Menampilkan galeri publik untuk pengunjung website.
   */
  public function index(Request $request): Response
  {
    $query = Gallery::active()->orderBy('created_at', 'desc');

    // Filter by file type
    if ($request->filled('type')) {
      $type = $request->get('type');
      if (in_array($type, ['image', 'video'])) {
        $query->where('file_type', $type);
      }
    }

    // Search functionality
    if ($request->filled('search')) {
      $search = $request->get('search');
      $query->where(function ($q) use ($search) {
        $q->where('title', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%");
      });
    }

    $galleries = $query->paginate(12)->withQueryString();

    return Inertia::render('gallery/index', [
      'galleries' => $galleries,
      'filters' => [
        'search' => $request->get('search', ''),
        'type' => $request->get('type', ''),
      ],
    ]);
  }

  /**
   * API endpoint untuk mendapatkan data gallery.
   */
  public function api(Request $request)
  {
    $query = Gallery::active()->orderBy('created_at', 'desc');

    // Filter by file type
    if ($request->filled('type')) {
      $type = $request->get('type');
      if (in_array($type, ['image', 'video'])) {
        $query->where('file_type', $type);
      }
    }

    // Limit hasil
    $limit = $request->get('limit', 12);
    $limit = min($limit, 50); // Maximum 50 items

    $galleries = $query->limit($limit)->get()->map(function ($gallery) {
      return [
        'id' => $gallery->id,
        'title' => $gallery->title,
        'description' => $gallery->description,
        'file_url' => $gallery->file_url,
        'file_type' => $gallery->file_type,
        'created_at' => $gallery->created_at->format('Y-m-d H:i:s'),
      ];
    });

    return response()->json([
      'data' => $galleries,
      'total' => $galleries->count(),
    ]);
  }
}
