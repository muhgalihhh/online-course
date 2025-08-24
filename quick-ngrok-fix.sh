#!/bin/bash

echo "🚀 Quick Ngrok Fix for Blank Page Issue"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to get current ngrok URL
get_current_ngrok_url() {
    echo ""
    echo -e "${BLUE}Current ngrok URL in .env:${NC}"
    grep "APP_URL=" .env | sed 's/APP_URL=//'
    echo ""
}

# Function to update ngrok URL
update_ngrok_url() {
    echo -e "${BLUE}Enter your new ngrok URL:${NC}"
    read -p "URL: " NEW_URL
    
    if [[ -z "$NEW_URL" ]]; then
        echo -e "${YELLOW}No URL provided. Keeping current configuration.${NC}"
        return
    fi
    
    # Update all environment variables
    sed -i "s|APP_URL=.*|APP_URL=$NEW_URL|" .env
    sed -i "s|VITE_BASE_URL=.*|VITE_BASE_URL=$NEW_URL|" .env
    sed -i "s|VITE_DEV_SERVER_URL=.*|VITE_DEV_SERVER_URL=$NEW_URL|" .env
    
    echo -e "${GREEN}✅ Environment variables updated!${NC}"
}

# Function to show current status
show_status() {
    echo ""
    echo -e "${BLUE}📊 Current Configuration Status:${NC}"
    echo "----------------------------------------"
    echo "APP_URL: $(grep 'APP_URL=' .env | sed 's/APP_URL=//')"
    echo "SESSION_DOMAIN: $(grep 'SESSION_DOMAIN=' .env | sed 's/SESSION_DOMAIN=//')"
    echo "VITE_BASE_URL: $(grep 'VITE_BASE_URL=' .env | sed 's/VITE_BASE_URL=//')"
    echo "VITE_DEV_SERVER_URL: $(grep 'VITE_DEV_SERVER_URL=' .env | sed 's/VITE_DEV_SERVER_URL=//')"
    echo ""
}

# Function to start servers
start_servers() {
    echo -e "${BLUE}🚀 Starting development servers...${NC}"
    
    # Kill existing processes
    pkill -f "php artisan serve" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    echo "Starting Laravel server on 0.0.0.0:8000..."
    php artisan serve --host=0.0.0.0 --port=8000 &
    LARAVEL_PID=$!
    
    sleep 3
    
    echo "Starting Vite server on 0.0.0.0:5173..."
    npm run dev -- --host 0.0.0.0 --port 5173 &
    VITE_PID=$!
    
    echo ""
    echo -e "${GREEN}✅ Servers started successfully!${NC}"
    echo ""
    echo "🌐 Ngrok URL: $(grep 'APP_URL=' .env | sed 's/APP_URL=//')"
    echo "🔧 Laravel: http://localhost:8000"
    echo "⚡ Vite: http://localhost:5173"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start ngrok: ngrok http 8000"
    echo "2. Copy the ngrok URL and run this script again to update"
    echo "3. Access via ngrok URL from external device"
    echo ""
    echo "⚠️  Important tips to fix blank page:"
    echo "   - Clear browser cache and cookies"
    echo "   - Use incognito mode for testing"
    echo "   - Check browser console for errors"
    echo "   - Make sure both servers are running"
    
    # Cleanup function
    cleanup() {
        echo ""
        echo "Stopping servers..."
        kill $LARAVEL_PID 2>/dev/null
        kill $VITE_PID 2>/dev/null
        echo "Servers stopped"
        exit 0
    }
    
    trap cleanup SIGINT SIGTERM
    wait
}

# Function to show troubleshooting tips
show_troubleshooting() {
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting Tips for Blank Page:${NC}"
    echo "=============================================="
    echo ""
    echo "1. ${YELLOW}Environment Variables:${NC}"
    echo "   - Make sure APP_URL points to your ngrok URL"
    echo "   - VITE_BASE_URL should match APP_URL"
    echo "   - SESSION_DOMAIN should be .ngrok-free.app"
    echo ""
    echo "2. ${YELLOW}Server Configuration:${NC}"
    echo "   - Laravel must run on 0.0.0.0:8000 (not localhost)"
    echo "   - Vite must run on 0.0.0.0:5173 (not localhost)"
    echo "   - Both servers must be running before starting ngrok"
    echo ""
    echo "3. ${YELLOW}Browser Issues:${NC}"
    echo "   - Clear cache and cookies"
    echo "   - Use incognito/private mode"
    echo "   - Check browser console for CORS errors"
    echo "   - Try different browser"
    echo ""
    echo "4. ${YELLOW}Network Issues:${NC}"
    echo "   - Check if ports 8000 and 5173 are accessible"
    echo "   - Verify ngrok tunnel is active"
    echo "   - Try accessing from different network"
    echo ""
    echo "5. ${YELLOW}Quick Fix Commands:${NC}"
    echo "   - Clear Laravel cache: php artisan cache:clear"
    echo "   - Restart servers: ./quick-ngrok-fix.sh"
    echo "   - Check server status: netstat -tlnp | grep -E ':8000|:5173'"
}

# Main menu
main_menu() {
    while true; do
        echo ""
        echo -e "${BLUE}🔧 Quick Ngrok Fix Menu:${NC}"
        echo "================================"
        echo "1. Show current configuration"
        echo "2. Update ngrok URL"
        echo "3. Start development servers"
        echo "4. Show troubleshooting tips"
        echo "5. Exit"
        echo ""
        read -p "Choose an option (1-5): " choice
        
        case $choice in
            1)
                show_status
                ;;
            2)
                update_ngrok_url
                show_status
                ;;
            3)
                start_servers
                ;;
            4)
                show_troubleshooting
                ;;
            5)
                echo "Goodbye! 👋"
                exit 0
                ;;
            *)
                echo "Invalid option. Please choose 1-5."
                ;;
        esac
    done
}

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Please run the setup first or copy from .env.example"
    exit 1
fi

# Show current status first
get_current_ngrok_url

# Start main menu
main_menu