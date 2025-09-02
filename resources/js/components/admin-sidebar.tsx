import { Link, usePage } from '@inertiajs/react';

import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    ArrowLeftRight,
    Book,
    Files,
    LayoutDashboard,
    LayoutGrid,
    LineChart,
    ListChecks,
    MessageSquare,
    School,
    Settings as SettingsIcon,
    Users,
} from 'lucide-react';

// Helper function to safely generate route
const safeRoute = (name: string) => {
    try {
        return route(name);
    } catch (error) {
        console.warn(`Route '${name}' not found:`, error);
        return '#';
    }
};

// Menu item interface
interface MenuItem {
    label: string;
    icon: any;
    href: string;
    badge?: number | string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface MenuGroup {
    label: string;
    items: MenuItem[];
}

// Structured menu with groups
const menuGroups: MenuGroup[] = [
    {
        label: 'Overview',
        items: [
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
        ],
    },
    {
        label: 'User Management',
        items: [
            {
                label: 'Users',
                icon: Users,
                href: 'admin.users.index',
            },
            {
                label: 'Institutions',
                icon: School,
                href: 'admin.institutions.index',
            },
            {
                label: 'Other Institutions',
                icon: School,
                href: 'admin.other-institutions.index',
            },
        ],
    },
    {
        label: 'Course Management',
        items: [
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
        ],
    },
    {
        label: 'Financial',
        items: [
            {
                label: 'Transactions',
                icon: ArrowLeftRight,
                href: 'admin.transactions.index',
            },
        ],
    },
    {
        label: 'Feedback',
        items: [
            {
                label: 'Reviews',
                icon: MessageSquare,
                href: 'admin.reviews',
                // You can dynamically set this based on pending reviews count
                // badge: pendingReviewsCount,
                // badgeVariant: 'destructive',
            },
        ],
    },
    {
        label: 'System',
        items: [
            {
                label: 'Settings',
                icon: SettingsIcon,
                href: 'admin.settings',
            },
        ],
    },
];

interface AdminSidebarProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export default function AdminSidebar({ isExpanded = true, onToggle }: AdminSidebarProps) {
    const { component } = usePage();

    const renderMenuItem = (item: MenuItem, itemIndex: number) => {
        const isActive = route().current(item.href);

        const linkContent = (
            <Link
                key={itemIndex}
                href={safeRoute(item.href)}
                className={cn(
                    'group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-primary/15 font-semibold text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
            >
                <div className="flex flex-1 items-center">
                    {/* Active indicator */}
                    {isActive && <div className="absolute top-1/2 left-0 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-primary shadow-lg" />}

                    <div className={cn('rounded-lg p-1.5 transition-all', isActive ? 'bg-primary/20' : 'group-hover:bg-muted')}>
                        <Icon
                            iconNode={item.icon as any}
                            className={cn('h-4 w-4 shrink-0 transition-all', isActive ? 'scale-110 text-primary' : 'text-muted-foreground')}
                        />
                    </div>
                    <span className={cn('ml-3 transition-all duration-300', isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0')}>
                        {item.label}
                    </span>
                </div>

                {/* Badge */}
                {item.badge && isExpanded && (
                    <Badge variant={(item.badgeVariant as any) || 'default'} className="ml-auto h-5 px-1.5 text-xs">
                        {item.badge}
                    </Badge>
                )}
            </Link>
        );

        // If sidebar is collapsed, wrap in tooltip
        if (!isExpanded) {
            return (
                <Tooltip key={itemIndex} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                            <Badge variant={(item.badgeVariant as any) || 'default'} className="h-5 px-1.5 text-xs">
                                {item.badge}
                            </Badge>
                        )}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return linkContent;
    };

    return (
        <TooltipProvider>
            <aside className="flex h-full w-full flex-col border-r bg-background">
                <div className="flex h-14 items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <AppLogo />
                        {isExpanded && (
                            <Badge variant="secondary" className="text-xs">
                                Admin
                            </Badge>
                        )}
                    </div>
                    {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
                        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="sr-only">Toggle sidebar</span>
                    </Button> */}
                </div>
                <ScrollArea className="h-full">
                    <div className="space-y-6 py-4">
                        {menuGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="px-3">
                                {/* Group Label - only show when expanded */}
                                {isExpanded && (
                                    <h2 className="mb-2 px-3 text-xs font-semibold tracking-tight text-muted-foreground/70 uppercase">
                                        {group.label}
                                    </h2>
                                )}

                                {/* Group Items */}
                                <div className="space-y-1">{group.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}</div>

                                {/* Add separator between groups except for the last one */}
                                {groupIndex < menuGroups.length - 1 && <Separator className={cn('mt-4', !isExpanded && 'mx-auto w-10')} />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </aside>
        </TooltipProvider>
    );
}
