import { PageTransition } from '@/components/animations';
import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { CartSidebar } from '@/components/cart-sidebar';
import LiveChatWidget from '@/components/live-chat-widget';
import { FacebookIcon, InstagramIcon, TikTokIcon, TwitterIcon } from '@/components/social-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/toaster';
import WeatherDropdown from '@/components/weather-dropdown';
import { CartProvider, useCart } from '@/contexts/cart-context';
import { useAuth } from '@/hooks/use-auth';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Globe, GraduationCap, HelpCircle, LogOut, Menu, Settings, ShoppingCart, Smartphone, User, X } from 'lucide-react';
import React, { useState } from 'react';

interface Institution {
    id: number;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    photo_path?: string;
    // Social media links
    tiktok_url?: string;
    instagram_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    // Mobile app links
    ios_app_url?: string;
    android_app_url?: string;
}

interface PageProps {
    institution?: Institution;
    [key: string]: unknown;
}

interface GuestLayoutProps {
    children: React.ReactNode;
}

// Helper component for mobile grouped navigation (dropdown / accordion style)
interface MobileGroupItem {
    name: string;
    requiresAuth?: boolean;
    children: { name: string; href: string; requiresAuth?: boolean }[];
}

interface MobileNavGroupProps {
    item: MobileGroupItem;
    isActiveLink: (href: string) => boolean;
    isAuthenticated: boolean;
    closeMenu: () => void;
}

const MobileNavGroup: React.FC<MobileNavGroupProps> = ({ item, isActiveLink, isAuthenticated, closeMenu }) => {
    const isAnyActive = item.children.some((c) => isActiveLink(c.href));
    const [open, setOpen] = useState(isAnyActive);
    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`flex w-full items-center justify-between text-left text-sm font-medium transition-colors hover:text-primary ${
                    isAnyActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                }`}
            >
                <span className="flex items-center gap-2">
                    {isAnyActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                    {item.name}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            {open && (
                <div className="ml-4 space-y-2 border-l pl-4">
                    {item.children.map((child) => {
                        const isActive = isActiveLink(child.href);
                        const handleClick = (e: React.MouseEvent) => {
                            if (child.requiresAuth && !isAuthenticated) {
                                e.preventDefault();
                                // redirect to login
                            }
                            closeMenu();
                        };
                        return (
                            <Link
                                key={child.name}
                                href={child.href}
                                onClick={handleClick}
                                className={`block text-sm transition-colors hover:text-primary ${
                                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                                }`}
                            >
                                {child.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Inner component that uses cart context
const GuestLayoutContent: React.FC<GuestLayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, isAdmin } = useAuth();
    const { institution, url } = usePage<PageProps & { url: string }>().props;
    const { toggleCart, getPendingCount } = useCart();

    // Initialize toast notifications
    useToastNotifications();

    const pendingCount = getPendingCount();

    const handleLogout = () => {
        router.post('/logout');
    };

    const getInitials = (name: string) => {
        return (
            name
                ?.split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'
        );
    };

    // Function to check if a link is active
    const isActiveLink = (href: string) => {
        if (href === '/') {
            return url === '/';
        }
        return url.startsWith(href);
    };

    const navigationItems: Array<
        | { name: string; href: string; requiresAuth?: boolean; children?: undefined }
        | { name: string; requiresAuth?: boolean; children: { name: string; href: string; requiresAuth?: boolean }[] }
    > = [
        { name: 'Beranda', href: '/', requiresAuth: false },
        {
            name: 'Kelas',
            children: [
                { name: 'Kelas Free', href: '/kelas-free', requiresAuth: false },
                { name: 'Kelas Pro', href: '/kelas-pro', requiresAuth: false },
            ],
        },
        {
            name: isAdmin ? 'Dashboard Admin' : 'Kelas Anda',
            href: isAdmin ? '/admin/dashboard' : isAuthenticated ? '/user/my-courses' : '/dashboard',
            requiresAuth: false,
        },
        {
            name: 'Informasi',
            children: [
                { name: 'Tentang Kami', href: '/tentang', requiresAuth: false },
                { name: 'Galeri', href: '/galeri', requiresAuth: false },
                { name: 'FAQ', href: '/faq', requiresAuth: false },
            ],
        },
        {
            name: 'Lainnya',
            children: [
                { name: 'Akomodasi', href: '/accommodations', requiresAuth: false },
                { name: 'Lembaga Lain', href: '/lembaga-lain', requiresAuth: false },
            ],
        },
    ];

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
                                // Dropdown group
                                if ('children' in item && item.children) {
                                    const isAnyActive = item.children.some((c) => isActiveLink(c.href));
                                    return (
                                        <DropdownMenu key={item.name}>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className={`relative text-sm font-medium transition-all hover:text-primary ${
                                                        isAnyActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                                                    } flex items-center gap-1`}
                                                >
                                                    {item.name}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-3 w-3 transition-transform ${isAnyActive ? 'rotate-180' : ''}`}
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    {isAnyActive && (
                                                        <span className="absolute right-0 -bottom-[21px] left-0 h-[3px] rounded-t-sm bg-primary" />
                                                    )}
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                {item.children.map((child) => {
                                                    const isActive = isActiveLink(child.href);
                                                    return (
                                                        <DropdownMenuItem key={child.name} asChild>
                                                            <Link
                                                                href={child.href}
                                                                className={`text-sm ${isActive ? 'font-semibold text-primary' : ''}`}
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                }

                                // Simple link item
                                const isActive = isActiveLink(item.href);
                                const handleClick = (e: React.MouseEvent) => {
                                    if (item.requiresAuth && !isAuthenticated) {
                                        e.preventDefault();
                                        router.visit('/login', {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }
                                };
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={handleClick}
                                        className={`relative text-sm font-medium transition-all hover:text-primary ${
                                            isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {item.name}
                                        {isActive && <span className="absolute right-0 -bottom-[21px] left-0 h-[3px] rounded-t-sm bg-primary" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden items-center space-x-4 md:flex">
                            {!isAdmin && (
                                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" onClick={toggleCart}>
                                    <ShoppingCart className="h-4 w-4" />
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white">
                                            {pendingCount}
                                        </span>
                                    )}
                                </Button>
                            )}
                            <WeatherDropdown defaultLocation={institution?.address || 'Pare, Kediri'} />
                            <AppearanceToggleDropdown />
                            <div className="h-6 w-px bg-border" />
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.profile_photo_url} alt={user.name} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm leading-none font-medium">{user.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={isAdmin ? '/admin/dashboard' : '/user/my-courses'} className="cursor-pointer">
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                <span>{isAdmin ? 'Dashboard Admin' : 'Kelas Saya'}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/user/profile" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Pengaturan</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/help" className="cursor-pointer">
                                                <HelpCircle className="mr-2 h-4 w-4" />
                                                <span>Bantuan</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Keluar</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm">
                                        <Link href="/register">Daftar</Link>
                                    </Button>
                                    <Button size="sm">
                                        <Link href="/login">Masuk</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="border-t py-4 md:hidden">
                            <nav className="space-y-4">
                                {navigationItems.map((item) => {
                                    if ('children' in item && item.children) {
                                        return (
                                            <MobileNavGroup
                                                key={item.name}
                                                item={item}
                                                isActiveLink={isActiveLink}
                                                isAuthenticated={isAuthenticated}
                                                closeMenu={() => setIsMobileMenuOpen(false)}
                                            />
                                        );
                                    }
                                    // Simple item
                                    const isActive = isActiveLink(item.href);
                                    const handleClick = (e: React.MouseEvent) => {
                                        if (item.requiresAuth && !isAuthenticated) {
                                            e.preventDefault();
                                            router.visit('/login', { preserveState: true, preserveScroll: true });
                                        }
                                        setIsMobileMenuOpen(false);
                                    };
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`block text-sm font-medium transition-colors hover:text-primary ${
                                                isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                                            }`}
                                            onClick={handleClick}
                                        >
                                            <span className="flex items-center gap-2">
                                                {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                                <div className="space-y-4 border-t pt-4">
                                    {!isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="relative w-full justify-start"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                toggleCart();
                                            }}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Keranjang
                                            {pendingCount > 0 && (
                                                <Badge variant="outline" className="ml-auto border-yellow-500 bg-yellow-500 text-white">
                                                    {pendingCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    )}
                                    <div className="px-2">
                                        <WeatherDropdown defaultLocation={institution?.address || 'Pare, Kediri'} />
                                    </div>
                                    {isAuthenticated && user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 px-2 py-1">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profile_photo_url} alt={user.name} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Link
                                                    href="/dashboard"
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                >
                                                    <User className="h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href={isAdmin ? '/admin/dashboard' : '/user/my-courses'}
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    {isAdmin ? 'Dashboard Admin' : 'Kelas Saya'}
                                                </Link>
                                                <Link
                                                    href="/user/profile"
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Pengaturan
                                                </Link>
                                                <Link
                                                    href="/help"
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                >
                                                    <HelpCircle className="h-4 w-4" />
                                                    Bantuan
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Keluar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Link href="/register">Daftar</Link>
                                            </Button>
                                            <Button size="sm" className="flex-1">
                                                <Link href="/login">Masuk</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main>
                <PageTransition>{children}</PageTransition>
            </main>

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
                                {institution?.description ||
                                    'Platform pembelajaran online personal yang menyediakan kursus berkualitas dari dasar hingga advanced. Dapatkan akses ke materi pembelajaran terbaik dengan harga terjangkau.'}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {/* Social Media Links */}
                                {institution?.facebook_url && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook">
                                            <FacebookIcon className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {institution?.instagram_url && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram">
                                            <InstagramIcon className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {institution?.twitter_url && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.twitter_url} target="_blank" rel="noopener noreferrer" title="Twitter">
                                            <TwitterIcon className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {institution?.tiktok_url && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.tiktok_url} target="_blank" rel="noopener noreferrer" title="TikTok">
                                            <TikTokIcon className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {institution?.website && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.website} target="_blank" rel="noopener noreferrer" title="Website">
                                            <Globe className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {/* Mobile App Links */}
                                {institution?.ios_app_url && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.ios_app_url} target="_blank" rel="noopener noreferrer" title="iOS App">
                                            <Smartphone className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {institution?.android_app_url && (
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0" asChild>
                                        <a href={institution.android_app_url} target="_blank" rel="noopener noreferrer" title="Android App">
                                            <Smartphone className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {/* Default Education Icon if no social media */}
                                {!institution?.facebook_url &&
                                    !institution?.instagram_url &&
                                    !institution?.twitter_url &&
                                    !institution?.tiktok_url &&
                                    !institution?.website &&
                                    !institution?.ios_app_url &&
                                    !institution?.android_app_url && (
                                        <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                            <BookOpen className="h-4 w-4" />
                                        </Button>
                                    )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="mb-4 font-semibold">Menu Utama</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href={isAuthenticated ? '/kelas-pro' : '/login'}
                                        className="text-muted-foreground transition-colors hover:text-primary"
                                        onClick={(e) => {
                                            if (!isAuthenticated) {
                                                e.preventDefault();
                                                router.visit('/login');
                                            }
                                        }}
                                    >
                                        Kelas Pro
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={isAuthenticated ? '/kelas-free' : '/login'}
                                        className="text-muted-foreground transition-colors hover:text-primary"
                                        onClick={(e) => {
                                            if (!isAuthenticated) {
                                                e.preventDefault();
                                                router.visit('/login');
                                            }
                                        }}
                                    >
                                        Kelas Free
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
                                        Platform Pembelajaran Terpercaya
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t pt-8">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">© 2025 {institution?.name || 'Pare EduHub'}. Semua hak dilindungi.</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Toast Notifications */}
            <Toaster />

            {/* Live Chat Widget */}
            <LiveChatWidget />

            {/* Cart Sidebar */}
            <CartSidebar />
        </div>
    );
};

// Main component that provides cart context
const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
    return (
        <CartProvider>
            <GuestLayoutContent>{children}</GuestLayoutContent>
        </CartProvider>
    );
};

export default GuestLayout;
