#!/bin/bash

echo "🔧 Fixing ngrok errors..."

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

# Kill existing processes
print_status "Stopping existing servers..."
pkill -f "php artisan serve" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Clear caches
print_status "Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Clear Vite cache
print_status "Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null

# Update environment for ngrok
print_status "Updating environment for ngrok..."
if [ -f .env ]; then
    # Update APP_URL to ngrok domain
    sed -i 's|APP_URL=.*|APP_URL=https://joint-strongly-bulldog.ngrok-free.app|' .env
    
    # Add SESSION_DOMAIN if not exists
    if ! grep -q "SESSION_DOMAIN" .env; then
        echo "SESSION_DOMAIN=.ngrok-free.app" >> .env
    fi
    
    # Add VITE_BASE_URL if not exists
    if ! grep -q "VITE_BASE_URL" .env; then
        echo "VITE_BASE_URL=https://joint-strongly-bulldog.ngrok-free.app" >> .env
    fi
    
    # Add VITE_DEV_SERVER_URL if not exists
    if ! grep -q "VITE_DEV_SERVER_URL" .env; then
        echo "VITE_DEV_SERVER_URL=https://joint-strongly-bulldog.ngrok-free.app" >> .env
    fi
fi

print_success "Environment updated"

# Start Laravel server
print_status "Starting Laravel server on 0.0.0.0:8000..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

# Wait for Laravel to start
sleep 3

# Start Vite server with proper configuration
print_status "Starting Vite server on 0.0.0.0:5173..."
export VITE_BASE_URL="https://joint-strongly-bulldog.ngrok-free.app"
export VITE_DEV_SERVER_URL="https://joint-strongly-bulldog.ngrok-free.app"
npm run dev -- --host 0.0.0.0 --port 5173 &
VITE_PID=$!

echo ""
print_success "Servers restarted with ngrok configuration!"
echo ""
echo "🌐 Ngrok URL: https://joint-strongly-bulldog.ngrok-free.app"
echo "🔧 Laravel: http://localhost:8000"
echo "⚡ Vite: http://localhost:5173"
echo ""
echo "📋 Troubleshooting steps:"
echo "1. Clear browser cache and cookies"
echo "2. Try accessing via incognito mode"
echo "3. Check browser console for remaining errors"
echo "4. Ensure ngrok is running: ngrok http 8000"
echo ""
echo "🔧 To stop servers:"
echo "   - Press Ctrl+C to stop this script"
echo "   - Or run: pkill -f 'php artisan serve' && pkill -f 'vite'"

# Function to cleanup on exit
cleanup() {
    print_status "Stopping servers..."
    kill $LARAVEL_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    print_success "Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait