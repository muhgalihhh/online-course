import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    backUrl?: string;
    badge?: {
        text: string;
        icon?: LucideIcon;
        variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    };
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ 
    title, 
    description, 
    backUrl, 
    badge, 
    actions,
    className
}: PageHeaderProps) {
    const handleBack = () => {
        if (backUrl) {
            router.visit(backUrl);
        } else {
            router.back();
        }
    };

    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <div className="flex items-start gap-4">
                {backUrl && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBack}
                        className="h-8 w-8 p-0 shrink-0 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Go back</span>
                    </Button>
                )}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {badge && (
                            <Badge variant={badge.variant || 'outline'} className="flex items-center gap-1">
                                {badge.icon && <badge.icon className="h-3 w-3" />}
                                <span>{badge.text}</span>
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}