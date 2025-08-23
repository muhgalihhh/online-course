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
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 md:p-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-blue-600/20 blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/80 dark:shadow-slate-900/50">
                    <div className="flex flex-col gap-8">
                        {/* Logo and branding section */}
                        <div className="flex flex-col items-center gap-6">
                            <Link href={route('home')} className="group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-xl transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-purple-600/30"></div>
                                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-lg ring-1 ring-slate-200/50 transition-all duration-300 group-hover:shadow-xl dark:from-slate-800 dark:to-slate-700 dark:ring-slate-700/50">
                                        <AppLogoIcon className="h-16 w-16 transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            {/* Title and description */}
                            <div className="space-y-3 text-center">
                                <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300">
                                    {title}
                                </h1>
                                {description && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>}
                            </div>
                        </div>

                        {/* Content section */}
                        <div className="space-y-4">{children}</div>
                    </div>
                </div>

                {/* Footer decoration */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Secure • Reliable • Fast</p>
                </div>
            </div>
        </div>
    );
}
