import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="bg-section-light flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <Link href={route('home')} className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                        <AppLogoIcon className="h-8 w-8" />
                        <span className="title-gradient text-2xl font-semibold">Pare EduHub</span>
                    </Link>
                    <p className="text-medium-contrast text-sm">Platform Kursus Online</p>
                </div>

                <Card className="bg-card-elevated border-0 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="title-gradient text-center text-2xl">{title}</CardTitle>
                        {description && <CardDescription className="text-medium-contrast text-center">{description}</CardDescription>}
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
            <Toaster />
        </div>
    );
}
