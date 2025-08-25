import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:8000',
                'http://127.0.0.1:8000',
                'https://*.ngrok-free.app',
                'https://*.ngrok.io',
                'https://*.ngrok.app',
                'https://*.ngrok.dev',
                'https://*.ngrok.com',
                'https://joint-strongly-bulldog.ngrok-free.app',
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
        },
        hmr: {
            // --- DAN PERUBAHAN DI SINI ---
            host: 'localhost', // Pastikan HMR juga menggunakan localhost
            port: 5173,
            protocol: 'ws',
            clientPort: 5173,
            overlay: false,
        },
        watch: {
            usePolling: true,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control',
            'Access-Control-Allow-Credentials': 'true',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        origin: 'http://localhost:5173',
    },
    preview: {
        host: '0.0.0.0',
        port: 5173,
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:8000',
                'http://127.0.0.1:8000',
                'https://*.ngrok-free.app',
                'https://*.ngrok.io',
                'https://*.ngrok.app',
                'https://*.ngrok.dev',
                'https://*.ngrok.com',
                'https://joint-strongly-bulldog.ngrok-free.app',
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
});
