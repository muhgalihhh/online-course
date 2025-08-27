<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Chapter;
use App\Models\Institution;
use App\Models\Review;
use App\Models\CourseReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;

class SearchController extends Controller
{
    /**
     * Perform global search across all admin resources
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        try {
            // Validate the search query
            $request->validate([
                'query' => 'required|string|min:1|max:255',
                'filter' => 'nullable|string|in:all,users,courses,transactions,materials,chapters,categories,institutions,reviews'
            ]);

            $query = trim($request->input('query'));
            $filter = $request->input('filter', 'all');
            
            // Handle empty query
            if (empty($query)) {
                return response()->json([
                    'users' => [],
                    'courses' => [],
                    'course_materials' => [],
                    'transactions' => [],
                    'categories' => [],
                    'chapters' => [],
                    'institutions' => [],
                    'reviews' => []
                ]);
            }

            // Split query into search terms for better matching
            $searchTerms = array_filter(explode(' ', $query));
            
            // Initialize results array based on filter
            $results = [];
            
            // Search based on filter
            if ($filter === 'all' || $filter === 'users') {
                $results['users'] = $this->searchUsers($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'courses') {
                $results['courses'] = $this->searchCourses($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'materials') {
                $results['course_materials'] = $this->searchMaterials($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'transactions') {
                $results['transactions'] = $this->searchTransactions($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'categories') {
                $results['categories'] = $this->searchCategories($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'chapters') {
                $results['chapters'] = $this->searchChapters($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'institutions') {
                $results['institutions'] = $this->searchInstitutions($searchTerms);
            }
            
            if ($filter === 'all' || $filter === 'reviews') {
                $results['reviews'] = $this->searchReviews($searchTerms);
            }
            
            // Fill empty keys with empty arrays
            $allKeys = ['users', 'courses', 'course_materials', 'transactions', 'categories', 'chapters', 'institutions', 'reviews'];
            foreach ($allKeys as $key) {
                if (!isset($results[$key])) {
                    $results[$key] = [];
                }
            }

            return response()->json($results);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Invalid search query',
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Search error: ' . $e->getMessage(), [
                'query' => $request->input('query'),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Search failed',
                'message' => 'An error occurred while searching. Please try again.'
            ], 500);
        }
    }

    /**
     * Search users with comprehensive field coverage
     */
    private function searchUsers($searchTerms)
    {
        $query = User::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('role', 'like', "%{$term}%");
                
                // Search by ID if numeric
                if (is_numeric($term)) {
                    $q->orWhere('id', $term);
                }
            });
        }
        
        $users = $query->limit(15)->get(['id', 'name', 'email', 'role']);
        
        return $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role)
            ];
        });
    }

    /**
     * Search courses with all related fields
     */
    private function searchCourses($searchTerms)
    {
        $query = Course::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('level', 'like', "%{$term}%")
                  ->orWhere('status', 'like', "%{$term}%");
                
                // Search by related entities
                $q->orWhereHas('category', function(Builder $cq) use ($term) {
                    $cq->where('name', 'like', "%{$term}%");
                });
                
                $q->orWhereHas('institution', function(Builder $iq) use ($term) {
                    $iq->where('name', 'like', "%{$term}%");
                });
                
                // Search by price if numeric
                if (is_numeric($term)) {
                    $q->orWhere('price', 'like', "%{$term}%")
                      ->orWhere('id', $term);
                }
                
                // Check for pro/premium keywords
                $termLower = strtolower($term);
                if (in_array($termLower, ['pro', 'premium', 'berbayar'])) {
                    $q->orWhere('is_pro', true);
                } elseif (in_array($termLower, ['free', 'gratis'])) {
                    $q->orWhere('is_pro', false);
                }
                
                // Check for status keywords
                if (in_array($termLower, ['draft', 'published', 'archived'])) {
                    $q->orWhere('status', $termLower);
                }
            });
        }
        
        $courses = $query->withCount(['users', 'chapters', 'reviews'])
                         ->with(['category:id,name', 'institution:id,name'])
                         ->limit(15)
                         ->get(['id', 'title', 'description', 'price', 'is_pro', 'level', 'status', 'category_id', 'institution_id']);
        
        return $courses->map(function ($course) {
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
                'institution' => $course->institution?->name
            ];
        });
    }

    /**
     * Search categories with course count
     */
    private function searchCategories($searchTerms)
    {
        $query = Category::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('slug', 'like', "%{$term}%");
                
                if (is_numeric($term)) {
                    $q->orWhere('id', $term);
                }
            });
        }
        
        $categories = $query->withCount('courses')
                            ->limit(15)
                            ->get(['id', 'name', 'description', 'slug']);
        
        return $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => \Str::limit($category->description ?? '', 150),
                'slug' => $category->slug,
                'courses_count' => $category->courses_count
            ];
        });
    }

    /**
     * Search chapters with course information
     */
    private function searchChapters($searchTerms)
    {
        $query = Chapter::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%");
                
                // Search in related course
                $q->orWhereHas('course', function(Builder $cq) use ($term) {
                    $cq->where('title', 'like', "%{$term}%");
                });
                
                // Search by numeric fields
                if (is_numeric($term)) {
                    $q->orWhere('duration', 'like', "%{$term}%")
                      ->orWhere('order', $term)
                      ->orWhere('id', $term);
                }
                
                // Check for free keyword
                $termLower = strtolower($term);
                if (in_array($termLower, ['free', 'gratis'])) {
                    $q->orWhere('is_free', true);
                } elseif (in_array($termLower, ['locked', 'berbayar', 'premium'])) {
                    $q->orWhere('is_free', false);
                }
            });
        }
        
        $chapters = $query->with('course:id,title')
                          ->withCount('materials')
                          ->limit(15)
                          ->get(['id', 'title', 'description', 'course_id', 'duration', 'is_free', 'order']);
        
        return $chapters->map(function ($chapter) {
            return [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'description' => \Str::limit($chapter->description ?? '', 150),
                'course_title' => $chapter->course?->title ?? 'Unknown',
                'course_id' => $chapter->course_id,
                'duration' => $chapter->duration,
                'is_free' => $chapter->is_free,
                'order' => $chapter->order,
                'materials_count' => $chapter->materials_count
            ];
        });
    }

    /**
     * Search institutions
     */
    private function searchInstitutions($searchTerms)
    {
        $query = Institution::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('address', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('website', 'like', "%{$term}%");
                
                if (is_numeric($term)) {
                    $q->orWhere('id', $term);
                }
            });
        }
        
        $institutions = $query->withCount('courses')
                              ->limit(15)
                              ->get(['id', 'name', 'description', 'address', 'phone', 'email', 'website']);
        
        return $institutions->map(function ($institution) {
            return [
                'id' => $institution->id,
                'name' => $institution->name,
                'description' => \Str::limit($institution->description ?? '', 150),
                'address' => $institution->address,
                'phone' => $institution->phone,
                'email' => $institution->email,
                'website' => $institution->website,
                'courses_count' => $institution->courses_count
            ];
        });
    }

    /**
     * Search course materials
     */
    private function searchMaterials($searchTerms)
    {
        $query = CourseMaterial::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('type', 'like', "%{$term}%")
                  ->orWhere('file_path', 'like', "%{$term}%")
                  ->orWhere('youtube_url', 'like', "%{$term}%");
                
                // Search in related chapter and course
                $q->orWhereHas('chapter', function(Builder $cq) use ($term) {
                    $cq->where('title', 'like', "%{$term}%")
                       ->orWhereHas('course', function(Builder $ccq) use ($term) {
                           $ccq->where('title', 'like', "%{$term}%");
                       });
                });
                
                if (is_numeric($term)) {
                    $q->orWhere('id', $term)
                      ->orWhere('order', $term);
                }
                
                // Check for preview keyword
                $termLower = strtolower($term);
                if (in_array($termLower, ['preview', 'pratinjau'])) {
                    $q->orWhere('is_preview', true);
                }
                
                // Check for type keywords
                if (in_array($termLower, ['video', 'document', 'pdf', 'youtube'])) {
                    $q->orWhere('type', $termLower);
                }
            });
        }
        
        $materials = $query->with(['chapter:id,title,course_id', 'chapter.course:id,title'])
                           ->limit(15)
                           ->get(['id', 'title', 'type', 'chapter_id', 'file_path', 'youtube_url', 'is_preview', 'order']);
        
        return $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'type' => ucfirst($material->type ?? 'document'),
                'chapter_title' => $material->chapter?->title,
                'course_title' => $material->chapter?->course?->title,
                'is_preview' => $material->is_preview,
                'order' => $material->order
            ];
        });
    }

    /**
     * Search reviews (both Institution Reviews and Course Reviews)
     */
    private function searchReviews($searchTerms)
    {
        $allReviews = collect();
        
        // Search in Institution Review model
        $reviewQuery = Review::query();
        
        foreach ($searchTerms as $term) {
            $reviewQuery->where(function(Builder $q) use ($term) {
                $q->where('comment', 'like', "%{$term}%");
                
                // Search in related user
                $q->orWhereHas('user', function (Builder $uq) use ($term) {
                    $uq->where('name', 'like', "%{$term}%")
                       ->orWhere('email', 'like', "%{$term}%");
                });
                
                // Search in related institution
                $q->orWhereHas('institution', function (Builder $iq) use ($term) {
                    $iq->where('name', 'like', "%{$term}%");
                });
                
                // Search by rating if numeric
                if (is_numeric($term)) {
                    $q->orWhere('rating', $term)
                      ->orWhere('id', $term);
                }
                
                // Check for status keywords if the field exists
                $termLower = strtolower($term);
                if (in_array($termLower, ['pending', 'approved', 'rejected'])) {
                    $q->orWhere('status', $termLower);
                }
            });
        }
        
        $institutionReviews = $reviewQuery->with(['user:id,name', 'institution:id,name'])
                                          ->limit(10)
                                          ->get(['id', 'user_id', 'institution_id', 'rating', 'comment', 'status', 'created_at']);
        
        // Add institution reviews to collection
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
                'created_at' => $review->created_at?->format('Y-m-d H:i:s')
            ]);
        }
        
        // Search in CourseReview model
        $courseReviewQuery = CourseReview::query();
        
        foreach ($searchTerms as $term) {
            $courseReviewQuery->where(function(Builder $q) use ($term) {
                $q->where('comment', 'like', "%{$term}%");
                
                // Search in related user
                $q->orWhereHas('user', function (Builder $uq) use ($term) {
                    $uq->where('name', 'like', "%{$term}%")
                       ->orWhere('email', 'like', "%{$term}%");
                });
                
                // Search in related course
                $q->orWhereHas('course', function (Builder $cq) use ($term) {
                    $cq->where('title', 'like', "%{$term}%");
                });
                
                if (is_numeric($term)) {
                    $q->orWhere('rating', $term)
                      ->orWhere('id', $term);
                }
                
                // Check for status keywords
                $termLower = strtolower($term);
                if (in_array($termLower, ['pending', 'approved', 'rejected'])) {
                    $q->orWhere('status', $termLower);
                }
            });
        }
        
        $courseReviews = $courseReviewQuery->with(['user:id,name', 'course:id,title'])
                                           ->limit(10)
                                           ->get(['id', 'user_id', 'course_id', 'rating', 'comment', 'status', 'created_at']);
        
        // Add course reviews to collection
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
                'created_at' => $review->created_at?->format('Y-m-d H:i:s')
            ]);
        }
        
        // Return combined reviews, limited to 20 total
        return $allReviews->take(20);
    }

    /**
     * Search transactions with comprehensive filtering
     */
    private function searchTransactions($searchTerms)
    {
        $query = Transaction::query();
        
        foreach ($searchTerms as $term) {
            $query->where(function(Builder $q) use ($term) {
                // Search by transaction fields
                $q->where('status', 'like', "%{$term}%")
                  ->orWhere('payment_method', 'like', "%{$term}%")
                  ->orWhere('payment_code', 'like', "%{$term}%");
                
                // Search in related user
                $q->orWhereHas('user', function (Builder $uq) use ($term) {
                    $uq->where('name', 'like', "%{$term}%")
                       ->orWhere('email', 'like', "%{$term}%");
                });
                
                // Search in related course
                $q->orWhereHas('course', function (Builder $cq) use ($term) {
                    $cq->where('title', 'like', "%{$term}%");
                });
                
                // Search by numeric fields
                if (is_numeric($term)) {
                    $q->orWhere('id', $term)
                      ->orWhere('amount', 'like', "%{$term}%");
                }
                
                // Check for status keywords
                $termLower = strtolower($term);
                $statusKeywords = ['pending', 'success', 'failed', 'expired', 'cancelled'];
                if (in_array($termLower, $statusKeywords)) {
                    $q->orWhere('status', $termLower);
                }
                
                // Check for payment method keywords
                $paymentKeywords = ['bank', 'transfer', 'bca', 'mandiri', 'bni', 'bri', 'gopay', 'ovo', 'dana'];
                if (in_array($termLower, $paymentKeywords)) {
                    $q->orWhere('payment_method', 'like', "%{$termLower}%");
                }
            });
        }
        
        $transactions = $query->with(['user:id,name,email', 'course:id,title'])
                              ->orderBy('created_at', 'desc')
                              ->limit(15)
                              ->get(['id', 'user_id', 'course_id', 'status', 'amount', 'payment_method', 'payment_code', 'created_at']);
        
        return $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'user_name' => $transaction->user?->name ?? 'Unknown',
                'user_email' => $transaction->user?->email,
                'course_title' => $transaction->course?->title ?? 'Unknown',
                'status' => ucfirst($transaction->status),
                'amount' => $transaction->amount ?? 0,
                'payment_method' => $transaction->payment_method ?? 'unknown',
                'payment_code' => $transaction->payment_code,
                'created_at' => $transaction->created_at?->format('Y-m-d H:i:s')
            ];
        });
    }
}