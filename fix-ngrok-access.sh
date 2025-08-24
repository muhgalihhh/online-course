#!/bin/bash

echo "🔧 Fixing Ngrok Access Issues for External Devices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get current ngrok URL
get_ngrok_url() {
    local ngrok_url=""
    
    # Try to get from ngrok API
    if command -v curl >/dev/null 2>&1; then
        ngrok_url=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    # If no URL found, prompt user
    if [ -z "$ngrok_url" ]; then
        echo ""
        print_warning "Tidak bisa mendapatkan URL ngrok otomatis"
        echo "Silakan masukkan URL ngrok Anda (contoh: https://abc123.ngrok-free.app):"
        read -p "Ngrok URL: " ngrok_url
    fi
    
    echo "$ngrok_url"
}

# Function to update environment variables
update_env() {
    local ngrok_url=$1
    
    if [ -z "$ngrok_url" ]; then
        print_error "URL ngrok tidak valid!"
        exit 1
    fi
    
    print_status "Updating environment variables for: $ngrok_url"
    
    # Extract domain from URL
    local domain=$(echo "$ngrok_url" | sed 's|https://||' | sed 's|http://||')
    
    # Update .env file
    sed -i "s|APP_URL=.*|APP_URL=$ngrok_url|" .env
    sed -i "s|SESSION_DOMAIN=.*|SESSION_DOMAIN=$domain|" .env
    sed -i "s|VITE_BASE_URL=.*|VITE_BASE_URL=$ngrok_url|" .env
    
    # Add SANCTUM_STATEFUL_DOMAINS if not exists
    if ! grep -q "SANCTUM_STATEFUL_DOMAINS" .env; then
        echo "SANCTUM_STATEFUL_DOMAINS=$domain" >> .env
    else
        sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=$domain|" .env
    fi
    
    # Add CORS_ALLOWED_ORIGINS if not exists
    if ! grep -q "CORS_ALLOWED_ORIGINS" .env; then
        echo "CORS_ALLOWED_ORIGINS=$ngrok_url" >> .env
    else
        sed -i "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=$ngrok_url|" .env
    fi
    
    print_success "Environment variables updated!"
}

# Function to fix vite config
fix_vite_config() {
    local ngrok_url=$1
    local domain=$(echo "$ngrok_url" | sed 's|https://||' | sed 's|http://||')
    
    print_status "Fixing Vite configuration..."
    
    # Create backup
    cp vite.config.ts vite.config.ts.backup
    
    # Update vite.config.ts with proper CORS settings
    cat > vite.config.ts << EOF
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
        host: '0.0.0.0',
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
                '$ngrok_url',
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
        },
        hmr: {
            host: '0.0.0.0',
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
                '$ngrok_url',
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin, Cache-Control'],
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
EOF
    
    print_success "Vite configuration updated!"
}

# Function to clear Laravel cache
clear_laravel_cache() {
    print_status "Clearing Laravel cache..."
    
    if [ -f "artisan" ]; then
        php artisan cache:clear
        php artisan config:clear
        php artisan route:clear
        php artisan view:clear
        print_success "Laravel cache cleared!"
    else
        print_warning "Laravel artisan not found, skipping cache clear"
    fi
}

# Function to check and kill existing processes
check_and_kill_processes() {
    print_status "Checking for existing processes..."
    
    # Check Laravel server
    if pgrep -f "php artisan serve" > /dev/null; then
        print_warning "Killing existing Laravel server..."
        pkill -f "php artisan serve"
        sleep 2
    fi
    
    # Check Vite server
    if pgrep -f "vite" > /dev/null; then
        print_warning "Killing existing Vite server..."
        pkill -f "vite"
        sleep 2
    fi
    
    print_success "Processes checked and cleaned up!"
}

# Function to start servers
start_servers() {
    print_status "Starting development servers..."
    
    # Start Laravel server
    print_status "Starting Laravel server on 0.0.0.0:8000..."
    php artisan serve --host=0.0.0.0 --port=8000 &
    LARAVEL_PID=$!
    
    # Wait for Laravel to start
    sleep 3
    
    # Start Vite server
    print_status "Starting Vite server on 0.0.0.0:5173..."
    export VITE_BASE_URL="$1"
    npm run dev -- --host 0.0.0.0 --port 5173 &
    VITE_PID=$!
    
    print_success "Servers started!"
    echo ""
    echo "🌐 Ngrok URL: $1"
    echo "🔧 Laravel: http://localhost:8000"
    echo "⚡ Vite: http://localhost:5173"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start ngrok: ngrok http 8000"
    echo "2. Access your app via ngrok URL from external device"
    echo ""
    echo "⚠️  Important notes:"
    echo "   - Clear browser cache and cookies on external device"
    echo "   - Make sure both servers are running on 0.0.0.0"
    echo "   - Check CORS settings if still having issues"
    
    # Function to cleanup on exit
    cleanup() {
        print_status "Stopping development servers..."
        kill $LARAVEL_PID 2>/dev/null
        kill $VITE_PID 2>/dev/null
        print_success "Servers stopped"
        exit 0
    }
    
    # Set trap to cleanup on script exit
    trap cleanup SIGINT SIGTERM
    
    # Wait for background processes
    wait
}

# Main execution
main() {
    echo "🚀 Ngrok Access Fix Tool"
    echo "=========================="
    echo ""
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
    fi
    
    # Get ngrok URL
    ngrok_url=$(get_ngrok_url)
    
    if [ -z "$ngrok_url" ]; then
        print_error "Tidak bisa mendapatkan URL ngrok!"
        exit 1
    fi
    
    # Update environment
    update_env "$ngrok_url"
    
    # Fix vite config
    fix_vite_config "$ngrok_url"
    
    # Clear Laravel cache
    clear_laravel_cache
    
    # Check and kill existing processes
    check_and_kill_processes
    
    # Start servers
    start_servers "$ngrok_url"
}

# Run main function
main "$@"