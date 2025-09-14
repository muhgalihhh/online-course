<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccommodationController extends Controller
{
  /**
   * Display all accommodations for guests
   */
  public function index(Request $request)
  {
    $query = Accommodation::active();

    // Search functionality
    if ($request->has('search') && $request->search) {
      $searchTerm = $request->search;
      $query->where(function ($q) use ($searchTerm) {
        $q->where('name', 'like', '%' . $searchTerm . '%')
          ->orWhere('description', 'like', '%' . $searchTerm . '%');
      });
    }

    // Sort functionality
    $sortBy = $request->get('sort', 'name');
    $sortOrder = $request->get('order', 'asc');

    switch ($sortBy) {
      case 'price':
        $query->orderBy('price_per_night', $sortOrder);
        break;
      case 'name':
      default:
        $query->orderBy('name', $sortOrder);
        break;
    }

    $accommodations = $query->paginate(12)->through(function ($accommodation) {
      return [
        'id' => $accommodation->id,
        'name' => $accommodation->name,
        'description' => $accommodation->description,
        'price_per_night' => $accommodation->price_per_night,
        'formatted_price' => $accommodation->formatted_price,
        'image_url' => $accommodation->image_url,
        'whatsapp_booking_url' => $accommodation->whatsapp_booking_url,
        'is_active' => $accommodation->is_active,
      ];
    });

    $institution = Institution::first();

    return Inertia::render('accommodations/index', [
      'accommodations' => $accommodations,
      'institution' => $institution,
      'filters' => [
        'search' => $request->search,
        'sort' => $sortBy,
        'order' => $sortOrder,
      ],
    ]);
  }

  /**
   * Display accommodation details
   */
  public function show(Accommodation $accommodation)
  {
    // Only show active accommodations
    if (!$accommodation->is_active) {
      abort(404);
    }

    $institution = Institution::first();

    return Inertia::render('accommodations/show', [
      'accommodation' => [
        'id' => $accommodation->id,
        'name' => $accommodation->name,
        'description' => $accommodation->description,
        'price_per_night' => $accommodation->price_per_night,
        'formatted_price' => $accommodation->formatted_price,
        'image_url' => $accommodation->image_url,
        'whatsapp_booking_url' => $accommodation->whatsapp_booking_url,
        'is_active' => $accommodation->is_active,
      ],
      'institution' => $institution,
    ]);
  }
}
