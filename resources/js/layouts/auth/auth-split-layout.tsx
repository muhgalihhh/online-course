import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid min-h-screen lg:grid-cols-2">
            {/* Left side panel */}
            <div className="relative hidden flex-col bg-muted p-10 text-muted-foreground lg:flex">
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon className="mr-2 h-6 w-6" />
                    <span className="font-semibold">{name || 'Pare EduHub'}</span>
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            
            {/* Right side content */}
            <div className="flex items-center justify-center p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 lg:hidden">
                        <Link href={route('home')} className="flex items-center space-x-2">
                            <AppLogoIcon className="h-8 w-8" />
                            <span className="text-2xl font-semibold">Pare EduHub</span>
                        </Link>
                    </div>
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
