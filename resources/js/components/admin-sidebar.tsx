import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, CreditCard, Menu, Users, LayoutDashboard, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';

interface AdminSidebarProps {
    breadcrumbs?: BreadcrumbItem[];
}

const menuItems = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: route('admin.users.index'),
        icon: Users,
    },
    {
        title: 'Courses',
        href: route('admin.courses.index'),
        icon: BookOpen,
    },
    {
        title: 'Categories',
        href: route('admin.categories.index'),
        icon: Tag,
    },
    {
        title: 'Profil Institusi',
        href: route('admin.institutions.index'),
        icon: Building2,
    },
    {
        title: 'Transactions',
        href: route('admin.transactions.index'),
        icon: CreditCard,
    },
];

export function AdminSidebar({ breadcrumbs }: AdminSidebarProps) {
    const { url } = usePage();
    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="md:hidden h-9 w-9 p-0"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 border-r">
                    <AdminSidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className={cn(
                "admin-sidebar hidden md:flex md:flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                "h-full",
                isCollapsed ? "admin-sidebar-collapsed" : "admin-sidebar-expanded"
            )}>
                <AdminSidebarContent isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            </aside>
        </>
    );
}

interface AdminSidebarContentProps {
    isCollapsed?: boolean;
    toggleSidebar?: () => void;
}

function AdminSidebarContent({ isCollapsed = false, toggleSidebar }: AdminSidebarContentProps) {
    const { url } = usePage();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex h-16 items-center border-b px-4 shrink-0">
                <div className="flex items-center justify-between w-full">
                    <Link 
                        href={route('admin.dashboard')} 
                        className="flex items-center gap-3 transition-opacity hover:opacity-80"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
                            <span className="text-sm font-bold text-primary-foreground">A</span>
                        </div>
                        {!isCollapsed && (
                            <span className="text-lg font-semibold truncate sidebar-transition">
                                Admin Panel
                            </span>
                        )}
                    </Link>
                    {!isCollapsed && toggleSidebar && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className="h-8 w-8 p-0 shrink-0 hover:bg-muted sidebar-item"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Collapse sidebar</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4 scrollbar-thin">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start h-10 sidebar-item',
                                        isActive && 'sidebar-item-active',
                                        isCollapsed && 'justify-center px-2'
                                    )}
                                    title={isCollapsed ? item.title : undefined}
                                >
                                    <item.icon className={cn(
                                        "h-4 w-4 sidebar-transition",
                                        !isCollapsed && "mr-3"
                                    )} />
                                    {!isCollapsed && (
                                        <span className="truncate sidebar-transition">
                                            {item.title}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>
            
            {/* Footer with toggle button when collapsed */}
            {isCollapsed && toggleSidebar && (
                <div className="border-t p-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSidebar}
                        className="h-8 w-8 p-0 mx-auto hover:bg-muted sidebar-item"
                        title="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Expand sidebar</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
