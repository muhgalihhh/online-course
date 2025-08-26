import { AdminHeader } from '@/components/admin-header';
import AdminSidebar from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/toaster';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Menu, Package2 } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

export default function AdminSidebarLayout({ children }: PropsWithChildren) {
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
                className={`grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out ${isSidebarExpanded ? 'md:grid-cols-[280px_1fr]' : 'md:grid-cols-[60px_1fr]'}`}
            >
                {/* Sidebar untuk Desktop */}
                <div className="hidden border-r bg-muted/40 md:block">
                    <div className="flex h-full max-h-screen flex-col gap-2">
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
                        <div className="flex-1 overflow-auto py-2">
                            <AdminSidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    {/* Header */}
                    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                        {/* Tombol Sidebar untuk Mobile */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col">
                                <nav className="grid gap-2 text-lg font-medium">
                                    <a href={route('admin.dashboard')} className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                        <Package2 className="h-6 w-6" />
                                        <span>Admin Panel</span>
                                    </a>
                                    <AdminSidebar isExpanded={true} />
                                </nav>
                            </SheetContent>
                        </Sheet>
                        <div className="w-full flex-1">{/* ... Konten Header lainnya seperti Breadcrumbs atau Search Bar */}</div>
                        <AdminHeader user={auth.user} />
                    </header>

                    {/* Konten Utama */}
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
                </div>
            </div>
            <Toaster />
        </>
    );
}
