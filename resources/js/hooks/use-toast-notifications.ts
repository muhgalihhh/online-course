import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from './use-toast';

export function useToastNotifications() {
    const { toast } = useToast();
    const { flash } = usePage().props;

    useEffect(() => {
        // Success messages
        if (flash.success) {
            toast({
                title: "Berhasil!",
                description: flash.success,
                variant: "success",
            });
        }

        // Error messages
        if (flash.error) {
            toast({
                title: "Error!",
                description: flash.error,
                variant: "destructive",
            });
        }

        // Warning messages
        if (flash.warning) {
            toast({
                title: "Peringatan!",
                description: flash.warning,
                variant: "warning",
            });
        }

        // Info messages
        if (flash.info) {
            toast({
                title: "Informasi!",
                description: flash.info,
                variant: "info",
            });
        }
    }, [flash, toast]);
}