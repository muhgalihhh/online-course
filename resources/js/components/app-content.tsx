import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface AppContentProps {
    children: ReactNode;
    variant?: 'default' | 'sidebar';
    className?: string;
}

export function AppContent({ children, variant = 'default', className }: AppContentProps) {
    return (
        <div
            className={cn(
                'flex-1',
                variant === 'sidebar' && 'min-h-0',
                className
            )}
        >
            {children}
        </div>
    );
}
