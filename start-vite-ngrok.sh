#!/bin/bash

echo "🚀 Starting Vite development server for ngrok..."

# Check if Vite is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Vite is already running on port 5173"
    echo "🛑 Stopping existing Vite process..."
    pkill -f "vite"
    sleep 2
fi

# Set environment variables for ngrok
export VITE_BASE_URL="https://9c43d871631f.ngrok-free.app"
export VITE_DEV_SERVER_URL="https://9c43d871631f.ngrok-free.app"

echo "🌐 VITE_BASE_URL set to: $VITE_BASE_URL"
echo "🔧 Starting Vite with ngrok configuration..."

# Start Vite with specific host and port
npm run dev -- --host 0.0.0.0 --port 5173