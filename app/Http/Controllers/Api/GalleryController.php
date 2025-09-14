<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
  /**
   * Menampilkan daftar galeri untuk publik
   */
  public function index(Request $request): JsonResponse
  {
    $query = Gallery::active();

    // Filter by file type
    if ($request->filled('type')) {
      $query->where('file_type', $request->get('type'));
    }

    // Filter by video source (hanya untuk video)
    if ($request->filled('video_source')) {
      $query->where('file_type', 'video')
        ->where('video_source', $request->get('video_source'));
    }

    // Search by title
    if ($request->filled('search')) {
      $query->where('title', 'like', '%' . $request->get('search') . '%');
    }

    $galleries = $query->orderBy('created_at', 'desc')
      ->paginate($request->get('per_page', 12));

    // Transform data untuk menambahkan informasi YouTube
    $galleries->getCollection()->transform(function ($gallery) {
      $data = $gallery->toArray();

      if ($gallery->isYouTubeVideo()) {
        $data['youtube_video_id'] = $gallery->getYouTubeVideoId();
        $data['youtube_thumbnail'] = $gallery->getYouTubeThumbnail();
        $data['youtube_embed_url'] = $gallery->getYouTubeEmbedUrl();
        $data['file_url'] = null; // Tidak ada file URL untuk YouTube
      } else {
        $data['file_url'] = $gallery->file_url;
        $data['youtube_video_id'] = null;
        $data['youtube_thumbnail'] = null;
        $data['youtube_embed_url'] = null;
      }

      return $data;
    });

    return response()->json([
      'success' => true,
      'data' => $galleries,
    ]);
  }

  /**
   * Menampilkan detail galeri
   */
  public function show(Gallery $gallery): JsonResponse
  {
    if (!$gallery->is_active) {
      return response()->json([
        'success' => false,
        'message' => 'Gallery item not found or inactive.',
      ], 404);
    }

    $data = $gallery->toArray();

    if ($gallery->isYouTubeVideo()) {
      $data['youtube_video_id'] = $gallery->getYouTubeVideoId();
      $data['youtube_thumbnail'] = $gallery->getYouTubeThumbnail();
      $data['youtube_embed_url'] = $gallery->getYouTubeEmbedUrl();
      $data['file_url'] = null;
    } else {
      $data['file_url'] = $gallery->file_url;
      $data['youtube_video_id'] = null;
      $data['youtube_thumbnail'] = null;
      $data['youtube_embed_url'] = null;
    }

    return response()->json([
      'success' => true,
      'data' => $data,
    ]);
  }

  /**
   * Menampilkan hanya video YouTube
   */
  public function youtubeVideos(Request $request): JsonResponse
  {
    $query = Gallery::active()
      ->where('file_type', 'video')
      ->where('video_source', 'youtube');

    // Search by title
    if ($request->filled('search')) {
      $query->where('title', 'like', '%' . $request->get('search') . '%');
    }

    $galleries = $query->orderBy('created_at', 'desc')
      ->paginate($request->get('per_page', 12));

    $galleries->getCollection()->transform(function ($gallery) {
      return [
        'id' => $gallery->id,
        'title' => $gallery->title,
        'description' => $gallery->description,
        'youtube_url' => $gallery->youtube_url,
        'youtube_video_id' => $gallery->getYouTubeVideoId(),
        'youtube_thumbnail' => $gallery->getYouTubeThumbnail(),
        'youtube_embed_url' => $gallery->getYouTubeEmbedUrl(),
        'created_at' => $gallery->created_at,
      ];
    });

    return response()->json([
      'success' => true,
      'data' => $galleries,
    ]);
  }
}
