<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Menampilkan daftar semua pengguna dengan paginasi.
     */
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::latest()->paginate(10)->withQueryString(),
        ]);
    }

    /**
     * (Opsional) Tampilkan form untuk membuat user baru.
     * Anda akan membutuhkan halaman React: admin/users/create.tsx
     */
    public function create()
    {
        // return Inertia::render('admin/users/create');
    }

    /**
     * (Opsional) Simpan user baru ke database.
     */
    public function store(Request $request)
    {
        // Logika validasi dan penyimpanan
    }

    /**
     * (Opsional) Tampilkan form untuk mengedit user.
     * Anda akan membutuhkan halaman React: admin/users/edit.tsx
     */
    public function edit(User $user)
    {
        // return Inertia::render('admin/users/edit', ['user' => $user]);
    }

    /**
     * (Opsional) Update data user di database.
     */
    public function update(Request $request, User $user)
    {
        // Logika validasi dan update
    }

    /**
     * (Opsional) Hapus user dari database.
     */
    public function destroy(User $user)
    {
        // Logika penghapusan
    }
}