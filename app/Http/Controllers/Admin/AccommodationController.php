<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AccommodationController extends Controller
{
    /**
     * Menampilkan daftar semua akomodasi dengan paginasi.
     */
    public function index(Request $request): Response
    {
        $query = Accommodation::query();

        // Filter by search (name or description)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($request->filled('is_active')) {
            if (in_array($request->get('is_active'), ['true', 'false'], true)) {
                $query->where('is_active', $request->get('is_active') === 'true');
            }
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('price_per_night', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price_per_night', '<=', $request->get('max_price'));
        }

        // Ordering
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        if (in_array($sortBy, ['name', 'price_per_night', 'is_active', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $accommodations = $query->paginate(10)->withQueryString();

        // Transform untuk konsistensi front-end
        $accommodations->getCollection()->transform(function (Accommodation $accommodation) {
            $institution = Institution::first(); // Get the single institution
            return [
                'id' => $accommodation->id,
                'name' => $accommodation->name,
                'description' => $accommodation->description,
                'price_per_night' => $accommodation->price_per_night,
                'formatted_price' => $accommodation->formatted_price,
                'image_path' => $accommodation->image_path,
                'image_url' => $accommodation->image_url,
                'is_active' => $accommodation->is_active,
                'institution' => [
                    'id' => $institution->id ?? 0,
                    'name' => $institution->name ?? 'PareeduHub',
                    'phone' => $institution->phone ?? '',
                ],
                'whatsapp_booking_url' => $accommodation->whatsapp_booking_url,
                'created_at' => $accommodation->created_at?->toISOString(),
                'updated_at' => $accommodation->updated_at?->toISOString(),
            ];
        });

        // Get all institutions for filter dropdown (though we only have one)
        $institutions = Institution::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/accommodations/Index', [
            'accommodations' => $accommodations,
            'institutions' => $institutions,
            'filters' => [
                'search' => $request->get('search', ''),
                'is_active' => $request->get('is_active', ''),
                'min_price' => $request->get('min_price', ''),
                'max_price' => $request->get('max_price', ''),
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
            ],
        ]);
    }

    /**
     * Menampilkan form untuk membuat akomodasi baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/accommodations/Create');
    }

    /**
     * Menyimpan akomodasi baru ke database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_per_night' => $validated['price_per_night'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('accommodations', 'public');
        }

        Accommodation::create($data);

        return redirect()->route('admin.accommodations.index')
            ->with('success', 'Akomodasi berhasil ditambahkan.');
    }

    /**
     * Menampilkan form untuk mengedit akomodasi.
     */
    public function edit(Accommodation $accommodation): Response
    {
        $institution = Institution::first(); // Get the single institution

        return Inertia::render('admin/accommodations/Edit', [
            'accommodation' => [
                'id' => $accommodation->id,
                'name' => $accommodation->name,
                'description' => $accommodation->description,
                'price_per_night' => $accommodation->price_per_night,
                'image_path' => $accommodation->image_path,
                'image_url' => $accommodation->image_url,
                'is_active' => $accommodation->is_active,
                'institution' => [
                    'id' => $institution->id ?? 0,
                    'name' => $institution->name ?? 'PareeduHub',
                    'phone' => $institution->phone ?? '',
                ],
            ],
        ]);
    }

    /**
     * Memperbarui akomodasi yang ada.
     */
    public function update(Request $request, Accommodation $accommodation): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_per_night' => $validated['price_per_night'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($accommodation->image_path && Storage::disk('public')->exists($accommodation->image_path)) {
                Storage::disk('public')->delete($accommodation->image_path);
            }

            $data['image_path'] = $request->file('image')->store('accommodations', 'public');
        }

        $accommodation->update($data);

        return redirect()->route('admin.accommodations.index')
            ->with('success', 'Akomodasi berhasil diperbarui.');
    }

    /**
     * Menghapus akomodasi dari database.
     */
    public function destroy(Accommodation $accommodation): RedirectResponse
    {
        // Delete image if exists
        if ($accommodation->image_path && Storage::disk('public')->exists($accommodation->image_path)) {
            Storage::disk('public')->delete($accommodation->image_path);
        }

        $accommodation->delete();

        return redirect()->route('admin.accommodations.index')
            ->with('success', 'Akomodasi berhasil dihapus.');
    }

    /**
     * Toggle status aktif akomodasi.
     */
    public function toggleStatus(Accommodation $accommodation): RedirectResponse
    {
        $accommodation->update([
            'is_active' => !$accommodation->is_active,
        ]);

        $status = $accommodation->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('admin.accommodations.index')
            ->with('success', "Akomodasi berhasil {$status}.");
    }
}
