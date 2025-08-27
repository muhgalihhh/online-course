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
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:255'
        ]);

        $query = $request->input('query');
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

        // Search users
        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'email', 'role']);
        
        $results['users'] = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role)
            ];
        });

        // Search courses
        $courses = Course::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->withCount('students')
            ->limit(5)
            ->get(['id', 'title', 'description']);
        
        $results['courses'] = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => \Str::limit($course->description, 100),
                'students_count' => $course->students_count
            ];
        });

        // Search categories
        $categories = Category::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->withCount('courses')
            ->limit(5)
            ->get(['id', 'name', 'description']);
        
        $results['categories'] = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => \Str::limit($category->description ?? '', 100),
                'courses_count' => $category->courses_count
            ];
        });

        // Search chapters
        $chapters = Chapter::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->with('course:id,title')
            ->limit(5)
            ->get(['id', 'title', 'description', 'course_id']);
        
        $results['chapters'] = $chapters->map(function ($chapter) {
            return [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'description' => \Str::limit($chapter->description ?? '', 100),
                'course_title' => $chapter->course->title ?? 'Unknown'
            ];
        });

        // Search institutions
        $institutions = Institution::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('address', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'description', 'address']);
        
        $results['institutions'] = $institutions->map(function ($institution) {
            return [
                'id' => $institution->id,
                'name' => $institution->name,
                'description' => \Str::limit($institution->description ?? '', 100),
                'address' => \Str::limit($institution->address ?? '', 50)
            ];
        });

        // Search course materials
        $materials = CourseMaterial::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'title', 'description', 'type']);
        
        $results['course_materials'] = $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'description' => \Str::limit($material->description ?? '', 100),
                'type' => ucfirst($material->type ?? 'document')
            ];
        });

        // Search reviews
        $reviews = Review::where('comment', 'like', "%{$query}%")
            ->orWhereHas('user', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orWhereHas('course', function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%");
            })
            ->with(['user:id,name', 'course:id,title'])
            ->limit(5)
            ->get(['id', 'user_id', 'course_id', 'rating', 'comment']);
        
        $results['reviews'] = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'user_name' => $review->user->name ?? 'Unknown',
                'course_title' => $review->course->title ?? 'Unknown',
                'rating' => $review->rating,
                'comment' => \Str::limit($review->comment ?? '', 100)
            ];
        });

        // Search transactions
        $transactions = Transaction::where('id', 'like', "%{$query}%")
            ->orWhereHas('user', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orWhereHas('course', function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%");
            })
            ->with(['user:id,name', 'course:id,title'])
            ->limit(5)
            ->get(['id', 'user_id', 'course_id', 'status']);
        
        $results['transactions'] = $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'user_name' => $transaction->user->name ?? 'Unknown',
                'course_title' => $transaction->course->title ?? 'Unknown',
                'status' => ucfirst($transaction->status)
            ];
        });

        return response()->json($results);
    }
}