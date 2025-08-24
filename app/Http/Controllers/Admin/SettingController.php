<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        // Add your settings logic here
        // For now, we'll just render the page
        return Inertia::render('admin/settings');
    }

    public function update(Request $request)
    {
        // Add your settings update logic here
        return response()->json(['message' => 'Settings updated successfully']);
    }
}