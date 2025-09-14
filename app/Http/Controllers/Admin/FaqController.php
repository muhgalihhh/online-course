<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    $query = Faq::query();

    // Search functionality
    if ($request->has('search') && $request->search) {
      $searchTerm = $request->search;
      $query->where(function ($q) use ($searchTerm) {
        $q->where('question', 'like', '%' . $searchTerm . '%')
          ->orWhere('answer', 'like', '%' . $searchTerm . '%');
      });
    }

    // Filter by category
    if ($request->has('category') && $request->category) {
      $query->byCategory($request->category);
    }

    // Filter by status
    if ($request->has('status') && $request->status !== '') {
      $query->where('is_active', $request->status === 'active');
    }

    $faqs = $query->ordered()->paginate(15)->withQueryString();

    return Inertia::render('admin/faqs/index', [
      'faqs' => $faqs,
      'categories' => Faq::getCategories(),
      'filters' => [
        'search' => $request->search,
        'category' => $request->category,
        'status' => $request->status,
      ],
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    return Inertia::render('admin/faqs/create', [
      'categories' => Faq::getCategories(),
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'question' => 'required|string|max:255',
      'answer' => 'required|string',
      'category' => 'required|string|in:' . implode(',', array_keys(Faq::getCategories())),
      'sort_order' => 'nullable|integer|min:0',
      'is_active' => 'boolean',
    ]);

    $validated['sort_order'] = $validated['sort_order'] ?? 0;
    $validated['is_active'] = $validated['is_active'] ?? true;

    Faq::create($validated);

    return redirect()->route('admin.faqs.index')
      ->with('message', 'FAQ berhasil ditambahkan.');
  }

  /**
   * Display the specified resource.
   */
  public function show(Faq $faq)
  {
    return Inertia::render('admin/faqs/show', [
      'faq' => $faq,
    ]);
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(Faq $faq)
  {
    return Inertia::render('admin/faqs/edit', [
      'faq' => $faq,
      'categories' => Faq::getCategories(),
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Faq $faq)
  {
    $validated = $request->validate([
      'question' => 'required|string|max:255',
      'answer' => 'required|string',
      'category' => 'required|string|in:' . implode(',', array_keys(Faq::getCategories())),
      'sort_order' => 'nullable|integer|min:0',
      'is_active' => 'boolean',
    ]);

    $validated['sort_order'] = $validated['sort_order'] ?? $faq->sort_order;
    $validated['is_active'] = $validated['is_active'] ?? $faq->is_active;

    $faq->update($validated);

    return redirect()->route('admin.faqs.index')
      ->with('message', 'FAQ berhasil diperbarui.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Faq $faq)
  {
    $faq->delete();

    return redirect()->route('admin.faqs.index')
      ->with('message', 'FAQ berhasil dihapus.');
  }

  /**
   * Toggle FAQ status.
   */
  public function toggleStatus(Faq $faq)
  {
    $faq->update([
      'is_active' => !$faq->is_active,
    ]);

    $status = $faq->is_active ? 'diaktifkan' : 'dinonaktifkan';

    return redirect()->back()
      ->with('message', "FAQ berhasil {$status}.");
  }

  /**
   * Bulk actions for FAQs.
   */
  public function bulkAction(Request $request)
  {
    $request->validate([
      'action' => 'required|in:activate,deactivate,delete',
      'faq_ids' => 'required|array',
      'faq_ids.*' => 'exists:faqs,id',
    ]);

    $faqs = Faq::whereIn('id', $request->faq_ids);

    switch ($request->action) {
      case 'activate':
        $faqs->update(['is_active' => true]);
        $message = 'FAQ yang dipilih berhasil diaktifkan.';
        break;
      case 'deactivate':
        $faqs->update(['is_active' => false]);
        $message = 'FAQ yang dipilih berhasil dinonaktifkan.';
        break;
      case 'delete':
        $faqs->delete();
        $message = 'FAQ yang dipilih berhasil dihapus.';
        break;
    }

    return redirect()->back()->with('message', $message);
  }
}
