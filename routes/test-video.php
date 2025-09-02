<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-video-materials', function () {
  $materials = \App\Models\CourseMaterial::whereIn('type', ['video_local', 'video_youtube'])
    ->with('chapter.course')
    ->get();

  if ($materials->isEmpty()) {
    return response()->json([
      'message' => 'No video materials found in database',
      'suggestion' => 'Please create some video materials first'
    ]);
  }

  return response()->json([
    'total_video_materials' => $materials->count(),
    'materials' => $materials->map(function ($material) {
      return [
        'id' => $material->id,
        'title' => $material->title,
        'type' => $material->type,
        'file_path' => $material->file_path,
        'youtube_url' => $material->youtube_url,
        'course' => $material->chapter->course->title ?? 'Unknown',
        'chapter' => $material->chapter->title ?? 'Unknown'
      ];
    })
  ]);
});
