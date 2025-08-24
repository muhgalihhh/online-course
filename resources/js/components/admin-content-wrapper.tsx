import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface AdminContentWrapperProps {
    children: ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function AdminContentWrapper({ 
    children, 
    className,
    padding = 'md' 
}: AdminContentWrapperProps) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-4 lg:p-6',
        lg: 'p-6 lg:p-8',
        none: ''
    };

    return (
        <div className={cn(
            "flex-1 space-y-6",
            paddingClasses[padding],
            "lg:space-y-8",
            className
        )}>
            {children}
        </div>
    );
}