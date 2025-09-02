import AppLogo from '@/components/app-logo';
import { CartSidebar } from '@/components/cart-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WeatherButton from '@/components/weather-button';
import { CartProvider, useCart } from '@/contexts/cart-context';
import { usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Facebook,
    GraduationCap,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Menu,
    Phone,
    Search,
    ShoppingCart,
    Twitter,
    User,
    X,
    Youtube,
} from 'lucide-react';
import React, { useState } from 'react';

interface UserLayoutProps {
    children: React.ReactNode;
}

// Inner component that uses cart context
const UserLayoutContent: React.FC<UserLayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const page = usePage();
    const { toggleCart, getPendingCount } = useCart();

    // Function to check if the current route is active
    const isActiveRoute = (href: string) => {
        // For hash links, check if we're on the home page
        if (href.startsWith('#')) {
            return page.url === '/';
        }
        // For actual routes
        if (href === '/') {
            return page.url === '/';
        }
        return page.url === href || page.url.startsWith(href + '/');
    };

    const navigationItems = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' },
        { name: 'About', href: '/tentang' },
        { name: 'Contact', href: '/kontak' },
    ];

    const pendingCount = getPendingCount();

    return (
        <>
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
                                    const isActive = isActiveRoute(item.href);
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={`relative text-sm font-medium transition-colors hover:text-primary ${
                                                isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {item.name}
                                            {isActive && <span className="absolute right-0 -bottom-6 left-0 h-0.5 bg-primary" />}
                                        </a>
                                    );
                                })}
                            </nav>

                            {/* Desktop Actions */}
                            <div className="hidden items-center space-x-4 md:flex">
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                    <Bell className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" onClick={toggleCart}>
                                    <ShoppingCart className="h-4 w-4" />
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white">
                                            {pendingCount}
                                        </span>
                                    )}
                                </Button>
                                <WeatherButton />
                                <div className="h-6 w-px bg-border" />
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                    <User className="h-4 w-4" />
                                </Button>
                                <Button size="sm">Get Started</Button>
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
                                <nav className="space-y-4">
                                    {navigationItems.map((item) => {
                                        const isActive = isActiveRoute(item.href);
                                        return (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                                                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                                                }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                                                {item.name}
                                            </a>
                                        );
                                    })}
                                    <div className="space-y-4 border-t pt-4">
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <Search className="mr-2 h-4 w-4" />
                                            Search Courses
                                        </Button>
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
                                        <div className="px-2">
                                            <WeatherButton />
                                        </div>
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <User className="mr-2 h-4 w-4" />
                                            My Account
                                        </Button>
                                        <Button size="sm" className="w-full">
                                            Get Started
                                        </Button>
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
                                        <span className="text-xl font-bold">Pare EduHub</span>
                                        <p className="text-sm text-muted-foreground">Platform LMS Terpercaya</p>
                                    </div>
                                </div>
                                <p className="mb-4 max-w-md text-muted-foreground">
                                    Platform pembelajaran online yang menyediakan kursus berkualitas dari dasar hingga advanced. Dapatkan akses ke
                                    materi pembelajaran terbaik dengan harga terjangkau.
                                </p>
                                <div className="flex gap-4">
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                        <Facebook className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                        <Twitter className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                        <Linkedin className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                        <Instagram className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                                        <Youtube className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="mb-4 font-semibold">Quick Links</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#about" className="text-muted-foreground transition-colors hover:text-primary">
                                            About Me
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#courses" className="text-muted-foreground transition-colors hover:text-primary">
                                            All Courses
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#testimonials" className="text-muted-foreground transition-colors hover:text-primary">
                                            Success Stories
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#faq" className="text-muted-foreground transition-colors hover:text-primary">
                                            FAQ
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#contact" className="text-muted-foreground transition-colors hover:text-primary">
                                            Contact
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="mb-4 font-semibold">Hubungi Kami</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>info@pareeduhub.com</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>+62 812-3456-7890</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>Pare, Kediri, Jawa Timur</span>
                                    </li>
                                </ul>

                                <div className="mt-4">
                                    <Badge variant="secondary" className="text-xs">
                                        <BookOpen className="mr-1 h-3 w-3" />
                                        Platform Pembelajaran Terpercaya
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="mt-8 border-t pt-8">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <p className="text-sm text-muted-foreground">© 2025 Pare EduHub. Semua hak dilindungi.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Cart Sidebar */}
            <CartSidebar />
        </>
    );
};

// Main component that provides cart context
const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
    return (
        <CartProvider>
            <UserLayoutContent>{children}</UserLayoutContent>
        </CartProvider>
    );
};

export default UserLayout;
