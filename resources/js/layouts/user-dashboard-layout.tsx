import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LiveChatWidget from '@/components/live-chat-widget';
import { CartProvider, useCart } from '@/contexts/cart-context';
import { CartSidebar } from '@/components/cart-sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    BookOpen,
    GraduationCap,
    Menu,
    X,
    User,
    Settings,
    LogOut,
    ShoppingBag,
    ShoppingCart,
    Heart,
    History,
    CreditCard,
    HelpCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { usePage } from '@inertiajs/react';

interface Institution {
    id: number;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    photo_path?: string;
}

interface PageProps {
    institution?: Institution;
}

interface UserDashboardLayoutProps {
    children: React.ReactNode;
}

// Inner component that uses cart context
const UserDashboardLayoutContent: React.FC<UserDashboardLayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const { institution, url } = usePage<PageProps & { url: string }>().props;
    const { toggleCart, getPendingCount } = useCart();
    
    // Initialize toast notifications
    useToastNotifications();
    
    const pendingCount = getPendingCount();

    // Function to check if a link is active
    const isActiveLink = (href: string) => {
        if (href === '/') {
            return url === '/';
        }
        return url.startsWith(href);
    };

    const navigationItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Kelas Saya', href: '/user/my-courses' },
        { name: 'Tentang Kami', href: '/tentang' },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <AppLogo />
                            <div>
                                <span className="text-xl font-bold">Pare EduHub</span>
                                <p className="text-xs text-muted-foreground">Platform LMS Terpercaya</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center space-x-8 md:flex">
                            {navigationItems.map((item) => {
                                const isActive = isActiveLink(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`relative text-sm font-medium transition-all hover:text-primary ${
                                            isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {item.name}
                                        {isActive && (
                                            <span className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-primary rounded-t-sm" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden items-center space-x-4 md:flex">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="relative h-9 w-9 p-0"
                                onClick={toggleCart}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-[10px] font-bold text-white flex items-center justify-center">
                                        {pendingCount}
                                    </span>
                                )}
                            </Button>
                            <AppearanceToggleDropdown />
                            <div className="h-6 w-px bg-border" />
                            
                            {/* Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.avatar} alt={user?.name} />
                                            <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/user/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/user/my-courses" className="cursor-pointer">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            <span>Kelas Saya</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={handleLogout}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Keluar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile menu button */}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 w-9 p-0 md:hidden" 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="border-t py-4 md:hidden">
                            {/* Mobile User Info */}
                            <div className="mb-4 flex items-center gap-3 px-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user?.avatar} alt={user?.name} />
                                    <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-4">
                                {navigationItems.map((item) => {
                                    const isActive = isActiveLink(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`block text-sm font-medium transition-colors hover:text-primary ${
                                                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                                            }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span className="flex items-center gap-2">
                                                {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                                
                                <div className="space-y-2 border-t pt-4">
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            toggleCart();
                                        }}
                                        className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        <span>Keranjang</span>
                                        {pendingCount > 0 && (
                                            <Badge variant="outline" className="ml-auto bg-yellow-500 text-white border-yellow-500 text-xs">
                                                {pendingCount}
                                            </Badge>
                                        )}
                                    </button>
                                    <Link
                                        href="/user/profile"
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex w-full items-center gap-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Keluar
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="text-xl font-bold">{institution?.name || 'Pare EduHub'}</span>
                                    <p className="text-sm text-muted-foreground">Platform Kursus Online Personal</p>
                                </div>
                            </div>
                            <p className="mb-4 max-w-md text-muted-foreground">
                                {institution?.description || 'Platform pembelajaran online personal yang menyediakan kursus berkualitas dari dasar hingga advanced. Dapatkan akses ke materi pembelajaran terbaik dengan harga terjangkau.'}
                            </p>
                            <div className="flex gap-4">
                                <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                    <BookOpen className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="mb-4 font-semibold">Menu Utama</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-primary">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/user/my-courses" className="text-muted-foreground transition-colors hover:text-primary">
                                        Kelas Saya
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tentang" className="text-muted-foreground transition-colors hover:text-primary">
                                        Tentang Kami
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="mb-4 font-semibold">Hubungi Kami</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>📧</span>
                                    <span>{institution?.email || 'info@pareeduhub.com'}</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>📞</span>
                                    <span>{institution?.phone || '+62 812-3456-7890'}</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>📍</span>
                                    <span>{institution?.address || 'Pare, Kediri, Jawa Timur'}</span>
                                </li>
                            </ul>

                            <div className="mt-4">
                                <div className="text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        500+ Kursus Tersedia
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t pt-8">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">© 2025 {institution?.name || 'Pare EduHub'}. Semua hak dilindungi.</p>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <Link href="/privacy" className="transition-colors hover:text-primary">
                                    Kebijakan Privasi
                                </Link>
                                <Link href="/terms" className="transition-colors hover:text-primary">
                                    Syarat & Ketentuan
                                </Link>
                                <Link href="/refund" className="transition-colors hover:text-primary">
                                    Kebijakan Pengembalian
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Live Chat Widget - Only for Users */}
            <LiveChatWidget />
            
            {/* Toast Notifications */}
            <Toaster />
            
            {/* Cart Sidebar */}
            <CartSidebar />
        </div>
    );
};

// Main component that provides cart context
const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
    return (
        <CartProvider>
            <UserDashboardLayoutContent>{children}</UserDashboardLayoutContent>
        </CartProvider>
    );
};

export default UserDashboardLayout;