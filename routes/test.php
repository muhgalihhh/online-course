<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\OtherInstitutionController;

// Test route tanpa middleware
Route::get('/test-other-institutions', function() {
    try {
        $controller = new OtherInstitutionController();
        return 'Controller loaded successfully!';
    } catch (Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});
