<?php

namespace App\Http\Controllers;

use App\Models\CourseMaterial;
use App\Models\Enrollment;
use App\Services\VideoSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class SecureVideoController extends Controller
{
  protected $videoSecurityService;

  public function __construct(VideoSecurityService $videoSecurityService)
  {
    $this->videoSecurityService = $videoSecurityService;
  }

  /**
   * Stream secure video content
   */
  public function streamVideo(Request $request, $token)
  {
    // Validate token
    $payload = $this->videoSecurityService->validateSecureToken($token);

    if (!$payload || $payload['user_id'] !== Auth::id()) {
      abort(403, 'Unauthorized access to video content');
    }

    // Get material and check access
    $material = CourseMaterial::with('chapter.course')->findOrFail($payload['material_id']);

    // Verify user enrollment
    $enrollment = Enrollment::where('user_id', Auth::id())
      ->where('course_id', $material->chapter->course->id)
      ->first();

    if (!$enrollment) {
      abort(403, 'User not enrolled in this course');
    }

    // Get video file path
    $videoPath = $material->file_path;
    if (!$videoPath || !Storage::disk('public')->exists($videoPath)) {
      abort(404, 'Video file not found');
    }

    $fullPath = Storage::disk('public')->path($videoPath);
    $fileSize = filesize($fullPath);
    $mimeType = mime_content_type($fullPath);

    // Handle range requests for video streaming
    $headers = [
      'Content-Type' => $mimeType,
      'Accept-Ranges' => 'bytes',
      'Cache-Control' => 'no-cache, no-store, must-revalidate',
      'Pragma' => 'no-cache',
      'Expires' => '0',
      'X-Frame-Options' => 'SAMEORIGIN',
      'X-Content-Type-Options' => 'nosniff'
    ];

    if ($request->hasHeader('Range')) {
      return $this->handleRangeRequest($fullPath, $fileSize, $headers, $request->header('Range'));
    }

    $headers['Content-Length'] = $fileSize;

    return Response::file($fullPath, $headers);
  }

  /**
   * Serve secure YouTube embed
   */
  public function youtubeEmbed(Request $request)
  {
    $params = $request->only(['material_id', 'user_id', 'video_id', 'timestamp', 'signature']);

    // Verify signature
    $expectedSignature = hash_hmac('sha256', http_build_query(array_diff_key($params, ['signature' => ''])), config('app.key'));

    if (!hash_equals($expectedSignature, $params['signature'])) {
      abort(403, 'Invalid signature');
    }

    // Check if request is too old (5 minutes)
    if (time() - $params['timestamp'] > 300) {
      abort(403, 'Token expired');
    }

    // Verify user and material access
    if ($params['user_id'] != Auth::id()) {
      abort(403, 'Unauthorized');
    }

    $material = CourseMaterial::with('chapter.course')->findOrFail($params['material_id']);

    $enrollment = Enrollment::where('user_id', Auth::id())
      ->where('course_id', $material->chapter->course->id)
      ->first();

    if (!$enrollment) {
      abort(403, 'User not enrolled');
    }

    // Generate watermark data
    $watermarkData = $this->videoSecurityService->generateWatermarkData(Auth::id(), $material->chapter->course->title);

    return view('secure.youtube-embed', [
      'videoId' => $params['video_id'],
      'materialTitle' => $material->title,
      'watermark' => $watermarkData,
      'courseTitle' => $material->chapter->course->title
    ]);
  }

  /**
   * Handle HTTP range requests for video streaming
   */
  private function handleRangeRequest($filePath, $fileSize, $headers, $rangeHeader)
  {
    $range = str_replace('bytes=', '', $rangeHeader);
    $ranges = explode(',', $range);
    $range = $ranges[0];

    if (strpos($range, '-') !== false) {
      list($start, $end) = explode('-', $range);
      $start = (int) $start;
      $end = ($end === '') ? $fileSize - 1 : (int) $end;
    } else {
      $start = (int) $range;
      $end = $fileSize - 1;
    }

    if ($start > $fileSize - 1 || $end > $fileSize - 1) {
      $headers['Content-Range'] = "bytes */$fileSize";
      return response('', 416, $headers);
    }

    $length = $end - $start + 1;

    $headers['Content-Range'] = "bytes $start-$end/$fileSize";
    $headers['Content-Length'] = $length;

    $file = fopen($filePath, 'rb');
    fseek($file, $start);
    $data = fread($file, $length);
    fclose($file);

    return response($data, 206, $headers);
  }
}
