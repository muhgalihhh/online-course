<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        // Filters
        $period = $request->get('period', '30d');
        $courseSearch = $request->get('search');
        $dateFrom = null;
        switch ($period) {
            case '7d': $dateFrom = now()->subDays(7); break;
            case '30d': $dateFrom = now()->subDays(30); break;
            case '90d': $dateFrom = now()->subDays(90); break;
            case '1y': $dateFrom = now()->subYear(); break;
            default: break; // all
        }

        // Monthly user growth
        $userStats = User::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as users')
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        // Monthly revenue and transactions
        $revenueStats = Transaction::whereIn('status', ['settlement', 'completed'])
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as revenue, COUNT(*) as transactions_count')
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        // Top courses by enrollments with average rating
        $topCourses = Course::query()
            ->withCount(['users as enrollments_count' => function ($q) use ($dateFrom) {
                if ($dateFrom) {
                    $q->where('enrollments.created_at', '>=', $dateFrom);
                }
            }])
            ->withAvg('courseReviews as avg_rating', 'rating')
            ->when($courseSearch, function ($q) use ($courseSearch) {
                $q->where('title', 'like', "%{$courseSearch}%");
            })
            ->orderByDesc('enrollments_count')
            ->limit(10)
            ->get(['id', 'title']);

        // Distribution of courses by type (pro vs free)
        $proCourses = Course::when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))->where('is_pro', true)->count();
        $freeCourses = Course::when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))->where('is_pro', false)->count();

        $totals = [
            'totalRevenue' => (int) Transaction::whereIn('status', ['settlement', 'completed'])
                ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
                ->sum('amount'),
            'totalUsers' => User::when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))->count(),
            'totalCourses' => Course::when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))->count(),
            'totalTransactions' => Transaction::when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))->count(),
        ];

        return Inertia::render('admin/analytics', [
            'userStats' => $userStats,
            'revenueStats' => $revenueStats,
            'topCourses' => $topCourses,
            'courseTypeDistribution' => [
                ['name' => 'Pro', 'value' => (int) $proCourses],
                ['name' => 'Free', 'value' => (int) $freeCourses],
            ],
            'totals' => $totals,
            'filters' => $request->only(['period', 'search', 'date_from', 'date_to']),
        ]);
    }

    public function export(Request $request)
    {
        $period = $request->get('period', '30d');
        $dateFrom = null;
        switch ($period) {
            case '7d': $dateFrom = now()->subDays(7); break;
            case '30d': $dateFrom = now()->subDays(30); break;
            case '90d': $dateFrom = now()->subDays(90); break;
            case '1y': $dateFrom = now()->subYear(); break;
            default: break;
        }

        $revenueStats = Transaction::whereIn('status', ['settlement', 'completed'])
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as revenue, COUNT(*) as transactions_count')
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        $header = ['year', 'month', 'revenue', 'transactions'];
        $rows = $revenueStats->map(fn ($r) => [$r->year, $r->month, (int) $r->revenue, (int) $r->transactions_count])->all();

        $filename = 'analytics_revenue_'.now()->format('Ymd_His').'.csv';
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
