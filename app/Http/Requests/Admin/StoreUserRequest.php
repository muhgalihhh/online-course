<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
            'email' => 'required|email|unique:users,email|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[\d\+\-\(\)\s]+$/',
            'bio' => 'nullable|string|max:1000',
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'city' => 'nullable|string|max:100',
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => ['required', 'in:admin,user'],
            'profile_photo_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama lengkap',
            'email' => 'alamat email',
            'phone' => 'nomor telepon',
            'bio' => 'bio',
            'birth_date' => 'tanggal lahir',
            'gender' => 'jenis kelamin',
            'city' => 'kota',
            'password' => 'kata sandi',
            'role' => 'peran pengguna',
            'profile_photo_path' => 'foto profil',
        ];
    }
}
