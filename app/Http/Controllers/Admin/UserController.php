<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
     * Tampilkan form untuk membuat user baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    /**
     * Simpan user baru ke database.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        
        // Hash password
        $data['password'] = Hash::make($data['password']);
        
        // Handle profile photo upload
        if ($request->hasFile('profile_photo_path')) {
            $photoPath = $request->file('profile_photo_path')->store('users', 'public');
            $data['profile_photo_path'] = $photoPath;
        }

        User::create($data);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update data user di database.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        
        // Handle password update
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        
        // Handle profile photo upload
        if ($request->hasFile('profile_photo_path')) {
            // Hapus foto lama jika ada
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            
            // Simpan foto baru
            $photoPath = $request->file('profile_photo_path')->store('users', 'public');
            $data['profile_photo_path'] = $photoPath;
        }

        $user->update($data);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Hapus user dari database.
     */
    public function destroy(User $user)
    {
        // Cek apakah user yang akan dihapus adalah user yang sedang login
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        // Hapus foto profil jika ada
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil dihapus.');
    }
    
    /**
     * Tampilkan detail user.
     */
    public function show(User $user): Response
    {
        return Inertia::render('admin/users/show', [
            'user' => $user->load(['courses', 'transactions']),
        ]);
    }
}