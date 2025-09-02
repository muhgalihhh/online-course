<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class StoreCourseMaterialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        Log::info('StoreCourseMaterialRequest - Authorization check');
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        Log::info('StoreCourseMaterialRequest - Prepare for validation', [
            'all_input' => $this->all(),
            'type' => $this->input('type'),
            'youtube_url' => $this->input('youtube_url'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        Log::info('StoreCourseMaterialRequest - Building rules', [
            'type' => $this->input('type'),
            'has_file' => $this->hasFile('file_path'),
        ]);

        $rules = [
            'chapter_id' => 'required|exists:chapters,id',
            'title' => 'required|string|max:255',
            'order' => 'required|integer|min:0',
            'type' => 'required|in:pdf,image,video_local,video_youtube',
            'is_preview' => 'boolean',
        ];

        // Dynamic validation based on type
        if ($this->input('type') === 'pdf') {
            $rules['file_path'] = 'required|file|mimes:pdf|max:10240';
        } elseif ($this->input('type') === 'image') {
            $rules['file_path'] = 'required|file|mimes:jpeg,png,jpg,gif,webp|max:5120';
        } elseif ($this->input('type') === 'video_local') {
            $rules['file_path'] = 'required|file|mimes:mp4,mov,avi,mkv,wmv,flv,webm|max:102400'; // 100MB
        } elseif ($this->input('type') === 'video_youtube') {
            $rules['youtube_url'] = [
                'required',
                'string',
                'url',
                function ($attribute, $value, $fail) {
                    // More comprehensive regex to support various YouTube URL formats
                    $patterns = [
                        '/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&[A-Za-z0-9_\-=&]*)?$/',
                        '/^(https?:\/\/)?(www\.)?youtu\.be\/[A-Za-z0-9_-]+(\?[A-Za-z0-9_\-=&]*)?$/',
                    ];

                    $isValid = false;
                    foreach ($patterns as $pattern) {
                        if (preg_match($pattern, $value)) {
                            $isValid = true;
                            break;
                        }
                    }

                    if (!$isValid) {
                        $fail('URL YouTube tidak valid. Gunakan format yang benar.');
                    }
                }
            ];
        }

        Log::info('StoreCourseMaterialRequest - Final rules', $rules);
        return $rules;
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

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.in' => 'Tipe materi harus berupa PDF, Gambar, Video Lokal, atau Video YouTube.',
            'file_path.required' => 'File wajib diupload untuk tipe ini.',
            'file_path.mimes' => 'Format file tidak didukung untuk tipe yang dipilih.',
            'youtube_url.required' => 'URL YouTube wajib diisi untuk tipe Video YouTube.',
            'youtube_url.regex' => 'URL YouTube tidak valid. Gunakan format yang benar.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        Log::error('StoreCourseMaterialRequest - Validation failed', [
            'errors' => $validator->errors()->toArray(),
            'input_data' => $this->all(),
        ]);

        parent::failedValidation($validator);
    }
}
