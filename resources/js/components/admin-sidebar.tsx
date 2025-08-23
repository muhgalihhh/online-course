import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, CreditCard, Menu, Users } from 'lucide-react';

interface AdminSidebarProps {
    breadcrumbs?: BreadcrumbItem[];
}

const menuItems = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
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
    },
    {
        title: 'Institutions',
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

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <AdminSidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <AdminSidebarContent />
            </div>
        </>
    );
}

function AdminSidebarContent() {
    const { url } = usePage();

    return (
        <div className="flex flex-grow flex-col border-r bg-background">
            <div className="flex h-16 items-center border-b px-4">
                <Link href={route('admin.dashboard')} className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-sm font-bold text-primary-foreground">A</span>
                    </div>
                    <span className="text-lg font-bold">Admin Panel</span>
                </Link>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn('w-full justify-start', isActive && 'bg-secondary text-secondary-foreground')}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            <div className="border-t p-4">
                <div className="text-sm text-muted-foreground">
                    <p>Admin Dashboard</p>
                    <p className="text-xs">Manage your LMS system</p>
                </div>
            </div>
        </div>
    );
}
