#!/bin/bash

echo "🚀 Starting Laravel + Vite for Ngrok (Fixed Version)..."

# Set environment variables
export VITE_BASE_URL="https://test123.ngrok-free.app"
export VITE_DEV_SERVER_URL="https://test123.ngrok-free.app"

# Kill existing processes
pkill -f "php artisan serve" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Start Laravel server
echo "Starting Laravel server on 0.0.0.0:8000..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

# Wait for Laravel to start
sleep 3

# Start Vite with ngrok config
echo "Starting Vite server on 0.0.0.0:5173..."
npm run dev -- --config vite.config.ngrok.ts --host 0.0.0.0 --port 5173 &
VITE_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo "🌐 Ngrok URL: https://test123.ngrok-free.app"
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
    kill $LARAVEL_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
