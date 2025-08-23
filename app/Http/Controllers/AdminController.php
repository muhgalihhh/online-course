<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $userCount = User::where('role', 'user')->count();
        $adminCount = User::where('role', 'admin')->count();
        $totalUsers = User::count();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => $userCount,
                'admins' => $adminCount,
                'total' => $totalUsers,
            ]
        ]);
    }

    public function users()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/users', [
            'users' => $users
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,user'
        ]);

        // Prevent admin from changing their own role
        if ($user->id === auth()->id()) {
            return back()->withErrors(['role' => 'You cannot change your own role.']);
        }

        $user->update(['role' => $request->role]);

        return back()->with('success', 'User role updated successfully.');
    }
}