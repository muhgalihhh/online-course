import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_admin: boolean;
    is_user: boolean;
    profile_photo_url?: string; // URL provided by backend for Jetstream-like profile photos
}

interface AuthProps {
    user: User | null;
}

interface PageProps {
    auth: AuthProps;
    flash?: {
        success?: string;
        error?: string;
    };
}

export function useAuth() {
    const { auth } = usePage<PageProps>().props;

    return {
        user: auth.user,
        isAuthenticated: !!auth.user,
        isAdmin: auth.user?.is_admin || false,
        isUser: auth.user?.is_user || false,
    };
}

export function useRequireAuth(redirectTo: string = '/login') {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.visit(redirectTo);
        }
    }, [isAuthenticated, redirectTo]);

    return isAuthenticated;
}

export function useRequireGuest(redirectTo: string = '/dashboard') {
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.is_admin) {
                router.visit('/admin/dashboard');
            } else {
                router.visit('/user/dashboard');
            }
        }
    }, [isAuthenticated, user, redirectTo]);

    return !isAuthenticated;
}

export function useRequireRole(role: 'admin' | 'user', redirectTo: string = '/') {
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.visit('/login');
        } else if (user) {
            const hasRole = role === 'admin' ? user.is_admin : user.is_user;
            if (!hasRole) {
                router.visit(redirectTo);
            }
        }
    }, [isAuthenticated, user, role, redirectTo]);

    return user && (role === 'admin' ? user.is_admin : user.is_user);
}
