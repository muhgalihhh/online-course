<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstitutionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'photo_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // Social media links
            'tiktok_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            // App store links
            'ios_app_url' => 'nullable|url|max:255',
            'android_app_url' => 'nullable|url|max:255',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama institusi',
            'email' => 'email institusi',
            'phone' => 'nomor telepon',
            'website' => 'website institusi',
            'address' => 'alamat institusi',
            'description' => 'deskripsi institusi',
            'photo_path' => 'foto institusi',
            'tiktok_url' => 'Tiktok',
            'instagram_url' => 'Instagram',
            'facebook_url' => 'Facebook',
            'twitter_url' => 'Twitter/X',
            'ios_app_url' => 'Link aplikasi iOS',
            'android_app_url' => 'Link aplikasi Android',
        ];
    }
}
