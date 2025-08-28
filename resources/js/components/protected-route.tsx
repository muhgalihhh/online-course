import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireGuest?: boolean;
    requireRole?: 'admin' | 'user';
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requireAuth = false,
    requireGuest = false,
    requireRole,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, isUser } = useAuth();
    
    useEffect(() => {
        // If authentication is required but user is not authenticated
        if (requireAuth && !isAuthenticated) {
            router.visit(redirectTo);
            return;
        }
        
        // If guest is required but user is authenticated
        if (requireGuest && isAuthenticated) {
            const dashboardRoute = isAdmin ? '/admin/dashboard' : '/user/dashboard';
            router.visit(dashboardRoute);
            return;
        }
        
        // If specific role is required
        if (requireRole && isAuthenticated) {
            const hasRequiredRole = requireRole === 'admin' ? isAdmin : isUser;
            if (!hasRequiredRole) {
                router.visit('/');
            }
        }
    }, [isAuthenticated, isAdmin, isUser, requireAuth, requireGuest, requireRole, redirectTo]);
    
    // Don't render children if conditions are not met
    if (requireAuth && !isAuthenticated) {
        return null;
    }
    
    if (requireGuest && isAuthenticated) {
        return null;
    }
    
    if (requireRole) {
        const hasRequiredRole = requireRole === 'admin' ? isAdmin : isUser;
        if (!hasRequiredRole) {
            return null;
        }
    }
    
    return <>{children}</>;
}