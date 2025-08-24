import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className={className}>
            {(title || description) && (
                <CardHeader className={cn("border-b bg-muted/50", headerClassName)}>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </CardHeader>
            )}
            <CardContent className={cn(
                paddingClasses[padding],
                contentClassName
            )}>
                {children}
            </CardContent>
        </Card>
    );
}