import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { route as ziggyRoute } from 'ziggy-js';
import { Ziggy } from './ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Expose Ziggy's route() globally on the client so calls like route().current() work
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - global declaration is provided in resources/js/types/global.d.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - global declaration is provided in resources/js/types/global.d.ts
window.route = (name?: Parameters<typeof ziggyRoute>[0], params?: Parameters<typeof ziggyRoute>[1], absolute?: Parameters<typeof ziggyRoute>[2]) =>
    ziggyRoute(name as any, params as any, absolute as any, Ziggy as any);

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
