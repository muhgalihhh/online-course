<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

// Temporary debug route untuk test admin material store
Route::middleware(['web', 'auth'])->post('/debug-admin-materials', function (Request $request) {
  Log::info('DEBUG ADMIN MATERIALS - Request received:', [
    'all' => $request->all(),
    'method' => $request->method(),
    'headers' => $request->headers->all(),
    'url' => $request->url(),
    'user' => auth()->user() ? auth()->user()->id : 'not logged in',
  ]);

  try {
    // Basic validation
    $data = $request->validate([
      'chapter_id' => 'required|exists:chapters,id',
      'title' => 'required|string',
      'order' => 'required|integer',
      'type' => 'required|in:video_youtube',
      'youtube_url' => 'required|string',
    ]);

    Log::info('DEBUG ADMIN MATERIALS - Validated successfully:', $data);

    // Try to create
    $material = \App\Models\CourseMaterial::create([
      'chapter_id' => $data['chapter_id'],
      'title' => $data['title'],
      'order' => $data['order'],
      'type' => 'video_youtube',
      'youtube_url' => $data['youtube_url'],
      'file_path' => null,
      'is_preview' => false,
    ]);

    Log::info('DEBUG ADMIN MATERIALS - Material created:', $material->toArray());

    return response()->json([
      'success' => true,
      'message' => 'Material created successfully',
      'material' => $material,
    ]);

  } catch (\Exception $e) {
    Log::error('DEBUG ADMIN MATERIALS - Error:', [
      'message' => $e->getMessage(),
      'trace' => $e->getTraceAsString(),
    ]);

    return response()->json([
      'success' => false,
      'error' => $e->getMessage(),
    ], 500);
  }
});
