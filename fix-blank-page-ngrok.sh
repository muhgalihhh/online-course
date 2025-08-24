#!/bin/bash

echo "🔧 Fixing Ngrok Blank Page Issue..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to get ngrok URL from user
get_ngrok_url() {
    echo ""
    print_status "Please enter your ngrok URL (e.g., https://abc123.ngrok-free.app):"
    read -p "Ngrok URL: " NGROK_URL
    
    if [[ -z "$NGROK_URL" ]]; then
        print_error "Ngrok URL is required!"
        exit 1
    fi
    
    # Extract domain from URL
    NGROK_DOMAIN=$(echo "$NGROK_URL" | sed 's|https://||' | sed 's|http://||')
    print_success "Using domain: $NGROK_DOMAIN"
}

# Function to update environment variables
update_env() {
    print_status "Updating environment variables..."
    
    # Update APP_URL
    if grep -q "APP_URL=" .env; then
        sed -i "s|APP_URL=.*|APP_URL=$NGROK_URL|" .env
    else
        echo "APP_URL=$NGROK_URL" >> .env
    fi
    
    # Update SESSION_DOMAIN
    if grep -q "SESSION_DOMAIN=" .env; then
        sed -i "s|SESSION_DOMAIN=.*|SESSION_DOMAIN=.ngrok-free.app|" .env
    else
        echo "SESSION_DOMAIN=.ngrok-free.app" >> .env
    fi
    
    # Update VITE_BASE_URL
    if grep -q "VITE_BASE_URL=" .env; then
        sed -i "s|VITE_BASE_URL=.*|VITE_BASE_URL=$NGROK_URL|" .env
    else
        echo "VITE_BASE_URL=$NGROK_URL" >> .env
    fi
    
    # Add VITE_DEV_SERVER_URL for external access
    if grep -q "VITE_DEV_SERVER_URL=" .env; then
        sed -i "s|VITE_DEV_SERVER_URL=.*|VITE_DEV_SERVER_URL=$NGROK_URL|" .env
    else
        echo "VITE_DEV_SERVER_URL=$NGROK_URL" >> .env
    fi
    
    print_success "Environment variables updated"
}

# Function to create improved vite config for ngrok
create_vite_config() {
    print_status "Creating improved Vite configuration for ngrok..."
    
    cat > vite.config.ngrok.ts << 'EOF'
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
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
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
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        },
    },
});
EOF

    print_success "Vite configuration created for ngrok"
}

# Function to create startup script
create_startup_script() {
    print_status "Creating startup script for ngrok..."
    
    cat > start-ngrok-fixed.sh << EOF
#!/bin/bash

echo "🚀 Starting Laravel + Vite for Ngrok (Fixed Version)..."

# Set environment variables
export VITE_BASE_URL="$NGROK_URL"
export VITE_DEV_SERVER_URL="$NGROK_URL"

# Kill existing processes
pkill -f "php artisan serve" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Start Laravel server
echo "Starting Laravel server on 0.0.0.0:8000..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=\$!

# Wait for Laravel to start
sleep 3

# Start Vite with ngrok config
echo "Starting Vite server on 0.0.0.0:5173..."
npm run dev -- --config vite.config.ngrok.ts --host 0.0.0.0 --port 5173 &
VITE_PID=\$!

echo ""
echo "✅ Servers started successfully!"
echo "🌐 Ngrok URL: $NGROK_URL"
echo "🔧 Laravel: http://localhost:8000"
echo "⚡ Vite: http://localhost:5173"
echo ""
echo "📋 Next steps:"
echo "1. Start ngrok: ngrok http 8000"
echo "2. Access your app via ngrok URL"
echo ""
echo "⚠️  Important:"
echo "   - Clear browser cache and cookies"
echo "   - Use incognito mode for testing"
echo "   - Check browser console for errors"

# Cleanup function
cleanup() {
    echo "Stopping servers..."
    kill \$LARAVEL_PID 2>/dev/null
    kill \$VITE_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
EOF

    chmod +x start-ngrok-fixed.sh
    print_success "Startup script created: start-ngrok-fixed.sh"
}

# Function to create troubleshooting guide
create_troubleshooting_guide() {
    print_status "Creating troubleshooting guide..."
    
    cat > NGROK_BLANK_PAGE_FIX.md << 'EOF'
# Ngrok Blank Page Fix Guide

## Masalah yang Diatasi
- Blank page saat mengakses ngrok dari device lain
- CORS errors
- Asset loading issues
- HMR (Hot Module Replacement) tidak berfungsi

## Solusi yang Diterapkan

### 1. Environment Variables
- `APP_URL`: URL ngrok lengkap
- `SESSION_DOMAIN`: Domain ngrok untuk session
- `VITE_BASE_URL`: Base URL untuk Vite
- `VITE_DEV_SERVER_URL`: Dev server URL untuk external access

### 2. Vite Configuration
- Host binding ke `0.0.0.0` untuk external access
- CORS configuration untuk domain ngrok
- HMR configuration yang benar untuk external devices
- WebSocket protocol configuration

### 3. Server Configuration
- Laravel server berjalan di `0.0.0.0:8000`
- Vite server berjalan di `0.0.0.0:5173`
- CORS headers yang benar

## Cara Menggunakan

### 1. Jalankan Script Perbaikan
```bash
./fix-blank-page-ngrok.sh
```

### 2. Start Servers
```bash
./start-ngrok-fixed.sh
```

### 3. Start Ngrok
```bash
ngrok http 8000
```

## Troubleshooting

### Jika masih blank page:
1. Clear browser cache dan cookies
2. Gunakan incognito mode
3. Periksa browser console untuk errors
4. Pastikan ngrok tunnel aktif
5. Coba akses dari device yang berbeda

### CORS Errors:
1. Pastikan domain ngrok sudah benar di .env
2. Restart servers setelah update .env
3. Clear Laravel cache: `php artisan cache:clear`

### HMR tidak berfungsi:
1. Pastikan WebSocket tidak diblokir firewall
2. Periksa konfigurasi HMR di vite.config.ngrok.ts
3. Refresh manual jika HMR gagal

## Testing Checklist

- [ ] Ngrok tunnel aktif
- [ ] Laravel server berjalan di 0.0.0.0:8000
- [ ] Vite server berjalan di 0.0.0.0:5173
- [ ] Environment variables sudah benar
- [ ] Browser cache sudah di-clear
- [ ] Coba akses dari device lain
- [ ] Periksa browser console untuk errors

## Fallback Options

Jika masih bermasalah:
1. Gunakan localhost development
2. Coba browser yang berbeda
3. Coba jaringan yang berbeda
4. Periksa firewall settings
EOF

    print_success "Troubleshooting guide created: NGROK_BLANK_PAGE_FIX.md"
}

# Main execution
main() {
    echo "🔧 Ngrok Blank Page Fix Tool"
    echo "=============================="
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_error ".env file not found! Please run setup first."
        exit 1
    fi
    
    # Get ngrok URL from user
    get_ngrok_url
    
    # Update environment variables
    update_env
    
    # Create improved configurations
    create_vite_config
    create_startup_script
    create_troubleshooting_guide
    
    echo ""
    print_success "✅ Ngrok blank page fix completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run: ./start-ngrok-fixed.sh"
    echo "2. Start ngrok: ngrok http 8000"
    echo "3. Access via ngrok URL from external device"
    echo ""
    echo "📚 Read NGROK_BLANK_PAGE_FIX.md for detailed instructions"
}

# Run main function
main