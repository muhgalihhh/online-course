#!/bin/bash

# Start Vite development server with ngrok configuration
echo "Starting Vite development server for ngrok..."

# Set environment variables for ngrok
export VITE_APP_URL="https://9c43d871631f.ngrok-free.app"

# Start Vite with host 0.0.0.0 to accept external connections
npm run dev -- --host 0.0.0.0 --port 5173