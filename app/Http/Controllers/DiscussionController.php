<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseDiscussion;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DiscussionController extends Controller
{
  public function index($courseId)
  {
    $course = Course::findOrFail($courseId);

    // require enrollment
    $enrolled = Enrollment::where('course_id', $course->id)
      ->where('user_id', Auth::id())
      ->exists();

    if (!$enrolled) {
      return redirect()->route('courses.show', $course->id)
        ->with('error', 'Anda harus mendaftar kursus ini untuk mengakses diskusi.');
    }

    $threads = CourseDiscussion::with(['user', 'replies.user'])
      ->where('course_id', $course->id)
      ->whereNull('parent_id')
      ->orderBy('created_at', 'desc')
      ->get();

    return Inertia::render('courses/discussion', [
      'course' => $course,
      'threads' => $threads,
    ]);
  }

  public function store(Request $request, $courseId)
  {
    $request->validate([
      'content' => ['required', 'string', 'min:2', 'max:5000'],
      'parent_id' => ['nullable', 'exists:course_discussions,id'],
    ]);

    $course = Course::findOrFail($courseId);

    $enrolled = Enrollment::where('course_id', $course->id)
      ->where('user_id', Auth::id())
      ->exists();

    if (!$enrolled) {
      return back()->with('error', 'Anda harus mendaftar kursus ini.');
    }

    // If replying, ensure the parent thread belongs to the same course
    $parentId = $request->input('parent_id');
    if ($parentId) {
      $parent = CourseDiscussion::findOrFail($parentId);
      if ($parent->course_id !== $course->id) {
        return back()->with('error', 'Balasan tidak valid untuk kursus ini.');
      }
    }

    CourseDiscussion::create([
      'course_id' => $course->id,
      'user_id' => Auth::id(),
      'content' => $request->string('content')->toString(),
      'parent_id' => $parentId,
    ]);

    return redirect()->route('courses.discussion.index', $course->id)->with('success', 'Komentar terkirim.');
  }
}
