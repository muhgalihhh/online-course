<?php

use Illuminate\Support\Facades\Route;

// Show quick video creator form
Route::get('/quick-video-creator', function () {
  return view('quick-video-creator');
});

// Quick admin route to create test video materials
Route::get('/quick-admin-video', function () {
  if (!auth()->check() || !auth()->user()->isAdmin()) {
    return response()->json(['error' => 'Unauthorized'], 401);
  }

  $courses = \App\Models\Course::with('chapters.materials')->get();

  return response()->json([
    'courses' => $courses->map(function ($course) {
      return [
        'id' => $course->id,
        'title' => $course->title,
        'chapters' => $course->chapters->map(function ($chapter) {
          return [
            'id' => $chapter->id,
            'title' => $chapter->title,
            'materials_count' => $chapter->materials->count(),
            'video_materials' => $chapter->materials->whereIn('type', ['video_local', 'video_youtube'])->count()
          ];
        })
      ];
    })
  ]);
});

// Quick create YouTube material
Route::post('/quick-create-youtube', function () {
  if (!auth()->check() || !auth()->user()->isAdmin()) {
    return response()->json(['error' => 'Unauthorized'], 401);
  }

  $data = request()->validate([
    'chapter_id' => 'required|exists:chapters,id',
    'title' => 'required|string|max:255',
    'youtube_url' => 'required|url',
    'order' => 'required|integer'
  ]);

  $material = \App\Models\CourseMaterial::create([
    'chapter_id' => $data['chapter_id'],
    'title' => $data['title'],
    'type' => 'video_youtube',
    'youtube_url' => $data['youtube_url'],
    'order' => $data['order'],
    'is_preview' => false
  ]);

  return response()->json([
    'success' => true,
    'material' => $material,
    'message' => 'YouTube material created successfully'
  ]);
});
