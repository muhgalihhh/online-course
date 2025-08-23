import { useToast } from './use-toast';

export function useFormToast() {
    const { toast } = useToast();

    const showSuccess = (message: string) => {
        toast({
            title: "Berhasil!",
            description: message,
            variant: "success",
        });
    };

    const showError = (message: string) => {
        toast({
            title: "Error!",
            description: message,
            variant: "destructive",
        });
    };

    const showWarning = (message: string) => {
        toast({
            title: "Peringatan!",
            description: message,
            variant: "warning",
        });
    };

    const showInfo = (message: string) => {
        toast({
            title: "Informasi!",
            description: message,
            variant: "info",
        });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}