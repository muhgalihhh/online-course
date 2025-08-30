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

        // Build institution reviews query
        $institutionQuery = Review::with(['user', 'institution:id,name']);

        // Apply filters to institution reviews
        if ($request->filled('search')) {
            $search = $request->get('search');
            $institutionQuery->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $institutionQuery->where('status', $request->get('status'));
        }

        if ($request->filled('rating_min')) {
            $institutionQuery->where('rating', '>=', $request->get('rating_min'));
        }

        if ($request->filled('rating_max')) {
            $institutionQuery->where('rating', '<=', $request->get('rating_max'));
        }

        if ($request->filled('date_from')) {
            $institutionQuery->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $institutionQuery->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Filter by review type
        if ($request->filled('review_type') && $request->get('review_type') === 'course') {
            $institutionReviews = collect();
        } else {
            $institutionReviews = $institutionQuery->get()
                ->map(function ($r) {
                    return [
                        'id' => 'institution_' . $r->id, // Add prefix for unique keys
                        'original_id' => $r->id, // Keep original ID for backend operations
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
        }

        // Build course reviews query
        $courseQuery = CourseReview::with(['user', 'course:id,title']);

        // Apply filters to course reviews
        if ($request->filled('search')) {
            $search = $request->get('search');
            $courseQuery->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $courseQuery->where('status', $request->get('status'));
        }

        if ($request->filled('rating_min')) {
            $courseQuery->where('rating', '>=', $request->get('rating_min'));
        }

        if ($request->filled('rating_max')) {
            $courseQuery->where('rating', '<=', $request->get('rating_max'));
        }

        if ($request->filled('date_from')) {
            $courseQuery->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $courseQuery->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Filter by review type
        if ($request->filled('review_type') && $request->get('review_type') === 'institution') {
            $courseReviews = collect();
        } else {
            $courseReviews = $courseQuery->get()
                ->map(function ($r) {
                    return [
                        'id' => 'course_' . $r->id, // Add prefix for unique keys
                        'original_id' => $r->id, // Keep original ID for backend operations
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
        }

        $merged = $institutionReviews->merge($courseReviews);

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortOrder === 'asc') {
            $merged = $merged->sortBy($sortBy)->values();
        } else {
            $merged = $merged->sortByDesc($sortBy)->values();
        }

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
            'filters' => $request->only(['search', 'status', 'rating_min', 'rating_max', 'review_type', 'date_from', 'date_to', 'sort_by', 'sort_order']),
            'statistics' => [
                'total_reviews' => $total,
                'average_rating' => $merged->count() > 0 ? round($merged->avg('rating'), 1) : 0,
                'pending_reviews' => $merged->where('status', 'pending')->count(),
                'approved_reviews' => $merged->where('status', 'approved')->count(),
                'rejected_reviews' => $merged->where('status', 'rejected')->count(),
            ]
        ]);
    }

    /**
     * Update status review berdasarkan ID. Mendeteksi tipe otomatis.
     */
    public function updateStatus(Request $request, string $review)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        // Parse the prefixed ID
        if (str_starts_with($review, 'course_')) {
            $realId = (int) str_replace('course_', '', $review);
            $model = CourseReview::findOrFail($realId);
            $model->update(['status' => $validated['status']]);
            $message = 'Status review kursus berhasil diperbarui.';
        } elseif (str_starts_with($review, 'institution_')) {
            $realId = (int) str_replace('institution_', '', $review);
            $model = Review::findOrFail($realId);
            $model->update(['status' => $validated['status']]);
            $message = 'Status review institusi berhasil diperbarui.';
        } else {
            // Fallback for old format (try both models)
            $model = CourseReview::find($review);
            if ($model) {
                $model->update(['status' => $validated['status']]);
                $message = 'Status review kursus berhasil diperbarui.';
            } else {
                $model = Review::findOrFail($review);
                $model->update(['status' => $validated['status']]);
                $message = 'Status review institusi berhasil diperbarui.';
            }
        }

        return redirect()->route('admin.reviews')
            ->with('success', $message);
    }

    /**
     * Hapus review berdasarkan ID. Mendeteksi tipe otomatis.
     */
    public function destroy(string $review)
    {
        // Parse the prefixed ID
        if (str_starts_with($review, 'course_')) {
            $realId = (int) str_replace('course_', '', $review);
            $model = CourseReview::findOrFail($realId);
            $model->delete();
            $message = 'Review kursus berhasil dihapus.';
        } elseif (str_starts_with($review, 'institution_')) {
            $realId = (int) str_replace('institution_', '', $review);
            $model = Review::findOrFail($realId);
            $model->delete();
            $message = 'Review institusi berhasil dihapus.';
        } else {
            // Fallback for old format (try both models)
            $model = CourseReview::find($review);
            if ($model) {
                $model->delete();
                $message = 'Review kursus berhasil dihapus.';
            } else {
                $model = Review::findOrFail($review);
                $model->delete();
                $message = 'Review institusi berhasil dihapus.';
            }
        }

        return redirect()->route('admin.reviews')
            ->with('success', $message);
    }
}
