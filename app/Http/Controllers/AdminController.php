<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Menampilkan halaman dashboard admin beserta data statistik.
     */
    public function index(Request $request): Response
    {
        // Base queries
        $userQuery = User::query();
        $courseQuery = Course::query();
        $recentUsersQuery = User::query();

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $userQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
            
            $courseQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
            
            $recentUsersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $userQuery->whereDate('created_at', '>=', $request->get('date_from'));
            $courseQuery->whereDate('created_at', '>=', $request->get('date_from'));
            $recentUsersQuery->whereDate('created_at', '>=', $request->get('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $userQuery->whereDate('created_at', '<=', $request->get('date_to'));
            $courseQuery->whereDate('created_at', '<=', $request->get('date_to'));
            $recentUsersQuery->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Apply user type filter
        if ($request->filled('userType')) {
            $userType = $request->get('userType');
            if ($userType === 'premium') {
                $userQuery->where('role', 'premium');
                $recentUsersQuery->where('role', 'premium');
            } elseif ($userType === 'regular') {
                $userQuery->where('role', 'user');
                $recentUsersQuery->where('role', 'user');
            } elseif ($userType === 'enterprise') {
                $userQuery->where('role', 'enterprise');
                $recentUsersQuery->where('role', 'enterprise');
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Get filtered data
        $totalUsers = $userQuery->count();
        $totalCourses = $courseQuery->count();
        $recentUsers = $recentUsersQuery->latest()->take(5)->get(['id', 'name', 'email', 'role', 'created_at']);

        // Apply time period filter for stats
        $period = $request->get('period', '30d');
        $dateFrom = null;
        
        switch ($period) {
            case '7d':
                $dateFrom = now()->subDays(7);
                break;
            case '30d':
                $dateFrom = now()->subDays(30);
                break;
            case '90d':
                $dateFrom = now()->subDays(90);
                break;
            case '1y':
                $dateFrom = now()->subYear();
                break;
            default:
                // 'all' - no date filter
                break;
        }

        // Build stats queries with period filter
        $userStatsQuery = User::selectRaw('MONTH(created_at) as month, COUNT(*) as user_count')
            ->groupBy('month')
            ->orderBy('month');
        
        $courseStatsQuery = Course::selectRaw('MONTH(created_at) as month, COUNT(*) as course_count')
            ->groupBy('month')
            ->orderBy('month');

        if ($dateFrom) {
            $userStatsQuery->where('created_at', '>=', $dateFrom);
            $courseStatsQuery->where('created_at', '>=', $dateFrom);
        }

        $userStats = $userStatsQuery->get();
        $courseStats = $courseStatsQuery->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCourses' => $totalCourses,
            ],
            'recentUsers' => $recentUsers,
            'userStats' => $userStats,
            'courseStats' => $courseStats,
            'filters' => $request->only(['search', 'period', 'metric', 'userType', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }
}
