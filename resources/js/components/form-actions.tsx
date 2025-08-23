import { Button } from '@/components/ui/button';
import { Save, X, LucideIcon } from 'lucide-react';

interface FormActionsProps {
    onCancel?: () => void;
    onSubmit?: () => void;
    submitText?: string;
    cancelText?: string;
    submitIcon?: LucideIcon;
    cancelIcon?: LucideIcon;
    loading?: boolean;
    loadingText?: string;
    disabled?: boolean;
    className?: string;
}

export function FormActions({
    onCancel,
    onSubmit,
    submitText = 'Simpan',
    cancelText = 'Batal',
    submitIcon = Save,
    cancelIcon = X,
    loading = false,
    loadingText = 'Menyimpan...',
    disabled = false,
    className = ''
}: FormActionsProps) {
    return (
        <div className={`flex items-center justify-end space-x-3 pt-6 border-t ${className}`}>
            {onCancel && (
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={loading || disabled}
                >
                    {cancelIcon && <cancelIcon className="mr-2 h-4 w-4" />}
                    {cancelText}
                </Button>
            )}
            <Button 
                type="submit" 
                onClick={onSubmit}
                disabled={loading || disabled}
                className="min-w-[120px]"
            >
                {loading ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {loadingText}
                    </>
                ) : (
                    <>
                        {submitIcon && <submitIcon className="mr-2 h-4 w-4" />}
                        {submitText}
                    </>
                )}
            </Button>
        </div>
    );
}