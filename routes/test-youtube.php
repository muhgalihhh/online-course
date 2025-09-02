<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Models\CourseMaterial;
use App\Models\Chapter;

Route::post('/test-youtube-material', function (Request $request) {
  Log::info('Request data received:', $request->all());

  try {
    // Validasi manual
    $data = $request->validate([
      'chapter_id' => 'required|exists:chapters,id',
      'title' => 'required|string',
      'order' => 'required|integer',
      'type' => 'required|in:video_youtube',
      'youtube_url' => 'required|string',
    ]);

    Log::info('Validated data:', $data);

    // Buat material
    $material = CourseMaterial::create([
      'chapter_id' => $data['chapter_id'],
      'title' => $data['title'],
      'order' => $data['order'],
      'type' => 'video_youtube',
      'youtube_url' => $data['youtube_url'],
      'file_path' => null,
      'is_preview' => false,
    ]);

    Log::info('Material created:', $material->toArray());

    return response()->json([
      'success' => true,
      'material' => $material
    ]);

  } catch (\Exception $e) {
    Log::error('Error creating material:', [
      'message' => $e->getMessage(),
      'trace' => $e->getTraceAsString()
    ]);

    return response()->json([
      'success' => false,
      'error' => $e->getMessage()
    ], 500);
  }
});
