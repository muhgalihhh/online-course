import { Button } from '@/components/ui/button';
import Settings from '@/pages/admin/settings';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart4,
    BookCheck,
    BookCopy,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    LayoutDashboard,
    Library,
    MessageSquareQuote,
    Users,
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: 'admin.dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Institutions',
        href: 'admin.institutions.index',
        icon: Library,
    },
    {
        name: 'Categories',
        href: 'admin.categories.index',
        icon: FolderKanban,
    },
    {
        name: 'Courses',
        href: 'admin.courses.index',
        icon: BookCopy,
    },
    {
        name: 'Users',
        href: 'admin.users.index',
        icon: Users,
    },
    {
        name: 'Transactions',
        href: 'admin.transactions.index',
        icon: BookCheck,
    },
    {
        name: 'Reviews',
        href: 'admin.reviews',
        icon: MessageSquareQuote,
    },
    {
        name: 'Analytics',
        href: 'admin.analytics',
        icon: BarChart4,
    },
    {
        name: 'Settings',
        href: 'admin.settings',
        icon: Settings,
    },
];

interface AdminSidebarProps {
    isExpanded: boolean;
    onToggle?: () => void;
}

export default function AdminSidebar({ isExpanded, onToggle }: AdminSidebarProps) {
    const { url } = usePage();

    return (
        <div className="flex h-full flex-col justify-between">
            <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                {navigation.map((item) => (
                    <Link key={item.name} href={route(item.href)}>
                        <Button variant={route().current(item.href) ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'w-0 opacity-0'}`}>
                                {item.name}
                            </span>
                        </Button>
                    </Link>
                ))}
            </nav>
            {/* Tombol Toggle hanya untuk desktop */}
            {onToggle && (
                <div className="hidden border-t px-2 py-4 md:block">
                    <Button variant="ghost" className="w-full justify-end" onClick={onToggle}>
                        {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
