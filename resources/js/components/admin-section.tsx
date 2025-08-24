import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface AdminSectionProps {
    children: ReactNode;
    title?: string;
    description?: string;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
}

export function AdminSection({ 
    children, 
    title,
    description,
    className,
    headerClassName,
    contentClassName
}: AdminSectionProps) {
    return (
        <section className={cn("space-y-4", className)}>
            {(title || description) && (
                <div className={cn("space-y-1", headerClassName)}>
                    {title && (
                        <h2 className="text-lg font-semibold text-foreground">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className={cn("space-y-4", contentClassName)}>
                {children}
            </div>
        </section>
    );
}