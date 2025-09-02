<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Models\CourseMaterial;
use App\Models\Chapter;

Route::middleware(['web'])->group(function () {
  Route::get('/test-youtube-form', function () {
    $chapters = Chapter::with('course')->get();
    return view('test-youtube-form', compact('chapters'));
  });

  Route::post('/test-youtube-submit', function (Request $request) {
    Log::info('TEST ROUTE - Request received:', $request->all());

    try {
      $data = $request->validate([
        'chapter_id' => 'required|exists:chapters,id',
        'title' => 'required|string',
        'order' => 'required|integer',
        'type' => 'required|in:video_youtube',
        'youtube_url' => 'required|string|url',
      ]);

      Log::info('TEST ROUTE - Validated data:', $data);

      $material = CourseMaterial::create([
        'chapter_id' => $data['chapter_id'],
        'title' => $data['title'],
        'order' => $data['order'],
        'type' => 'video_youtube',
        'youtube_url' => $data['youtube_url'],
        'file_path' => null,
        'is_preview' => false,
      ]);

      Log::info('TEST ROUTE - Material created:', $material->toArray());

      return redirect()->back()->with('success', 'Material created successfully! ID: ' . $material->id);

    } catch (\Exception $e) {
      Log::error('TEST ROUTE - Error:', ['message' => $e->getMessage()]);
      return redirect()->back()->with('error', 'Error: ' . $e->getMessage());
    }
  });
});
