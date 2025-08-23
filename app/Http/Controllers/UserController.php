<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();

        return Inertia::render('user/dashboard', [
            'user' => $user->only(['name', 'email', 'role', 'created_at'])
        ]);
    }

    public function profile()
    {
        return Inertia::render('User/Profile', [
            'user' => auth()->user()->only(['name', 'email', 'created_at'])
        ]);
    }
}