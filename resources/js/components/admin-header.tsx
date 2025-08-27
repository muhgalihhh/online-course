import { GlobalSearch } from '@/components/global-search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useSidebar } from '@/hooks/use-sidebar';
import { type User as UserType } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, Bell, HelpCircle, LogOut, Menu, Search, Settings, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdminHeaderProps {
    breadcrumbs?: Array<{ title: string; href?: string }>;
    onToggleSidebar?: () => void;
}

export function AdminHeader({ breadcrumbs = [], onToggleSidebar }: AdminHeaderProps) {
    const page = usePage<{ auth: { user: UserType } }>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { toggleSidebar } = useSidebar();
    const [searchOpen, setSearchOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const handleToggleSidebar = onToggleSidebar ?? toggleSidebar;

    // Global keyboard shortcut for mobile search (Cmd/Ctrl + K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                // Check if we're on mobile and the desktop search is not visible
                const isDesktopSearchVisible = window.innerWidth >= 640; // sm breakpoint

                if (!isDesktopSearchVisible) {
                    e.preventDefault();
                    setSearchOpen(true);
                }
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4">
                {/* Left side - Toggle Sidebar and Search */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleToggleSidebar} className="h-9 w-9 p-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                    <div className="hidden sm:block sm:w-64 lg:w-80">
                        <GlobalSearch />
                    </div>
                </div>

                {/* Right side - Notifications and Profile */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Button */}
                    <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden" onClick={() => setSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                <Bell className="h-5 w-5" />
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                                    3
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-64 overflow-y-auto">
                                <DropdownMenuItem className="flex flex-col items-start p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium">New user registered</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">John Doe has joined the platform</p>
                                    <span className="mt-1 text-xs text-muted-foreground">2 minutes ago</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium">Course completed</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">Advanced React course has been completed</p>
                                    <span className="mt-1 text-xs text-muted-foreground">1 hour ago</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                        <span className="text-sm font-medium">System update</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">New features have been deployed</p>
                                    <span className="mt-1 text-xs text-muted-foreground">3 hours ago</span>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="#" className="w-full text-center">
                                    View all notifications
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={auth.user.profile_photo_url} alt={auth.user.name} />
                                    <AvatarFallback className="text-xs">{getInitials(auth.user.name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm leading-none font-medium">{auth.user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{auth.user.email}</p>
                                    <Badge variant="secondary" className="mt-1 w-fit">
                                        <Shield className="mr-1 h-3 w-3" />
                                        {auth.user.role}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href={route('admin.settings')} className="flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('admin.dashboard')} className="flex items-center">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('admin.settings')} className="flex items-center">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="#" className="flex items-center">
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        <span>Help & Support</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Search Dialog */}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
