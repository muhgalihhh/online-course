import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface CustomAlertProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    actionLabel?: string;
    onAction?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    open,
    onClose,
    title = 'Perhatian',
    description,
    type = 'info',
    actionLabel = 'OK',
    onAction
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'warning':
                return <AlertCircle className="h-6 w-6 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-6 w-6 text-red-500" />;
            default:
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const handleAction = () => {
        if (onAction) {
            onAction();
        }
        onClose();
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="mt-3">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleAction}>
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CustomAlert;