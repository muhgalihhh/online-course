import { AdminSidebar } from '@/components/admin-sidebar';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { FlashMessages } from '@/components/flash-messages';
import { AdminHeader } from '@/components/admin-header';
import { AdminContentWrapper } from '@/components/admin-content-wrapper';
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
        <div className="admin-layout">
            <AppShell variant="sidebar">
                {/* Header - Fixed at top */}
                <AdminHeader breadcrumbs={breadcrumbs} />
                
                {/* Main content area with sidebar and content */}
                <div className="flex flex-1 h-[calc(100vh-4rem)]">
                    {/* Sidebar - Fixed height, scrollable */}
                    <AdminSidebar breadcrumbs={breadcrumbs} />
                    
                    {/* Content area - Flexible width with smooth transitions */}
                    <main className={cn(
                        "admin-content flex-1 flex flex-col bg-background",
                        isCollapsed ? "admin-content-collapsed" : "admin-content-expanded"
                    )}>
                        <AppContent variant="sidebar" className="flex-1 overflow-hidden">
                            <AdminContentWrapper>
                                <FlashMessages />
                                <div className="min-h-0">
                                    {children}
                                </div>
                            </AdminContentWrapper>
                        </AppContent>
                    </main>
                </div>
            </AppShell>
            <Toaster />
        </div>
    );
}