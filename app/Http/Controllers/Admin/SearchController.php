<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Material;
use App\Models\Transaction;
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
            'materials' => [],
            'transactions' => []
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

        // Search materials
        $materials = Material::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'title', 'description', 'type']);
        
        $results['materials'] = $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'description' => \Str::limit($material->description, 100),
                'type' => ucfirst($material->type)
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