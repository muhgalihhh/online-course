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
        // Anda bisa menambahkan data lain seperti total institusi, transaksi, dll.

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCourses' => $totalCourses,
            ],
        ]);
    }
}