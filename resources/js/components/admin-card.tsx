import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface AdminCardProps {
    children: ReactNode;
    title?: string;
    description?: string;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function AdminCard({ 
    children, 
    title,
    description,
    className,
    headerClassName,
    contentClassName,
    padding = 'md'
}: AdminCardProps) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        none: ''
    };

    return (
        <div className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            className
        )}>
            {(title || description) && (
                <div className={cn(
                    "border-b bg-muted/50 px-6 py-4",
                    headerClassName
                )}>
                    {title && (
                        <h3 className="text-lg font-semibold text-foreground">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className={cn(
                paddingClasses[padding],
                contentClassName
            )}>
                {children}
            </div>
        </div>
    );
}