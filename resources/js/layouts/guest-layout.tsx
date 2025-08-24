import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    GraduationCap,
    Menu,
    Search,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

interface GuestLayoutProps {
    children: React.ReactNode;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { name: 'Beranda', href: '/', active: true },
        { name: 'Katalog Lembaga', href: '/katalog-lembaga' },
        { name: 'Kelas Pro', href: '/kelas-pro' },
        { name: 'Kelas Free', href: '/kelas-free' },
        { name: 'Tentang', href: '/tentang' },
        { name: 'Kontak', href: '/kontak' },
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
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors hover:text-primary ${
                                        item.active ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden items-center space-x-4 md:flex">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <Search className="h-4 w-4" />
                            </Button>
                            <AppearanceToggleDropdown />
                            <div className="h-6 w-px bg-border" />
                            <Button variant="outline" size="sm">
                                Daftar
                            </Button>
                            <Button size="sm">
                                <Link href="/login">Masuk</Link>
                            </Button>
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
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`block text-sm font-medium transition-colors hover:text-primary ${
                                            item.active ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="space-y-4 border-t pt-4">
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                        <Search className="mr-2 h-4 w-4" />
                                        Cari Kursus
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Daftar
                                        </Button>
                                        <Button size="sm" className="flex-1">
                                            <Link href="/login">Masuk</Link>
                                        </Button>
                                    </div>
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
                                Platform pembelajaran online terdepan yang menghubungkan lembaga pendidikan dengan peserta didik. 
                                Akses ribuan kursus berkualitas dari lembaga terpercaya di seluruh Indonesia.
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
                                    <Link href="/katalog-lembaga" className="text-muted-foreground transition-colors hover:text-primary">
                                        Katalog Lembaga
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kelas-pro" className="text-muted-foreground transition-colors hover:text-primary">
                                        Kelas Pro
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kelas-free" className="text-muted-foreground transition-colors hover:text-primary">
                                        Kelas Free
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tentang" className="text-muted-foreground transition-colors hover:text-primary">
                                        Tentang Kami
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kontak" className="text-muted-foreground transition-colors hover:text-primary">
                                        Kontak
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
                                    <span>info@pareeduhub.com</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>📞</span>
                                    <span>+62 812-3456-7890</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>📍</span>
                                    <span>Pare, Kediri, Jawa Timur</span>
                                </li>
                            </ul>

                            <div className="mt-4">
                                <div className="text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        100+ Lembaga Terdaftar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t pt-8">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">© 2025 Pare EduHub. Semua hak dilindungi.</p>
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
        </div>
    );
};

export default GuestLayout;