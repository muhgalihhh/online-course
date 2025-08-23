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
     * Menampilkan profil institusi.
     */
    public function index(): Response
    {
        $institution = Institution::withCount('courses')->first();
        
        return Inertia::render('admin/institutions/index', [
            'institution' => $institution,
        ]);
    }

    /**
     * Tampilkan form untuk membuat profil institusi baru.
     */
    public function create(): Response
    {
        // Cek apakah sudah ada institusi
        if (Institution::exists()) {
            return redirect()->route('admin.institutions.index')
                ->with('error', 'Profil institusi sudah ada. Anda hanya dapat mengedit profil yang ada.');
        }

        return Inertia::render('admin/institutions/create');
    }

    /**
     * Simpan profil institusi baru ke database.
     */
    public function store(Request $request)
    {
        // Cek apakah sudah ada institusi
        if (Institution::exists()) {
            return redirect()->route('admin.institutions.index')
                ->with('error', 'Profil institusi sudah ada. Anda hanya dapat mengedit profil yang ada.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        Institution::create($validated);

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Profil institusi berhasil dibuat.');
    }

    /**
     * Tampilkan form untuk mengedit profil institusi.
     */
    public function edit(Institution $institution): Response
    {
        return Inertia::render('admin/institutions/edit', [
            'institution' => $institution,
        ]);
    }

    /**
     * Update data profil institusi di database.
     */
    public function update(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $institution->update($validated);

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Profil institusi berhasil diperbarui.');
    }

    /**
     * Hapus profil institusi dari database.
     */
    public function destroy(Institution $institution)
    {
        // Cek apakah institusi masih digunakan oleh kursus
        if ($institution->courses()->count() > 0) {
            return redirect()->route('admin.institutions.index')
                ->with('error', 'Profil institusi tidak dapat dihapus karena masih digunakan oleh kursus.');
        }

        $institution->delete();

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Profil institusi berhasil dihapus.');
    }
}