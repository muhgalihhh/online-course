<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class HandlePrefixRedirect
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();
        $segments = explode('/', trim($path, '/'));
        
        // Define prefix redirects
        $prefixRedirects = [
            'admin' => 'admin.dashboard',
            'user' => 'user.dashboard',
        ];
        
        // Check if path is exactly a prefix (e.g., /admin or /user)
        if (count($segments) === 1 && isset($prefixRedirects[$segments[0]])) {
            $routeName = $prefixRedirects[$segments[0]];
            if (Route::has($routeName)) {
                return redirect()->route($routeName);
            }
        }
        
        // Check if the current route exists
        $routeExists = false;
        try {
            $route = $request->route();
            if ($route) {
                $routeExists = true;
            }
        } catch (\Exception $e) {
            $routeExists = false;
        }
        
        // If route doesn't exist but has a valid prefix, check for redirect
        if (!$routeExists && count($segments) > 0) {
            $prefix = $segments[0];
            
            // Check if this is a valid prefix that should redirect to dashboard
            if (isset($prefixRedirects[$prefix])) {
                $routeName = $prefixRedirects[$prefix];
                if (Route::has($routeName)) {
                    // Check if user has permission to access this prefix
                    if ($this->hasAccessToPrefix($prefix, $request)) {
                        return redirect()->route($routeName);
                    }
                }
            }
        }
        
        return $next($request);
    }
    
    /**
     * Check if user has access to the given prefix
     */
    private function hasAccessToPrefix(string $prefix, Request $request): bool
    {
        $user = $request->user();
        
        if (!$user) {
            return false;
        }
        
        switch ($prefix) {
            case 'admin':
                return $user->isAdmin();
            case 'user':
                return $user->isUser();
            default:
                return false;
        }
    }
}