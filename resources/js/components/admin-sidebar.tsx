import { Link, usePage } from '@inertiajs/react';

import AppLogo from '@/components/app-logo';
import { Icon } from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LayoutDashboard, LineChart, ArrowLeftRight, Users, Book, ListChecks, Files, LayoutGrid, School, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

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
        icon: LayoutDashboard,
        href: 'admin.dashboard',
    },
    {
        label: 'Analytics',
        icon: LineChart,
        href: 'admin.analytics',
    },
    {
        label: 'Transactions',
        icon: ArrowLeftRight,
        href: 'admin.transactions.index',
    },
    {
        label: 'Users',
        icon: Users,
        href: 'admin.users.index',
    },
    {
        label: 'Courses',
        icon: Book,
        href: 'admin.courses.index',
    },
    {
        label: 'Chapters',
        icon: ListChecks,
        href: 'admin.chapters.index',
    },
    {
        label: 'Materials',
        icon: Files,
        href: 'admin.materials.index',
    },
    {
        label: 'Categories',
        icon: LayoutGrid,
        href: 'admin.categories.index',
    },
    {
        label: 'Institutions',
        icon: School,
        href: 'admin.institutions.index',
    },
    {
        label: 'Reviews',
        icon: MessageSquare,
        href: 'admin.reviews',
    },
    {
        label: 'Settings',
        icon: SettingsIcon,
        href: 'admin.settings',
    },
];

interface AdminSidebarProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export default function AdminSidebar({ isExpanded = true, onToggle }: AdminSidebarProps) {
    const { component } = usePage();

    return (
        <aside className="flex h-full w-full flex-col">
            <div className="flex h-14 items-center justify-between border-b px-4">
                <AppLogo />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
                    {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
            <ScrollArea className="h-full px-2">
                <ul className="space-y-1 py-2">
                    {menu.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={safeRoute(item.href)}
                                className={cn(
                                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                                    route().current(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                                )}
                            >
                                <Icon iconNode={item.icon as any} className="h-4 w-4" />
                                <span
                                    className={cn(
                                        'ml-2 whitespace-nowrap transition-all duration-300',
                                        isExpanded ? 'opacity-100' : 'w-0 opacity-0',
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </aside>
    );
}
