#!/bin/bash

# ============================================
# DEPLOYMENT SCRIPT FOR PAREEDUHUB.COM
# Usage: bash deploy-production.sh
# ============================================

set -e  # Exit on error

echo "============================================"
echo "🚀 Deploying Pareeduhub to Production"
echo "============================================"

# Configuration
APP_DIR="/var/www/pareeduhub.com"
BACKUP_DIR="/var/www/backups/pareeduhub"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo ""
echo "📁 Application Directory: $APP_DIR"
echo "💾 Backup Directory: $BACKUP_DIR"
echo ""

# 1. Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# 2. Backup current application
echo "📦 Creating backup..."
if [ -d "$APP_DIR" ]; then
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" .
    echo "✅ Backup created: backup_$TIMESTAMP.tar.gz"
fi

# 3. Pull latest code from repository
echo ""
echo "📥 Pulling latest code from repository..."
cd "$APP_DIR"
git pull origin main  # atau branch production Anda

# 4. Install PHP dependencies
echo ""
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# 5. Install Node dependencies and build assets
echo ""
echo "📦 Building frontend assets..."
npm ci
npm run build

# 6. Clear and optimize caches
echo ""
echo "🧹 Clearing and optimizing caches..."
php artisan down --message="Updating application..." --retry=60

php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

# 7. Run database migrations
echo ""
echo "🗄️  Running database migrations..."
php artisan migrate --force

# 8. Optimize for production
echo ""
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 9. Storage link (if not exists)
if [ ! -L "$APP_DIR/public/storage" ]; then
    echo ""
    echo "🔗 Creating storage link..."
    php artisan storage:link
fi

# 10. Set correct permissions
echo ""
echo "🔐 Setting file permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR/storage"
chmod -R 755 "$APP_DIR/bootstrap/cache"

# 11. Restart services
echo ""
echo "🔄 Restarting services..."
sudo systemctl reload php8.2-fpm  # Sesuaikan versi PHP
sudo systemctl reload nginx       # Atau apache2

# 12. Bring application back up
php artisan up

echo ""
echo "============================================"
echo "✅ Deployment completed successfully!"
echo "============================================"
echo ""
echo "📊 Post-deployment checklist:"
echo "  - Visit https://pareeduhub.com to verify"
echo "  - Check logs: tail -f storage/logs/laravel.log"
echo "  - Test payment gateways"
echo "  - Test file uploads"
echo "  - Check SSL certificate expiry"
echo ""
echo "💡 Backup location: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
echo ""
