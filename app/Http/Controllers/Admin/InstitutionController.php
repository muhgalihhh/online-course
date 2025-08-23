<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionController extends Controller
{
    /**
     * Menampilkan daftar semua institusi dengan paginasi.
     */
    public function index(): Response
    {
        return Inertia::render('admin/institutions/index', [
            'institutions' => Institution::withCount('courses')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    /**
     * Tampilkan form untuk membuat institusi baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/institutions/create');
    }

    /**
     * Simpan institusi baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:institutions',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        Institution::create($validated);

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Institusi berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit institusi.
     */
    public function edit(Institution $institution): Response
    {
        return Inertia::render('admin/institutions/edit', [
            'institution' => $institution,
        ]);
    }

    /**
     * Update data institusi di database.
     */
    public function update(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:institutions,name,' . $institution->id,
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $institution->update($validated);

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Institusi berhasil diperbarui.');
    }

    /**
     * Hapus institusi dari database.
     */
    public function destroy(Institution $institution)
    {
        // Cek apakah institusi masih digunakan oleh kursus
        if ($institution->courses()->count() > 0) {
            return redirect()->route('admin.institutions.index')
                ->with('error', 'Institusi tidak dapat dihapus karena masih digunakan oleh kursus.');
        }

        $institution->delete();

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Institusi berhasil dihapus.');
    }
}