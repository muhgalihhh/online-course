import { AdminSidebar } from '@/components/admin-sidebar';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { FlashMessages } from '@/components/flash-messages';
import { AdminHeader } from '@/components/admin-header';
import { Toaster } from '@/components/ui/toaster';
import { useSidebar } from '@/hooks/use-sidebar';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
    const { isCollapsed } = useSidebar();
    useToastNotifications();

    return (
        <AppShell variant="sidebar">
            <AdminSidebar breadcrumbs={breadcrumbs} />
            <div className={cn(
                "flex flex-col flex-1 transition-all duration-300",
                isCollapsed ? "md:ml-16" : "md:ml-64"
            )}>
                <AdminHeader breadcrumbs={breadcrumbs} />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <div className="flex-1 space-y-6 p-6 lg:p-8">
                        <FlashMessages />
                        {children}
                    </div>
                </AppContent>
            </div>
            <Toaster />
        </AppShell>
    );
}