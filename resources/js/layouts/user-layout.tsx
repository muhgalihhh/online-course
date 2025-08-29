import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LiveChatWidget from '@/components/live-chat-widget';
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

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { name: 'Home', href: '#', active: true },
        { name: 'Courses', href: '#courses' },
        { name: 'About', href: '#about' },
        { name: 'Contact', href: '#contact' },
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
                                <p className="text-xs text-muted-foreground">by John Doe</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center space-x-8 md:flex">
                            {navigationItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors hover:text-primary ${
                                        item.active ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden items-center space-x-4 md:flex">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <div className="h-6 w-px bg-border" />
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <User className="h-4 w-4" />
                            </Button>
                            <Button size="sm">Get Started</Button>
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
                                {navigationItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`block text-sm font-medium transition-colors hover:text-primary ${
                                            item.active ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                                <div className="space-y-4 border-t pt-4">
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search Courses
                                    </Button>
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
                                    <span className="text-xl font-bold">LearnCraft</span>
                                    <p className="text-sm text-muted-foreground">by John Doe</p>
                                </div>
                            </div>
                            <p className="mb-4 max-w-md text-muted-foreground">
                                Empowering individuals through personalized online education. Learn practical skills from real-world experience and
                                transform your career.
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
                            <h4 className="mb-4 font-semibold">Get in Touch</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>john@learncraft.com</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>+1 (555) 123-4567</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>San Francisco, CA</span>
                                </li>
                            </ul>

                            <div className="mt-4">
                                <Badge variant="secondary" className="text-xs">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    10+ Years Experience
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t pt-8">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">© 2025 LearnCraft by John Doe. All rights reserved.</p>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <a href="#" className="transition-colors hover:text-primary">
                                    Privacy Policy
                                </a>
                                <a href="#" className="transition-colors hover:text-primary">
                                    Terms of Service
                                </a>
                                <a href="#" className="transition-colors hover:text-primary">
                                    Refund Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Live Chat Widget - Available for authenticated users */}
            <LiveChatWidget />
        </div>
    );
};
export default UserLayout;
