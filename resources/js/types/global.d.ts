import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;

    interface Window {
        Tawk_API?: {
            onLoad?: () => void;
            setAttributes?: (attributes: Record<string, unknown>, callback?: (error: unknown) => void) => void;
            hideWidget?: () => void;
            minimize?: () => void;
            maximize?: () => void;
            addEvent?: (event: Record<string, unknown>) => void;
            onChatMessageVisitor?: (message: unknown) => void;
            onChatMessageAgent?: (message: unknown) => void;
            onChatEnded?: () => void;
            [key: string]: unknown;
        };
        Tawk_LoadStart?: Date;
    }
}
