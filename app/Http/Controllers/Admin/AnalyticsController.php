<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Add your analytics logic here
        // For now, we'll just render the page
        return Inertia::render('admin/analytics');
    }
}