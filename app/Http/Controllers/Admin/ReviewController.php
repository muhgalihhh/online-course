<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        // Add your reviews logic here
        // For now, we'll just render the page
        return Inertia::render('admin/reviews');
    }

    public function updateStatus(Request $request, $reviewId)
    {
        // Add your review status update logic here
        return response()->json(['message' => 'Review status updated successfully']);
    }

    public function destroy($reviewId)
    {
        // Add your review deletion logic here
        return response()->json(['message' => 'Review deleted successfully']);
    }
}