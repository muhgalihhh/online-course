<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Menampilkan daftar semua kategori dengan paginasi.
     */
    public function index(Request $request): Response
    {
        $query = Category::withCount('courses');

        // Filter by search (name or description)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by course count range
        if ($request->filled('course_count_min')) {
            $query->has('courses', '>=', $request->get('course_count_min'));
        }
        
        if ($request->filled('course_count_max')) {
            $query->has('courses', '<=', $request->get('course_count_max'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'courses_count') {
            $query->orderBy('courses_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $categories = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'course_count_min', 'course_count_max', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Tampilkan form untuk membuat kategori baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    /**
     * Simpan kategori baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        Category::create($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit kategori.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update data kategori di database.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        // Generate new slug if name changed
        if ($validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Hapus kategori dari database.
     */
    public function destroy(Category $category)
    {
        // Cek apakah kategori masih digunakan oleh kursus
        if ($category->courses()->count() > 0) {
            return redirect()->route('admin.categories.index')
                ->with('error', 'Kategori tidak dapat dihapus karena masih digunakan oleh kursus.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
    
    /**
     * Tampilkan detail kategori.
     */
    public function show(Category $category): Response
    {
        return Inertia::render('admin/categories/show', [
            'category' => $category->load(['courses' => function($query) {
                $query->withCount('chapters');
            }]),
        ]);
    }
}