<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Models\Transaction;
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

        // Apply user type filter (based on existing roles: 'admin' | 'user')
        if ($request->filled('userType')) {
            $userType = $request->get('userType');
            if (in_array($userType, ['admin', 'user'], true)) {
                $userQuery->where('role', $userType);
                $recentUsersQuery->where('role', $userType);
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Get filtered data
        $totalUsers = $userQuery->count();
        $totalCourses = $courseQuery->count();
        $allowedSortColumns = ['created_at', 'updated_at', 'name', 'email'];
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
        $recentUsers = $recentUsersQuery->orderBy($sortBy, $sortOrder)->take(5)->get(['id', 'name', 'email', 'role', 'created_at']);

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
        $userStatsQuery = User::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as user_count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month');
        
        $courseStatsQuery = Course::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as course_count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month');

        $revenueStatsQuery = Transaction::query()
            ->whereIn('status', ['settlement', 'completed'])
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as revenue, COUNT(*) as transactions_count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month');

        if ($dateFrom) {
            $userStatsQuery->where('created_at', '>=', $dateFrom);
            $courseStatsQuery->where('created_at', '>=', $dateFrom);
            $revenueStatsQuery->where('created_at', '>=', $dateFrom);
        }

        $userStats = $userStatsQuery->get();
        $courseStats = $courseStatsQuery->get();
        $revenueStats = $revenueStatsQuery->get();

        // Totals
        $totalRevenue = Transaction::whereIn('status', ['settlement', 'completed'])
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->sum('amount');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCourses' => $totalCourses,
                'totalRevenue' => (int) $totalRevenue,
            ],
            'recentUsers' => $recentUsers,
            'userStats' => $userStats,
            'courseStats' => $courseStats,
            'revenueStats' => $revenueStats,
            'filters' => $request->only(['search', 'period', 'metric', 'userType', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Export dashboard aggregated data to CSV.
     */
    public function export(Request $request)
    {
        $period = $request->get('period', '30d');
        $dateFrom = null;
        switch ($period) {
            case '7d':
                $dateFrom = now()->subDays(7); break;
            case '30d':
                $dateFrom = now()->subDays(30); break;
            case '90d':
                $dateFrom = now()->subDays(90); break;
            case '1y':
                $dateFrom = now()->subYear(); break;
            default:
                // all
                break;
        }

        $userStats = User::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as user_count')
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        $courseStats = Course::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as course_count')
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        $revenueStats = Transaction::whereIn('status', ['settlement', 'completed'])
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as revenue, COUNT(*) as transactions_count')
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        $rows = [];
        $header = ['year', 'month', 'users', 'courses', 'revenue', 'transactions'];

        // Merge by year-month keys
        $map = [];
        foreach ($userStats as $row) {
            $key = $row->year.'-'.$row->month;
            $map[$key] = $map[$key] ?? ['year' => $row->year, 'month' => $row->month, 'users' => 0, 'courses' => 0, 'revenue' => 0, 'transactions' => 0];
            $map[$key]['users'] = (int) $row->user_count;
        }
        foreach ($courseStats as $row) {
            $key = $row->year.'-'.$row->month;
            $map[$key] = $map[$key] ?? ['year' => $row->year, 'month' => $row->month, 'users' => 0, 'courses' => 0, 'revenue' => 0, 'transactions' => 0];
            $map[$key]['courses'] = (int) $row->course_count;
        }
        foreach ($revenueStats as $row) {
            $key = $row->year.'-'.$row->month;
            $map[$key] = $map[$key] ?? ['year' => $row->year, 'month' => $row->month, 'users' => 0, 'courses' => 0, 'revenue' => 0, 'transactions' => 0];
            $map[$key]['revenue'] = (int) $row->revenue;
            $map[$key]['transactions'] = (int) $row->transactions_count;
        }
        ksort($map);
        foreach ($map as $row) {
            $rows[] = [$row['year'], $row['month'], $row['users'], $row['courses'], $row['revenue'], $row['transactions']];
        }

        $filename = 'dashboard_export_'.now()->format('Ymd_His').'.csv';
        $callback = function () use ($header, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $header);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
