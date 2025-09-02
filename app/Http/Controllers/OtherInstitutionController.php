<?php

namespace App\Http\Controllers;

use App\Models\OtherInstitution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherInstitutionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $institutions = OtherInstitution::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('other-institutions/index', [
            'institutions' => $institutions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(OtherInstitution $institution)
    {
        return Inertia::render('other-institutions/show', [
            'institution' => $institution,
        ]);
    }
}
