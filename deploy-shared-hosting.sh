#!/bin/bash

# Script untuk deployment ke shared hosting
# Jalankan script ini setelah upload ke shared hosting

echo "🚀 Memulai deployment untuk shared hosting..."

# 1. Install dependencies (jika composer tersedia)
if command -v composer &> /dev/null; then
    echo "📦 Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader
else
    echo "⚠️  Composer tidak tersedia. Pastikan vendor/ sudah diupload."
fi

# 2. Set permissions yang benar
echo "🔐 Setting proper permissions..."
chmod -R 755 .
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env

# 3. Buat symbolic link untuk storage (jika belum ada)
if [ ! -L "public/storage" ]; then
    echo "🔗 Creating storage symbolic link..."
    ln -s ../storage/app/public public/storage
    echo "✅ Storage link created successfully"
else
    echo "ℹ️  Storage link already exists"
fi

# 4. Generate application key (jika belum ada)
if grep -q "APP_KEY=$" .env; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# 5. Clear and cache configuration
echo "🧹 Clearing and caching configuration..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Optimize untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Run migrations (hanya jika diperlukan)
read -p "🗄️  Run database migrations? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate --force
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with production database credentials"
echo "2. Set APP_ENV=production and APP_DEBUG=false in .env"
echo "3. Update APP_URL in .env to your domain"
echo "4. Make sure your domain points to the public/ folder"
