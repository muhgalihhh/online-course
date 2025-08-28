import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and branding section */}
                <div className="flex flex-col items-center space-y-2">
                    <Link href={route('home')} className="flex items-center space-x-2">
                        <AppLogoIcon className="h-8 w-8" />
                        <span className="text-2xl font-semibold">Pare EduHub</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">Platform Kursus Online</p>
                </div>

                {/* Title and description */}
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                {/* Content section */}
                <div>{children}</div>
            </div>
        </div>
    );
}
