#!/bin/bash

echo "🚀 Starting Laravel + Vite development server for ngrok..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if .env exists
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Update APP_URL to ngrok domain
print_status "Updating APP_URL to ngrok domain..."
sed -i 's|APP_URL=http://localhost|APP_URL=https://9c43d871631f.ngrok-free.app|' .env

# Generate APP_KEY if not exists
if ! grep -q "APP_KEY=base64:" .env; then
    print_status "Generating APP_KEY..."
    KEY=$(openssl rand -base64 32)
    sed -i "s|APP_KEY=|APP_KEY=base64:$KEY|" .env
fi

# Add SESSION_DOMAIN for ngrok if not exists
if ! grep -q "SESSION_DOMAIN" .env; then
    print_status "Adding SESSION_DOMAIN for ngrok..."
    echo "SESSION_DOMAIN=.ngrok-free.app" >> .env
fi

# Add VITE_BASE_URL for ngrok
if ! grep -q "VITE_BASE_URL" .env; then
    print_status "Adding VITE_BASE_URL for ngrok..."
    echo "VITE_BASE_URL=https://9c43d871631f.ngrok-free.app" >> .env
fi

# Clear Laravel cache
print_status "Clearing Laravel cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

print_success "Environment configured for ngrok"

# Check if ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port $port is already in use"
        return 1
    fi
    return 0
}

# Kill existing processes if needed
kill_existing() {
    local port=$1
    local process_name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Killing existing $process_name on port $port..."
        pkill -f "$process_name"
        sleep 2
    fi
}

# Kill existing processes
kill_existing 8000 "php artisan serve"
kill_existing 5173 "vite"

echo ""
print_status "Starting development servers..."
echo ""

# Start Laravel server in background
print_status "Starting Laravel server on 0.0.0.0:8000..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

# Wait a moment for Laravel to start
sleep 3

# Start Vite server in background
print_status "Starting Vite server on 0.0.0.0:5173..."
export VITE_BASE_URL="https://9c43d871631f.ngrok-free.app"
export VITE_DEV_SERVER_URL="https://9c43d871631f.ngrok-free.app"
npm run dev -- --host 0.0.0.0 --port 5173 &
VITE_PID=$!

echo ""
print_success "Development servers started!"
echo ""
echo "🌐 Ngrok URL: https://9c43d871631f.ngrok-free.app"
echo "🔧 Laravel: http://localhost:8000"
echo "⚡ Vite: http://localhost:5173"
echo ""
echo "📋 Next steps:"
echo "1. Start ngrok: ngrok http 8000"
echo "2. Access your app via ngrok URL"
echo ""
echo "⚠️  Important notes:"
echo "   - Clear browser cache and cookies"
echo "   - If CORS errors persist, try accessing via localhost first"
echo "   - Both servers are running on 0.0.0.0 for external access"
echo ""
echo "🔧 To stop servers:"
echo "   - Press Ctrl+C to stop this script"
echo "   - Or run: pkill -f 'php artisan serve' && pkill -f 'vite'"

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