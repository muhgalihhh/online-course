<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseMaterialRequest extends FormRequest
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
            'chapter_id' => 'required|exists:chapters,id',
            'title' => 'required|string|max:255',
            'order' => 'required|integer|min:0',
            'type' => 'required|in:pdf,image,video',
            'file_path' => 'required_if:type,pdf,image|file|mimes:pdf,jpeg,png,jpg,gif|max:10240',
            'youtube_url' => 'required_if:type,video|url|regex:/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/',
            'is_preview' => 'boolean',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'chapter_id' => 'bab',
            'title' => 'judul materi',
            'order' => 'urutan materi',
            'type' => 'tipe materi',
            'file_path' => 'file materi',
            'youtube_url' => 'URL YouTube',
            'is_preview' => 'status preview',
        ];
    }
}