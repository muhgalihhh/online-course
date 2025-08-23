import { usePage } from '@inertiajs/react';
import { AlertMessage } from '@/components/alert';

export function FlashMessages() {
    const { flash } = usePage().props as any;

    if (!flash.success && !flash.error && !flash.info && !flash.warning) {
        return null;
    }

    return (
        <div className="space-y-4 mb-6">
            {flash.success && (
                <AlertMessage type="success" message={flash.success} />
            )}
            {flash.error && (
                <AlertMessage type="error" message={flash.error} />
            )}
            {flash.info && (
                <AlertMessage type="info" message={flash.info} />
            )}
            {flash.warning && (
                <AlertMessage type="warning" message={flash.warning} />
            )}
        </div>
    );
}