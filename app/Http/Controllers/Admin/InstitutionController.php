<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateInstitutionRequest;
use App\Models\Institution;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionController extends Controller
{
    /**
     * Tampilkan ringkasan profil institusi.
     */
    public function index(): Response
    {
        $institution = Institution::withCount('courses')->first();
        return Inertia::render('admin/institutions/index', [
            'institution' => $institution,
        ]);
    }

    /**
     * Tampilkan form untuk mengedit profil institusi.
     */
    public function edit(): Response
    {
        // Ambil data institusi atau buat baris baru jika kosong
        $institution = Institution::first();

        if (!$institution) {
            // Buat institusi default jika belum ada
            $institution = Institution::create([
                'name' => '',
                'description' => '',
                'phone' => '',
                'email' => '',
                'address' => '',
                'website' => '',
                'tiktok_url' => null,
                'instagram_url' => null,
                'facebook_url' => null,
                'twitter_url' => null,
                'ios_app_url' => null,
                'android_app_url' => null,
            ]);
        }

        return Inertia::render('admin/institutions/edit', [
            'institution' => $institution,
        ]);
    }

    /**
     * Update data profil institusi di database.
     */
    public function update(UpdateInstitutionRequest $request)
    {
        try {
            Log::info('Institution update request received', [
                'method' => $request->method(),
                'all' => $request->all(),
                'has_file' => $request->hasFile('photo_path')
            ]);

            $institution = Institution::first();
            Log::info('Found institution', ['institution' => $institution]);

            // Handle file upload untuk photo_path
            $data = $request->validated();
            Log::info('Validated data', $data);

            // Remove photo_path from data if no file uploaded
            if (!$request->hasFile('photo_path')) {
                unset($data['photo_path']);
            }

            if ($request->hasFile('photo_path')) {
                Log::info('File upload detected');
                // Hapus foto lama jika ada
                if ($institution && $institution->photo_path) {
                    Storage::disk('public')->delete($institution->photo_path);
                }

                // Simpan foto baru
                $photoPath = $request->file('photo_path')->store('institutions', 'public');
                $data['photo_path'] = $photoPath;
                Log::info('File uploaded to', ['path' => $photoPath]);
            }

            // Update atau buat institusi
            if ($institution) {
                $result = $institution->update($data);
                Log::info('Institution updated', ['result' => $result, 'updated_data' => $data]);
                $message = 'Profil institusi berhasil diperbarui.';
            } else {
                $institution = Institution::create($data);
                Log::info('Institution created', ['institution' => $institution]);
                $message = 'Profil institusi berhasil dibuat.';
            }

            return redirect()->route('admin.institutions.edit')
                ->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Error updating institution: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);

            return redirect()->route('admin.institutions.edit')
                ->with('error', 'Terjadi kesalahan saat memperbarui profil institusi: ' . $e->getMessage());
        }
    }
}
