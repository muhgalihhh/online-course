<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OtherInstitution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OtherInstitutionController extends Controller
{
    /**
     * Menampilkan daftar semua pusat informasi dengan paginasi.
     */
    public function index(Request $request): Response
    {
        $query = OtherInstitution::query();

        // Filter by search (name, email, or address)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
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

        if (in_array($sortBy, ['name', 'email', 'created_at', 'updated_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $otherInstitutions = $query->paginate(
            $request->get('per_page', 10)
        )->withQueryString();

        return Inertia::render('admin/OtherInstitutions/Index', [
            'otherInstitutions' => $otherInstitutions,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Menampilkan form untuk membuat pusat informasi baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/OtherInstitutions/Create');
    }

    /**
     * Menyimpan pusat informasi baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('other-institutions/logos', 'public');
            $validated['logo_path'] = $logoPath;
        }

        unset($validated['logo']);

        OtherInstitution::create($validated);

        return redirect()->route('admin.other-institutions.index')
            ->with('success', 'Pusat informasi berhasil ditambahkan.');
    }

    /**
     * Menampilkan detail pusat informasi.
     */
    public function show(OtherInstitution $otherInstitution): Response
    {
        return Inertia::render('admin/OtherInstitutions/Show', [
            'otherInstitution' => $otherInstitution,
        ]);
    }

    /**
     * Menampilkan form untuk mengedit pusat informasi.
     */
    public function edit(OtherInstitution $otherInstitution): Response
    {
        return Inertia::render('admin/OtherInstitutions/Edit', [
            'otherInstitution' => $otherInstitution,
        ]);
    }

    /**
     * Memperbarui pusat informasi di database.
     */
    public function update(Request $request, OtherInstitution $otherInstitution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($otherInstitution->logo_path) {
                Storage::disk('public')->delete($otherInstitution->logo_path);
            }

            $logoPath = $request->file('logo')->store('other-institutions/logos', 'public');
            $validated['logo_path'] = $logoPath;
        }

        unset($validated['logo']);

        $otherInstitution->update($validated);

        return redirect()->route('admin.other-institutions.index')
            ->with('success', 'Pusat informasi berhasil diperbarui.');
    }

    /**
     * Menghapus pusat informasi dari database.
     */
    public function destroy(OtherInstitution $otherInstitution)
    {
        // Delete logo if exists
        if ($otherInstitution->logo_path) {
            Storage::disk('public')->delete($otherInstitution->logo_path);
        }

        $otherInstitution->delete();

        return redirect()->route('admin.other-institutions.index')
            ->with('success', 'Pusat informasi berhasil dihapus.');
    }
}
