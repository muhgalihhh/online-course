<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateInstitutionRequest;
use App\Models\Institution;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionController extends Controller
{
    /**
     * Tampilkan form untuk mengedit profil institusi.
     */
    public function edit(): Response
    {
        // Ambil data institusi atau buat baris baru jika kosong
        $institution = Institution::firstOrCreate([]);
        
        return Inertia::render('admin/institutions/edit', [
            'institution' => $institution,
        ]);
    }

    /**
     * Update data profil institusi di database.
     */
    public function update(UpdateInstitutionRequest $request)
    {
        $institution = Institution::first();
        
        // Handle file upload untuk photo_path
        $data = $request->validated();
        
        if ($request->hasFile('photo_path')) {
            // Hapus foto lama jika ada
            if ($institution && $institution->photo_path) {
                Storage::disk('public')->delete($institution->photo_path);
            }
            
            // Simpan foto baru
            $photoPath = $request->file('photo_path')->store('institutions', 'public');
            $data['photo_path'] = $photoPath;
        }
        
        // Update atau buat institusi
        if ($institution) {
            $institution->update($data);
        } else {
            $institution = Institution::create($data);
        }

        return redirect()->route('admin.institution.edit')
            ->with('success', 'Profil institusi berhasil diperbarui.');
    }
}