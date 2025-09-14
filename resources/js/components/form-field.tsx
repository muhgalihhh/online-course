import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormFieldProps {
    label?: string;
    error?: string;
    description?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}

export function FormField({ label, error, description, required = false, children, className }: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="ml-1 text-destructive">*</span>}
                </Label>
            )}
            {children}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
