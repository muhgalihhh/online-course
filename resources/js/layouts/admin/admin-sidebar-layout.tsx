import { AdminHeader } from '@/components/admin-header';
import AdminSidebar from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/toaster';
import LiveChatWidget from '@/components/live-chat-widget';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Menu, Package2 } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

interface AdminSidebarLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
}

export default function AdminSidebarLayout({ children, header }: AdminSidebarLayoutProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    // Initialize toast notifications for flash messages
    useToastNotifications();

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div
                className={`grid h-screen w-full overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out ${isSidebarExpanded ? 'md:grid-cols-[280px_1fr]' : 'md:grid-cols-[60px_1fr]'}`}
            >
                {/* Sidebar untuk Desktop - Fixed */}
                <div className="hidden border-r bg-muted/40 md:block h-screen sticky top-0">
                    <div className="flex h-full flex-col gap-2">
                        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                            <a href={route('admin.dashboard')} className="flex items-center gap-2 font-semibold">
                                <Package2 className="h-6 w-6" />
                                <span
                                    className={`whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'w-0 opacity-0'}`}
                                >
                                    Admin Panel
                                </span>
                            </a>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2">
                            <AdminSidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-screen overflow-hidden">
                    {/* Header - Fixed */}
                    <div className="sticky top-0 z-50">
                        <AdminHeader onToggleSidebar={toggleSidebar} />
                    </div>

                    {/* Konten Utama - Scrollable */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                            {header ? <div className="mb-2 lg:mb-4">{header}</div> : null}
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <Toaster />
            <LiveChatWidget />
        </>
    );
}
