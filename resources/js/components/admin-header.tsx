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
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, Bell, HelpCircle, LogOut, Search, Settings, Shield } from 'lucide-react';

interface AdminHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AdminHeader({ breadcrumbs = [] }: AdminHeaderProps) {
    const page = usePage<{ auth: { user: User } }>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left side - Search */}
                <div className="flex items-center space-x-4">
                    <div className="relative w-96">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search users, courses, transactions..." className="pl-10" />
                    </div>
                </div>

                {/* Right side - Notifications and Profile */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
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
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium">New user registered</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">John Doe has joined the platform</p>
                                    <span className="mt-1 text-xs text-muted-foreground">2 minutes ago</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start p-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium">Course completed</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">Advanced React course has been completed</p>
                                    <span className="mt-1 text-xs text-muted-foreground">1 hour ago</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start p-3">
                                    <div className="flex items-center space-x-2">
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
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
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
                                    <Link href={route('profile.edit')} className="flex items-center">
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
                                    <Link href={route('profile.edit')} className="flex items-center">
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
        </header>
    );
}
