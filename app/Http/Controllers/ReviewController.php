<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\CourseReview;
use App\Models\Institution;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
  /**
   * Store a new institution review
   */
  public function storeInstitutionReview(Request $request)
  {
    $request->validate([
      'rating' => 'required|integer|min:1|max:5',
      'comment' => 'required|string|max:1000',
    ]);

    $institution = Institution::first();

    if (!$institution) {
      return back()->with('error', 'Institusi tidak ditemukan.');
    }

    // Check if user already reviewed this institution
    $existingReview = Review::where('user_id', Auth::id())
      ->where('institution_id', $institution->id)
      ->first();

    if ($existingReview) {
      return back()->with('error', 'Anda sudah memberikan review untuk institusi ini.');
    }

    Review::create([
      'user_id' => Auth::id(),
      'institution_id' => $institution->id,
      'rating' => $request->rating,
      'comment' => $request->comment,
      'status' => 'pending', // Will be approved by admin
    ]);

    return back()->with('success', 'Review Anda telah berhasil dikirim dan sedang menunggu persetujuan admin.');
  }

  /**
   * Store a new course review
   */
  public function storeCourseReview(Request $request, Course $course)
  {
    $request->validate([
      'rating' => 'required|integer|min:1|max:5',
      'comment' => 'required|string|max:1000',
    ]);

    // Check if user is enrolled in this course
    $isEnrolled = $course->enrollments()
      ->where('user_id', Auth::id())
      ->exists();

    if (!$isEnrolled) {
      return back()->with('error', 'Anda harus terdaftar di kursus ini untuk memberikan review.');
    }

    // Check if user already reviewed this course
    $existingReview = CourseReview::where('user_id', Auth::id())
      ->where('course_id', $course->id)
      ->first();

    if ($existingReview) {
      return back()->with('error', 'Anda sudah memberikan review untuk kursus ini.');
    }

    CourseReview::create([
      'user_id' => Auth::id(),
      'course_id' => $course->id,
      'rating' => $request->rating,
      'comment' => $request->comment,
      'status' => 'approved', // Course reviews are auto-approved
    ]);

    return back()->with('success', 'Review Anda telah berhasil dikirim.');
  }
}
