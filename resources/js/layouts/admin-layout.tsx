import { AdminSidebar } from '@/components/admin-sidebar';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { FlashMessages } from '@/components/flash-messages';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AdminSidebar breadcrumbs={breadcrumbs} />
            <AppContent variant="sidebar" className="overflow-x-hidden md:ml-64">
                <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
                    <FlashMessages />
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}