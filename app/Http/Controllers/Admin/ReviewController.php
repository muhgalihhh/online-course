<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\CourseReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Menampilkan daftar semua review institusi dan course.
     */
    public function index(): Response
    {
        // Ambil review institusi dengan relasi user
        $institutionReviews = Review::with('user')
            ->latest()
            ->paginate(10, ['*'], 'institution_page');

        // Ambil review course dengan relasi user dan course
        $courseReviews = CourseReview::with(['user', 'course'])
            ->latest()
            ->paginate(10, ['*'], 'course_page');

        return Inertia::render('admin/reviews/index', [
            'institutionReviews' => $institutionReviews,
            'courseReviews' => $courseReviews,
        ]);
    }

    /**
     * Update status review (institusi atau course).
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'review_type' => 'required|in:institution,course',
            'review_id' => 'required|integer',
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $reviewId = $validated['review_id'];
        $status = $validated['status'];

        if ($validated['review_type'] === 'institution') {
            $review = Review::findOrFail($reviewId);
            $review->update(['status' => $status]);
            $message = 'Status review institusi berhasil diperbarui.';
        } else {
            $review = CourseReview::findOrFail($reviewId);
            $review->update(['status' => $status]);
            $message = 'Status review kursus berhasil diperbarui.';
        }

        return redirect()->route('admin.reviews.index')
            ->with('success', $message);
    }

    /**
     * Hapus review (institusi atau course).
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'review_type' => 'required|in:institution,course',
            'review_id' => 'required|integer',
        ]);

        $reviewId = $validated['review_id'];

        if ($validated['review_type'] === 'institution') {
            $review = Review::findOrFail($reviewId);
            $review->delete();
            $message = 'Review institusi berhasil dihapus.';
        } else {
            $review = CourseReview::findOrFail($reviewId);
            $review->delete();
            $message = 'Review kursus berhasil dihapus.';
        }

        return redirect()->route('admin.reviews.index')
            ->with('success', $message);
    }
}