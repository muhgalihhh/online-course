<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\OtherInstitutionController;

// Test route tanpa middleware
Route::get('/test-other-institutions', function () {
    try {
        $controller = new OtherInstitutionController();
        return 'Controller loaded successfully!';
    } catch (Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/test-institution', function () {
    try {
        $institution = \App\Models\Institution::first();

        if (!$institution) {
            return response()->json([
                'status' => 'no_institution',
                'message' => 'No institution found in database',
                'institution_count' => \App\Models\Institution::count(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'institution' => $institution,
            'institution_count' => \App\Models\Institution::count(),
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});

Route::post('/test-institution-update', function (\Illuminate\Http\Request $request) {
    try {
        $institution = \App\Models\Institution::first();

        if (!$institution) {
            $institution = \App\Models\Institution::create([
                'name' => 'Test Institution',
                'description' => 'Test Description',
                'phone' => '123456789',
                'email' => 'test@test.com',
                'address' => 'Test Address',
                'website' => 'https://test.com',
            ]);
        }

        $result = $institution->update([
            'name' => $request->input('name', 'Updated Name'),
            'description' => $request->input('description', 'Updated Description'),
        ]);

        return response()->json([
            'status' => 'success',
            'update_result' => $result,
            'institution' => $institution->fresh(),
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});
