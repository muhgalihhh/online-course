#!/bin/bash

echo "🧪 Testing Ngrok Access & Fixing Issues"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if .env exists
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cp .env.example .env
fi

# Get ngrok URL
echo "Masukkan URL ngrok Anda:"
read -p "Ngrok URL: " ngrok_url

if [ -z "$ngrok_url" ]; then
    print_error "URL ngrok tidak valid!"
    exit 1
fi

print_info "Testing access to: $ngrok_url"
echo ""

# Test 1: Check if ngrok is accessible
print_info "Test 1: Checking ngrok accessibility..."
if command -v curl >/dev/null 2>&1; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$ngrok_url")
    if [ "$response" = "200" ]; then
        print_success "Ngrok accessible (HTTP $response)"
    else
        print_warning "Ngrok response: HTTP $response"
    fi
else
    print_warning "curl not available, skipping HTTP test"
fi

# Test 2: Update environment variables
print_info "Test 2: Updating environment variables..."
domain=$(echo "$ngrok_url" | sed 's|https://||' | sed 's|http://||')

# Update .env
sed -i "s|APP_URL=.*|APP_URL=$ngrok_url|" .env
sed -i "s|SESSION_DOMAIN=.*|SESSION_DOMAIN=$domain|" .env
sed -i "s|VITE_BASE_URL=.*|VITE_BASE_URL=$ngrok_url|" .env

# Add missing variables
if ! grep -q "SANCTUM_STATEFUL_DOMAINS" .env; then
    echo "SANCTUM_STATEFUL_DOMAINS=$domain" >> .env
fi

if ! grep -q "CORS_ALLOWED_ORIGINS" .env; then
    echo "CORS_ALLOWED_ORIGINS=$ngrok_url" >> .env
fi

print_success "Environment variables updated"

# Test 3: Clear Laravel cache
print_info "Test 3: Clearing Laravel cache..."
if [ -f "artisan" ]; then
    php artisan cache:clear >/dev/null 2>&1
    php artisan config:clear >/dev/null 2>&1
    php artisan route:clear >/dev/null 2>&1
    php artisan view:clear >/dev/null 2>&1
    print_success "Laravel cache cleared"
else
    print_warning "Laravel artisan not found"
fi

# Test 4: Check server status
print_info "Test 4: Checking server status..."
laravel_running=$(pgrep -f "php artisan serve" | wc -l)
vite_running=$(pgrep -f "vite" | wc -l)

if [ "$laravel_running" -gt 0 ]; then
    print_success "Laravel server running"
else
    print_warning "Laravel server not running"
fi

if [ "$vite_running" -gt 0 ]; then
    print_success "Vite server running"
else
    print_warning "Vite server not running"
fi

# Test 5: Check port binding
print_info "Test 5: Checking port binding..."
if command -v ss >/dev/null 2>&1; then
    laravel_port=$(ss -tulpn 2>/dev/null | grep ":8000" | wc -l)
    vite_port=$(ss -tulpn 2>/dev/null | grep ":5173" | wc -l)
    
    if [ "$laravel_port" -gt 0 ]; then
        print_success "Port 8000 is bound"
    else
        print_warning "Port 8000 not bound"
    fi
    
    if [ "$vite_port" -gt 0 ]; then
        print_success "Port 5173 is bound"
    else
        print_warning "Port 5173 not bound"
    fi
else
    print_warning "ss command not available, skipping port check"
fi

echo ""
print_info "Summary of fixes applied:"
echo "  • Environment variables updated for ngrok"
echo "  • Laravel cache cleared"
echo "  • CORS settings configured"
echo ""
print_info "Next steps:"
echo "  1. Start servers if not running:"
echo "     - Laravel: php artisan serve --host=0.0.0.0 --port=8000"
echo "     - Vite: npm run dev -- --host 0.0.0.0 --port 5173"
echo "  2. Start ngrok: ngrok http 8000"
echo "  3. Test from external device: $ngrok_url"
echo ""
print_info "Troubleshooting tips:"
echo "  • Clear browser cache on external device"
echo "  • Check browser console for errors"
echo "  • Make sure servers bind to 0.0.0.0 (not localhost)"
echo "  • Verify CORS headers in browser network tab"