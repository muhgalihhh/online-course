<?php

use Illuminate\Support\Facades\Route;

Route::get('/debug-materials', function () {
    $materials = \App\Models\CourseMaterial::whereIn('type', ['video_local', 'video_youtube'])
        ->with('chapter.course')
        ->get(['id', 'title', 'type', 'file_path', 'youtube_url', 'chapter_id']);

    return response()->json([
        'count' => $materials->count(),
        'materials' => $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'type' => $material->type,
                'file_path' => $material->file_path,
                'youtube_url' => $material->youtube_url,
                'course' => $material->chapter->course->title ?? 'Unknown'
            ];
        })
    ]);
});
