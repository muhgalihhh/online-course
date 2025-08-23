<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Menampilkan halaman dashboard admin beserta data statistik.
     */
    public function index(): Response
    {
        // Ambil data statistik sederhana dari database
        $totalUsers = User::count();
        $totalCourses = Course::count();
        $recentUsers = User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);

        // Ambil data statistik untuk chart (misal: jumlah pengguna per bulan)
        $userStats = User::selectRaw('MONTH(created_at) as month, COUNT(*) as user_count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Ambil data statistik untuk kursus (misal: jumlah kursus per bulan)
        $courseStats = Course::selectRaw('MONTH(created_at) as month, COUNT(*) as course_count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCourses' => $totalCourses,
            ],
            'recentUsers' => $recentUsers,
            'userStats' => $userStats,
            'courseStats' => $courseStats,
        ]);
    }
}
