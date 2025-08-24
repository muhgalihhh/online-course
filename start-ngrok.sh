#!/bin/bash

echo "🚀 Starting Laravel + Vite development server for ngrok..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Update APP_URL to ngrok domain
echo "🔧 Updating APP_URL to ngrok domain..."
sed -i 's|APP_URL=http://localhost|APP_URL=https://9c43d871631f.ngrok-free.app|' .env

# Generate APP_KEY if not exists
if ! grep -q "APP_KEY=base64:" .env; then
    echo "🔑 Generating APP_KEY..."
    KEY=$(openssl rand -base64 32)
    sed -i "s|APP_KEY=|APP_KEY=base64:$KEY|" .env
fi

# Add SESSION_DOMAIN for ngrok if not exists
if ! grep -q "SESSION_DOMAIN" .env; then
    echo "🍪 Adding SESSION_DOMAIN for ngrok..."
    echo "SESSION_DOMAIN=.ngrok-free.app" >> .env
fi

echo "✅ Environment configured for ngrok"
echo ""
echo "📋 Next steps:"
echo "1. Start Laravel server: php artisan serve --host=0.0.0.0 --port=8000"
echo "2. Start Vite server: npm run dev"
echo "3. Start ngrok: ngrok http 8000"
echo ""
echo "🌐 Your ngrok URL: https://9c43d871631f.ngrok-free.app"
echo ""
echo "⚠️  Make sure to:"
echo "   - Clear browser cache"
echo "   - Disable browser security for localhost (if needed)"
echo "   - Check that both servers are running on 0.0.0.0"