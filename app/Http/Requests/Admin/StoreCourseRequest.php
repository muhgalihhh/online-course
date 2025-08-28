<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
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
            'institution_id' => 'required|exists:institutions,id',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'is_pro' => 'boolean',
            'status' => 'required|in:draft,published',
            'thumbnail_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'institution_id' => 'institusi',
            'category_id' => 'kategori',
            'title' => 'judul kursus',
            'description' => 'deskripsi kursus',
            'price' => 'harga kursus',
            'is_pro' => 'status pro',
            'status' => 'status publikasi',
            'thumbnail_path' => 'thumbnail kursus',
        ];
    }
}