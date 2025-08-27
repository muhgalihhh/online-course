<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SearchRequest;
use App\Services\SearchService;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function __construct(private readonly SearchService $searchService)
    {
    }

    /**
     * Perform global search across all admin resources
     *
     * @param SearchRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(SearchRequest $request)
    {
        try {
            $query = trim($request->input('query'));
            $filter = $request->input('filter', 'all');
            $limit = (int) ($request->input('limit', 15));

            $results = $this->searchService->search($query, $filter, $limit);

            return response()->json($results);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Invalid search query',
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Search error: ' . $e->getMessage(), [
                'query' => $request->input('query'),
                'filter' => $request->input('filter'),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Search failed',
                'message' => 'An error occurred while searching. Please try again.'
            ], 500);
        }
    }
}