import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface AdminFormProps {
    title?: string;
    description?: string;
    children: ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel?: () => void;
    loading?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
}

export function AdminForm({
    title,
    description,
    children,
    onSubmit,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    onCancel,
    loading = false,
    className,
    headerClassName,
    contentClassName
}: AdminFormProps) {
    return (
        <Card className={className}>
            {(title || description) && (
                <CardHeader className={headerClassName}>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </CardHeader>
            )}
            <CardContent className={contentClassName}>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {children}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                {cancelLabel}
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}