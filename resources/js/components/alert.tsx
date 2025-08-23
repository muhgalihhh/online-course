import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

export function AlertMessage({ type, message }: AlertProps) {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4" />;
            case 'error':
                return <XCircle className="h-4 w-4" />;
            case 'info':
                return <Info className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getVariant = () => {
        switch (type) {
            case 'success':
                return 'default';
            case 'error':
                return 'destructive';
            case 'info':
                return 'default';
            case 'warning':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <Alert variant={getVariant()}>
            {getIcon()}
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}