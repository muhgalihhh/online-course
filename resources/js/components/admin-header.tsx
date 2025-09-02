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
import WeatherButton from '@/components/weather-button';
import { useInitials } from '@/hooks/use-initials';
import { useSidebar } from '@/hooks/use-sidebar';
import { type User as UserType } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, HelpCircle, LogOut, Menu, Settings, Shield, User } from 'lucide-react';

interface AdminHeaderProps {
    breadcrumbs?: Array<{ title: string; href?: string }>;
    onToggleSidebar?: () => void;
}

export function AdminHeader({ breadcrumbs = [], onToggleSidebar }: AdminHeaderProps) {
    const page = usePage<{ auth: { user: UserType } }>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { toggleSidebar } = useSidebar();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const handleToggleSidebar = onToggleSidebar ?? toggleSidebar;

    return (
        <header className="w-full border-b bg-background shadow-sm">
            <div className="flex h-16 items-center justify-between px-4">
                {/* Left side - Toggle Sidebar */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleToggleSidebar} className="h-9 w-9 p-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </div>

                {/* Right side - Notifications and Profile */}
                <div className="flex items-center gap-2">
                    <WeatherButton />
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
                                    <Link href={route('admin.help-support')} className="flex items-center">
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
        </header>
    );
}
