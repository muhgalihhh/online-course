<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
  /**
   * Display FAQ page for guests
   */
  public function index(Request $request)
  {
    $query = Faq::active()->ordered();

    // Filter by category if requested
    if ($request->has('category') && $request->category) {
      $query->byCategory($request->category);
    }

    // Search functionality
    if ($request->has('search') && $request->search) {
      $searchTerm = $request->search;
      $query->where(function ($q) use ($searchTerm) {
        $q->where('question', 'like', '%' . $searchTerm . '%')
          ->orWhere('answer', 'like', '%' . $searchTerm . '%');
      });
    }

    $faqs = $query->get()->map(function ($faq) {
      return [
        'id' => $faq->id,
        'question' => $faq->question,
        'answer' => $faq->answer,
        'category' => $faq->category,
        'category_name' => $faq->category_name,
        'sort_order' => $faq->sort_order,
      ];
    });

    // Group FAQs by category
    $faqsByCategory = $faqs->groupBy('category');

    return Inertia::render('faq/index', [
      'faqs' => $faqs,
      'faqsByCategory' => $faqsByCategory,
      'categories' => Faq::getCategories(),
      'filters' => [
        'search' => $request->search,
        'category' => $request->category,
      ],
    ]);
  }
}
