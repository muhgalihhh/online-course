import { Link, usePage } from '@inertiajs/react';

import AppLogo from '@/components/app-logo';
import { Icon } from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Helper function to safely generate route
const safeRoute = (name: string) => {
    try {
        return route(name);
    } catch (error) {
        console.warn(`Route '${name}' not found:`, error);
        return '#';
    }
};

const menu = [
    {
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        href: 'admin.dashboard',
    },
    {
        label: 'Analytics',
        icon: 'LineChart',
        href: 'admin.analytics',
    },
    {
        label: 'Transactions',
        icon: 'ArrowLeftRight',
        href: 'admin.transactions.index',
    },
    {
        label: 'Users',
        icon: 'Users',
        href: 'admin.users.index',
    },
    {
        label: 'Courses',
        icon: 'Book',
        href: 'admin.courses.index',
    },
    {
        label: 'Categories',
        icon: 'LayoutGrid',
        href: 'admin.categories.index',
    },
    {
        label: 'Institutions',
        icon: 'School',
        href: 'admin.institutions.index',
    },
    {
        label: 'Reviews',
        icon: 'MessageSquare',
        href: 'admin.reviews',
    },
];

export default function AdminSidebar() {
    const { component } = usePage();

    return (
        <aside className="hidden w-64 flex-col border-r lg:flex">
            <div className="flex h-14 items-center border-b px-4">
                <AppLogo />
            </div>
            <ScrollArea className="h-full px-4">
                <ul className="space-y-2">
                    {menu.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={safeRoute(item.href)}
                                className={cn(
                                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                                    route().current(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                                )}
                            >
                                <Icon name={item.icon as any} className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </aside>
    );
}
