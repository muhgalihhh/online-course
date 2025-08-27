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

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:255'
        ]);

        $query = trim($request->input('query'));
        $searchTerms = explode(' ', $query);
        
        $results = [
            'users' => [],
            'courses' => [],
            'course_materials' => [],
            'transactions' => [],
            'categories' => [],
            'chapters' => [],
            'institutions' => [],
            'reviews' => []
        ];

        // Search users - improved search with multiple fields
        $usersQuery = User::query();
        foreach ($searchTerms as $term) {
            $usersQuery->where(function($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('role', 'like', "%{$term}%");
            });
        }
        $users = $usersQuery->limit(10)->get(['id', 'name', 'email', 'role']);
        
        $results['users'] = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role)
            ];
        });

        // Search courses - improved with price and is_pro fields
        $coursesQuery = Course::query();
        foreach ($searchTerms as $term) {
            $coursesQuery->where(function($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhereHas('category', function($cq) use ($term) {
                      $cq->where('name', 'like', "%{$term}%");
                  })
                  ->orWhereHas('institution', function($iq) use ($term) {
                      $iq->where('name', 'like', "%{$term}%");
                  });
                
                // Check if search term is a number for price search
                if (is_numeric($term)) {
                    $q->orWhere('price', 'like', "%{$term}%");
                }
                
                // Check for "pro" keyword
                if (strtolower($term) == 'pro' || strtolower($term) == 'premium') {
                    $q->orWhere('is_pro', true);
                }
            });
        }
        $courses = $coursesQuery->withCount('students')->limit(10)->get(['id', 'title', 'description', 'price', 'is_pro']);
        
        $results['courses'] = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => \Str::limit($course->description, 100),
                'students_count' => $course->students_count,
                'price' => $course->price,
                'is_pro' => $course->is_pro
            ];
        });

        // Search categories - improved search
        $categoriesQuery = Category::query();
        foreach ($searchTerms as $term) {
            $categoriesQuery->where(function($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%");
            });
        }
        $categories = $categoriesQuery->withCount('courses')->limit(10)->get(['id', 'name', 'description']);
        
        $results['categories'] = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => \Str::limit($category->description ?? '', 100),
                'courses_count' => $category->courses_count
            ];
        });

        // Search chapters
        $chaptersQuery = Chapter::query();
        foreach ($searchTerms as $term) {
            $chaptersQuery->where(function($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhereHas('course', function($cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
                
                // Check for duration if numeric
                if (is_numeric($term)) {
                    $q->orWhere('duration', 'like', "%{$term}%");
                }
                
                // Check for "free" keyword
                if (strtolower($term) == 'free' || strtolower($term) == 'gratis') {
                    $q->orWhere('is_free', true);
                }
            });
        }
        $chapters = $chaptersQuery->with('course:id,title')->limit(10)->get(['id', 'title', 'description', 'course_id', 'duration', 'is_free']);
        
        $results['chapters'] = $chapters->map(function ($chapter) {
            return [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'description' => \Str::limit($chapter->description ?? '', 100),
                'course_title' => $chapter->course->title ?? 'Unknown',
                'course_id' => $chapter->course_id
            ];
        });

        // Search institutions - improved search
        $institutionsQuery = Institution::query();
        foreach ($searchTerms as $term) {
            $institutionsQuery->where(function($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('address', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('website', 'like', "%{$term}%");
            });
        }
        $institutions = $institutionsQuery->limit(10)->get(['id', 'name', 'description', 'address', 'phone', 'email']);
        
        $results['institutions'] = $institutions->map(function ($institution) {
            return [
                'id' => $institution->id,
                'name' => $institution->name,
                'description' => \Str::limit($institution->description ?? '', 100),
                'address' => \Str::limit($institution->address ?? '', 50)
            ];
        });

        // Search course materials - improved with file_path
        $materialsQuery = CourseMaterial::query();
        foreach ($searchTerms as $term) {
            $materialsQuery->where(function($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('type', 'like', "%{$term}%")
                  ->orWhere('file_path', 'like', "%{$term}%")
                  ->orWhereHas('chapter', function($cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
            });
        }
        $materials = $materialsQuery->with('chapter:id,title')->limit(10)->get(['id', 'title', 'description', 'type', 'chapter_id']);
        
        $results['course_materials'] = $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'description' => \Str::limit($material->description ?? '', 100),
                'type' => ucfirst($material->type ?? 'document'),
                'chapter_title' => $material->chapter->title ?? null
            ];
        });

        // Search reviews (both Review and CourseReview)
        $reviewsQuery = Review::query();
        foreach ($searchTerms as $term) {
            $reviewsQuery->where(function($q) use ($term) {
                $q->where('comment', 'like', "%{$term}%")
                  ->orWhereHas('user', function ($uq) use ($term) {
                      $uq->where('name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%");
                  })
                  ->orWhereHas('course', function ($cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
                
                // Check if search term is a number for rating search
                if (is_numeric($term)) {
                    $q->orWhere('rating', $term);
                }
            });
        }
        $reviews = $reviewsQuery->with(['user:id,name', 'course:id,title'])->limit(5)->get(['id', 'user_id', 'course_id', 'rating', 'comment', 'status']);
        
        // Also search CourseReviews
        $courseReviewsQuery = CourseReview::query();
        foreach ($searchTerms as $term) {
            $courseReviewsQuery->where(function($q) use ($term) {
                $q->where('comment', 'like', "%{$term}%")
                  ->orWhereHas('user', function ($uq) use ($term) {
                      $uq->where('name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%");
                  })
                  ->orWhereHas('course', function ($cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
                
                if (is_numeric($term)) {
                    $q->orWhere('rating', $term);
                }
            });
        }
        $courseReviews = $courseReviewsQuery->with(['user:id,name', 'course:id,title'])->limit(5)->get(['id', 'user_id', 'course_id', 'rating', 'comment', 'status']);
        
        // Combine both review types
        $allReviews = $reviews->concat($courseReviews)->take(10);
        
        $results['reviews'] = $allReviews->map(function ($review) {
            return [
                'id' => $review->id,
                'user_name' => $review->user->name ?? 'Unknown',
                'course_title' => $review->course->title ?? 'Unknown',
                'rating' => $review->rating,
                'comment' => \Str::limit($review->comment ?? '', 100),
                'status' => $review->status ?? 'pending'
            ];
        });

        // Search transactions - improved with payment_method and amount
        $transactionsQuery = Transaction::query();
        foreach ($searchTerms as $term) {
            $transactionsQuery->where(function($q) use ($term) {
                // Search by ID (if numeric)
                if (is_numeric($term)) {
                    $q->where('id', $term)
                      ->orWhere('amount', 'like', "%{$term}%");
                }
                
                $q->orWhere('status', 'like', "%{$term}%")
                  ->orWhere('payment_method', 'like', "%{$term}%")
                  ->orWhereHas('user', function ($uq) use ($term) {
                      $uq->where('name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%");
                  })
                  ->orWhereHas('course', function ($cq) use ($term) {
                      $cq->where('title', 'like', "%{$term}%");
                  });
            });
        }
        $transactions = $transactionsQuery->with(['user:id,name', 'course:id,title'])->limit(10)->get(['id', 'user_id', 'course_id', 'status', 'amount', 'payment_method']);
        
        $results['transactions'] = $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'user_name' => $transaction->user->name ?? 'Unknown',
                'course_title' => $transaction->course->title ?? 'Unknown',
                'status' => ucfirst($transaction->status),
                'amount' => $transaction->amount ?? 0,
                'payment_method' => $transaction->payment_method ?? 'unknown'
            ];
        });

        return response()->json($results);
    }
}