<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Support either `q` or `query` as the search parameter; normalize to `query`
        $q = $this->input('q');
        $query = $this->input('query');

        if ($q !== null && $query === null) {
            $this->merge(['query' => $q]);
        }

        // Normalize filter and provide default
        $filter = $this->input('filter');
        if ($filter === null || $filter === '') {
            $this->merge(['filter' => 'all']);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'query' => 'required|string|min:1|max:255',
            'filter' => 'nullable|string|in:all,users,courses,transactions,materials,chapters,categories,institutions,reviews',
            'limit' => 'nullable|integer|min:1|max:50',
        ];
    }

    /**
     * Custom attributes for validation errors.
     */
    public function attributes(): array
    {
        return [
            'query' => 'kata kunci pencarian',
            'filter' => 'filter pencarian',
            'limit' => 'batas hasil',
        ];
    }
}

