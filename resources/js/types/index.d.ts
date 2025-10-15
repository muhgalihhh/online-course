import { PageProps as InertiaPageProps } from '@inertiajs/inertia-react';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';

// User Interface dengan penambahan role dan profile fields
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    phone: string | null;
    bio: string | null;
    birth_date: string | null;
    gender: 'male' | 'female' | null;
    city: string | null;
    role: 'admin' | 'user';
    profile_photo_path: string | null;
    profile_photo_url: string;
    created_at: string;
    updated_at: string;
}

// Interface untuk model lain
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Institution {
    id: number;
    name: string;
    short_name: string;
    photo_path: string | null;
    photo_url: string;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: number;
    title: string;
    slug: string;
    institution_id: number;
    category_id: number;
    user_id: number;
    thumbnail_path: string | null;
    thumbnail: string | null; // Added accessor attribute
    thumbnail_url: string;
    description: string;
    level: string;
    price: number;
    is_pro: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    // Computed properties added by controllers
    average_rating: number;
    total_reviews: number;
    total_students: number;
    is_enrolled?: boolean;
    // For course detail pages
    category?: { id: number; name: string };
    institution?: { id: number; name: string };
    chapters?: Chapter[];
    // For enrolled courses
    user_progress?: number;
    enrolled_at?: string;
    completed_at?: string | null;
    total_chapters?: number;
}

export interface Chapter {
    id: number;
    course_id: number;
    title: string;
    slug: string;
    order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface CourseMaterial {
    id: number;
    chapter_id: number;
    title: string;
    slug: string;
    video_url: string;
    is_free: boolean;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: number;
    user_id: number;
    course_id: number;
    rating: number;
    comment: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    user_id: number;
    transactionable_id: number;
    transactionable_type: string;
    midtrans_order_id: string;
    amount: number;
    payment_method: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    payment_details: any | null;
    created_at: string;
    updated_at: string;
    course?: Course;
    transactionable?: Course | any;
}

export interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    created_at: string;
    updated_at: string;
}

// Generic type for Laravel pagination
export interface PaginatedData<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
    last_page: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

// BreadcrumbItem type for admin components
export interface BreadcrumbItem {
    label: string;
    href?: string;
}

// SharedData type for admin settings
export interface SharedData {
    [key: string]: any;
}

// Tipe generik untuk PageProps dari Inertia
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T &
    InertiaPageProps & {
        auth: {
            user: User;
        };
        flash: {
            message: string;
            success: string;
            error: string;
        };
        ziggy: {
            location: string;
            port: number;
            query: Record<string, unknown>;
            url: string;
        };
    };

// Deklarasi Global
declare global {
    interface Window {
        axios: AxiosInstance;
    }
    const route: typeof ziggyRoute;
}

// Deklarasi untuk modul gambar
declare module '*.png' {
    const value: any;
    export default value;
}

declare module '*.svg' {
    const value: any;
    export default value;
}

declare module '*.jpeg' {
    const value: any;
    export default value;
}

declare module '*.jpg' {
    const value: any;
    export default value;
}
