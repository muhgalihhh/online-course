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
            <div className="flex h-screen flex-col">
                {/* Header - Fixed at top */}
                <AdminHeader breadcrumbs={breadcrumbs} />
                
                {/* Main content area with sidebar and content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Below header, fixed height */}
                    <AdminSidebar breadcrumbs={breadcrumbs} />
                    
                    {/* Content area - Adjusts based on sidebar state */}
                    <div className={cn(
                        "flex flex-1 flex-col transition-all duration-300",
                        isCollapsed ? "md:ml-16" : "md:ml-64"
                    )}>
                        <AppContent variant="sidebar" className="overflow-x-hidden">
                            <div className="flex-1 space-y-4 p-4 lg:p-6">
                                <FlashMessages />
                                {children}
                            </div>
                        </AppContent>
                    </div>
                </div>
            </div>
            <Toaster />
        </AppShell>
    );
}