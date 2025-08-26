<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\CourseReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Pagination\LengthAwarePaginator;

class ReviewController extends Controller
{
    /**
     * Menampilkan daftar semua review (institusi dan course) dalam satu daftar terpaginasi.
     */
    public function index(Request $request): Response
    {
        $perPage = 10;
        $page = (int) $request->get('page', 1);

        $institutionReviews = Review::with(['user', 'institution:id,name'])
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'status' => $r->status,
                    'created_at' => $r->created_at,
                    'user' => [
                        'id' => $r->user?->id,
                        'name' => $r->user?->name,
                        'email' => $r->user?->email,
                    ],
                    'reviewable' => [
                        'id' => $r->institution_id,
                        'title' => $r->institution?->name,
                        'type' => 'institution',
                    ],
                ];
            });

        $courseReviews = CourseReview::with(['user', 'course:id,title'])
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'status' => $r->status,
                    'created_at' => $r->created_at,
                    'user' => [
                        'id' => $r->user?->id,
                        'name' => $r->user?->name,
                        'email' => $r->user?->email,
                    ],
                    'reviewable' => [
                        'id' => $r->course_id,
                        'title' => $r->course?->title,
                        'type' => 'course',
                    ],
                ];
            });

        $merged = $institutionReviews->merge($courseReviews)
            ->sortByDesc('created_at')
            ->values();

        $total = $merged->count();
        $items = $merged->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('admin/reviews', [
            'reviews' => $paginator,
        ]);
    }

    /**
     * Update status review berdasarkan ID. Mendeteksi tipe otomatis.
     */
    public function updateStatus(Request $request, int $review)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $model = CourseReview::find($review);
        if ($model) {
            $model->update(['status' => $validated['status']]);
            $message = 'Status review kursus berhasil diperbarui.';
        } else {
            $model = Review::findOrFail($review);
            $model->update(['status' => $validated['status']]);
            $message = 'Status review institusi berhasil diperbarui.';
        }

        return redirect()->route('admin.reviews')
            ->with('success', $message);
    }

    /**
     * Hapus review berdasarkan ID. Mendeteksi tipe otomatis.
     */
    public function destroy(int $review)
    {
        $model = CourseReview::find($review);
        if ($model) {
            $model->delete();
            $message = 'Review kursus berhasil dihapus.';
        } else {
            $model = Review::findOrFail($review);
            $model->delete();
            $message = 'Review institusi berhasil dihapus.';
        }

        return redirect()->route('admin.reviews')
            ->with('success', $message);
    }
}