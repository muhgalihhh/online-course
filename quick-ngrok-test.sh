#!/bin/bash

echo "🧪 Quick Ngrok Test Tool"
echo "========================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Get ngrok URL from user
echo "Masukkan URL ngrok Anda (contoh: https://abc123.ngrok-free.app):"
read -p "Ngrok URL: " ngrok_url

if [ -z "$ngrok_url" ]; then
    echo "❌ URL ngrok tidak valid!"
    exit 1
fi

echo ""
echo "🔧 Updating configuration..."

# Extract domain
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

echo "✅ Configuration updated!"
echo ""

# Clear Laravel cache
echo "🧹 Clearing Laravel cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "🚀 Starting servers..."
echo ""

# Start Laravel server
echo "Starting Laravel server on 0.0.0.0:8000..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

sleep 3

# Start Vite server
echo "Starting Vite server on 0.0.0.0:5173..."
export VITE_BASE_URL="$ngrok_url"
npm run dev -- --host 0.0.0.0 --port 5173 &
VITE_PID=$!

echo ""
echo "✅ Servers started!"
echo ""
echo "🌐 Ngrok URL: $ngrok_url"
echo "🔧 Laravel: http://localhost:8000"
echo "⚡ Vite: http://localhost:5173"
echo ""
echo "📋 Next steps:"
echo "1. Start ngrok: ngrok http 8000"
echo "2. Test access from external device: $ngrok_url"
echo ""
echo "⚠️  Troubleshooting tips:"
echo "   - Clear browser cache on external device"
echo "   - Check browser console for errors"
echo "   - Make sure both servers are running on 0.0.0.0"
echo ""
echo "Press Ctrl+C to stop servers"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $LARAVEL_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait