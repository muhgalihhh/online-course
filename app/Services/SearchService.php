<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Chapter;
use App\Models\Institution;
use App\Models\Review;
use App\Models\CourseReview;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SearchService
{
    /**
     * Perform global search across supported resources
     *
     * @param string $query
     * @param string $filter
     * @param int $limit
     * @return array<string, mixed>
     */
    public function search(string $query, string $filter = 'all', int $limit = 15): array
    {
        $query = trim($query);
        if ($query === '') {
            return $this->emptyResults();
        }

        $searchTerms = array_values(array_filter(explode(' ', $query)));

        $results = [];

        if ($filter === 'all' || $filter === 'users') {
            $results['users'] = $this->searchUsers($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'courses') {
            $results['courses'] = $this->searchCourses($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'materials') {
            $results['course_materials'] = $this->searchMaterials($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'transactions') {
            $results['transactions'] = $this->searchTransactions($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'categories') {
            $results['categories'] = $this->searchCategories($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'chapters') {
            $results['chapters'] = $this->searchChapters($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'institutions') {
            $results['institutions'] = $this->searchInstitutions($searchTerms, $limit);
        }
        if ($filter === 'all' || $filter === 'reviews') {
            $results['reviews'] = $this->searchReviews($searchTerms, $limit);
        }

        foreach (array_keys($this->emptyResults()) as $key) {
            if (!array_key_exists($key, $results)) {
                $results[$key] = [];
            }
        }

        return $results;
    }

    /** @return array<string, array> */
    private function emptyResults(): array
    {
        return [
            'users' => [],
            'courses' => [],
            'course_materials' => [],
            'transactions' => [],
            'categories' => [],
            'chapters' => [],
            'institutions' => [],
            'reviews' => [],
        ];
    }

    private function searchUsers(array $terms, int $limit): Collection
    {
        $query = User::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('role', 'like', "%{$term}%");
                if (is_numeric($term)) {
                    $q->orWhere('id', (int) $term);
                }
            });
        }
        return $query->limit($limit)->get(['id', 'name', 'email', 'role'])->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role),
            ];
        });
    }

    private function searchCourses(array $terms, int $limit): Collection
    {
        $query = Course::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('level', 'like', "%{$term}%")
                  ->orWhere('status', 'like', "%{$term}%")
                  ->orWhereHas('category', function (Builder $cq) use ($term) {
                      $cq->where('name', 'like', "%{$term}%");
                  })
                  ->orWhereHas('institution', function (Builder $iq) use ($term) {
                      $iq->where('name', 'like', "%{$term}%");
                  });
                if (is_numeric($term)) {
                    $q->orWhere('price', 'like', "%{$term}%")
                      ->orWhere('id', (int) $term);
                }
                $termLower = strtolower($term);
                if (in_array($termLower, ['pro', 'premium', 'berbayar'])) {
                    $q->orWhere('is_pro', true);
                } elseif (in_array($termLower, ['free', 'gratis'])) {
                    $q->orWhere('is_pro', false);
                }
                if (in_array($termLower, ['draft', 'published', 'archived'])) {
                    $q->orWhere('status', $termLower);
                }
            });
        }
        return $query->withCount(['users', 'chapters', 'reviews'])
            ->with(['category:id,name', 'institution:id,name'])
            ->limit($limit)
            ->get(['id', 'title', 'description', 'price', 'is_pro', 'level', 'status', 'category_id', 'institution_id'])
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => \Str::limit($course->description, 150),
                    'students_count' => $course->users_count,
                    'chapters_count' => $course->chapters_count,
                    'reviews_count' => $course->reviews_count,
                    'price' => $course->price,
                    'is_pro' => $course->is_pro,
                    'level' => $course->level,
                    'status' => $course->status,
                    'category' => $course->category?->name,
                    'institution' => $course->institution?->name,
                ];
            });
    }

    private function searchCategories(array $terms, int $limit): Collection
    {
        $query = Category::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('slug', 'like', "%{$term}%");
                if (is_numeric($term)) {
                    $q->orWhere('id', (int) $term);
                }
            });
        }
        return $query->withCount('courses')->limit($limit)
            ->get(['id', 'name', 'description', 'slug'])
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => \Str::limit($category->description ?? '', 150),
                    'slug' => $category->slug,
                    'courses_count' => $category->courses_count,
                ];
            });
    }

    private function searchChapters(array $terms, int $limit): Collection
    {
        $query = Chapter::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhereHas('course', function (Builder $cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
                if (is_numeric($term)) {
                    $q->orWhere('duration', 'like', "%{$term}%")
                      ->orWhere('order', (int) $term)
                      ->orWhere('id', (int) $term);
                }
                $termLower = strtolower($term);
                if (in_array($termLower, ['free', 'gratis'])) {
                    $q->orWhere('is_free', true);
                } elseif (in_array($termLower, ['locked', 'berbayar', 'premium'])) {
                    $q->orWhere('is_free', false);
                }
            });
        }
        return $query->with('course:id,title')->withCount('materials')->limit($limit)
            ->get(['id', 'title', 'description', 'course_id', 'duration', 'is_free', 'order'])
            ->map(function ($chapter) {
                return [
                    'id' => $chapter->id,
                    'title' => $chapter->title,
                    'description' => \Str::limit($chapter->description ?? '', 150),
                    'course_title' => $chapter->course?->title ?? 'Unknown',
                    'course_id' => $chapter->course_id,
                    'duration' => $chapter->duration,
                    'is_free' => $chapter->is_free,
                    'order' => $chapter->order,
                    'materials_count' => $chapter->materials_count,
                ];
            });
    }

    private function searchInstitutions(array $terms, int $limit): Collection
    {
        $query = Institution::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('address', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('website', 'like', "%{$term}%");
                if (is_numeric($term)) {
                    $q->orWhere('id', (int) $term);
                }
            });
        }
        return $query->withCount('courses')->limit($limit)
            ->get(['id', 'name', 'description', 'address', 'phone', 'email', 'website'])
            ->map(function ($institution) {
                return [
                    'id' => $institution->id,
                    'name' => $institution->name,
                    'description' => \Str::limit($institution->description ?? '', 150),
                    'address' => $institution->address,
                    'phone' => $institution->phone,
                    'email' => $institution->email,
                    'website' => $institution->website,
                    'courses_count' => $institution->courses_count,
                ];
            });
    }

    private function searchMaterials(array $terms, int $limit): Collection
    {
        $query = CourseMaterial::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('type', 'like', "%{$term}%")
                  ->orWhere('file_path', 'like', "%{$term}%")
                  ->orWhere('youtube_url', 'like', "%{$term}%")
                  ->orWhereHas('chapter', function (Builder $cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%")
                         ->orWhereHas('course', function (Builder $ccq) use ($term) {
                             $ccq->where('title', 'like', "%{$term}%");
                         });
                  });
                if (is_numeric($term)) {
                    $q->orWhere('id', (int) $term)
                      ->orWhere('order', (int) $term);
                }
                $termLower = strtolower($term);
                if (in_array($termLower, ['preview', 'pratinjau'])) {
                    $q->orWhere('is_preview', true);
                }
                if (in_array($termLower, ['video', 'document', 'pdf', 'youtube'])) {
                    $q->orWhere('type', $termLower);
                }
            });
        }
        return $query->with(['chapter:id,title,course_id', 'chapter.course:id,title'])->limit($limit)
            ->get(['id', 'title', 'type', 'chapter_id', 'file_path', 'youtube_url', 'is_preview', 'order'])
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => ucfirst($material->type ?? 'document'),
                    'chapter_title' => $material->chapter?->title,
                    'course_title' => $material->chapter?->course?->title,
                    'is_preview' => $material->is_preview,
                    'order' => $material->order,
                ];
            });
    }

    private function searchReviews(array $terms, int $limit): Collection
    {
        $allReviews = collect();

        $reviewQuery = Review::query();
        foreach ($terms as $term) {
            $reviewQuery->where(function (Builder $q) use ($term) {
                $q->where('comment', 'like', "%{$term}%")
                  ->orWhereHas('user', function (Builder $uq) use ($term) {
                      $uq->where('name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%");
                  })
                  ->orWhereHas('institution', function (Builder $iq) use ($term) {
                      $iq->where('name', 'like', "%{$term}%");
                  });
                if (is_numeric($term)) {
                    $q->orWhere('rating', (int) $term)
                      ->orWhere('id', (int) $term);
                }
                $termLower = strtolower($term);
                if (in_array($termLower, ['pending', 'approved', 'rejected'])) {
                    $q->orWhere('status', $termLower);
                }
            });
        }
        $institutionReviews = $reviewQuery->with(['user:id,name', 'institution:id,name'])
            ->limit(min(10, $limit))
            ->get(['id', 'user_id', 'institution_id', 'rating', 'comment', 'status', 'created_at']);

        foreach ($institutionReviews as $review) {
            $allReviews->push([
                'id' => $review->id,
                'type' => 'institution',
                'user_name' => $review->user?->name ?? 'Unknown',
                'target_name' => $review->institution?->name ?? 'Unknown',
                'target_type' => 'Institution',
                'rating' => $review->rating,
                'comment' => \Str::limit($review->comment ?? '', 150),
                'status' => $review->status ?? 'approved',
                'created_at' => $review->created_at?->format('Y-m-d H:i:s'),
            ]);
        }

        $courseReviewQuery = CourseReview::query();
        foreach ($terms as $term) {
            $courseReviewQuery->where(function (Builder $q) use ($term) {
                $q->where('comment', 'like', "%{$term}%")
                  ->orWhereHas('user', function (Builder $uq) use ($term) {
                      $uq->where('name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%");
                  })
                  ->orWhereHas('course', function (Builder $cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
                if (is_numeric($term)) {
                    $q->orWhere('rating', (int) $term)
                      ->orWhere('id', (int) $term);
                }
                $termLower = strtolower($term);
                if (in_array($termLower, ['pending', 'approved', 'rejected'])) {
                    $q->orWhere('status', $termLower);
                }
            });
        }
        $courseReviews = $courseReviewQuery->with(['user:id,name', 'course:id,title'])
            ->limit(min(10, $limit))
            ->get(['id', 'user_id', 'course_id', 'rating', 'comment', 'status', 'created_at']);

        foreach ($courseReviews as $review) {
            $allReviews->push([
                'id' => $review->id,
                'type' => 'course',
                'user_name' => $review->user?->name ?? 'Unknown',
                'target_name' => $review->course?->title ?? 'Unknown',
                'target_type' => 'Course',
                'course_title' => $review->course?->title ?? 'Unknown',
                'rating' => $review->rating,
                'comment' => \Str::limit($review->comment ?? '', 150),
                'status' => $review->status ?? 'approved',
                'created_at' => $review->created_at?->format('Y-m-d H:i:s'),
            ]);
        }

        return $allReviews->take($limit);
    }

    private function searchTransactions(array $terms, int $limit): Collection
    {
        $query = Transaction::query();
        foreach ($terms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('status', 'like', "%{$term}%")
                  ->orWhere('payment_method', 'like', "%{$term}%")
                  ->orWhere('payment_code', 'like', "%{$term}%")
                  ->orWhereHas('user', function (Builder $uq) use ($term) {
                      $uq->where('name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%");
                  })
                  ->orWhereHas('course', function (Builder $cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
                if (is_numeric($term)) {
                    $q->orWhere('id', (int) $term)
                      ->orWhere('amount', 'like', "%{$term}%");
                }
                $termLower = strtolower($term);
                $statusKeywords = ['pending', 'success', 'failed', 'expired', 'cancelled'];
                if (in_array($termLower, $statusKeywords)) {
                    $q->orWhere('status', $termLower);
                }
                $paymentKeywords = ['bank', 'transfer', 'bca', 'mandiri', 'bni', 'bri', 'gopay', 'ovo', 'dana'];
                if (in_array($termLower, $paymentKeywords)) {
                    $q->orWhere('payment_method', 'like', "%{$termLower}%");
                }
            });
        }
        return $query->with(['user:id,name,email', 'course:id,title'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get(['id', 'user_id', 'course_id', 'status', 'amount', 'payment_method', 'payment_code', 'created_at'])
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'user_name' => $transaction->user?->name ?? 'Unknown',
                    'user_email' => $transaction->user?->email,
                    'course_title' => $transaction->course?->title ?? 'Unknown',
                    'status' => ucfirst($transaction->status),
                    'amount' => $transaction->amount ?? 0,
                    'payment_method' => $transaction->payment_method ?? 'unknown',
                    'payment_code' => $transaction->payment_code,
                    'created_at' => $transaction->created_at?->format('Y-m-d H:i:s'),
                ];
            });
    }
}

