@echo off
REM Script deployment untuk shared hosting (Windows)

echo 🚀 Memulai deployment untuk shared hosting...

REM 1. Install dependencies (jika composer tersedia)
where composer >nul 2>nul
if %errorlevel% == 0 (
    echo 📦 Installing Composer dependencies...
    composer install --no-dev --optimize-autoloader
) else (
    echo ⚠️  Composer tidak tersedia. Pastikan vendor/ sudah diupload.
)

REM 2. Generate application key (jika belum ada)
findstr /C:"APP_KEY=" .env | findstr /C:"APP_KEY=$" >nul
if %errorlevel% == 0 (
    echo 🔑 Generating application key...
    php artisan key:generate --force
)

REM 3. Clear and cache configuration
echo 🧹 Clearing and caching configuration...
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

REM Optimize untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

REM 4. Create storage link
echo 🔗 Creating storage symbolic link...
php artisan storage:link

echo ✅ Deployment completed successfully!
echo.
echo 📝 Next steps:
echo 1. Update your .env file with production database credentials
echo 2. Set APP_ENV=production and APP_DEBUG=false in .env
echo 3. Update APP_URL in .env to your domain
echo 4. Make sure your domain points to the public/ folder
echo 5. Set proper folder permissions on server (755 for folders, 644 for files)
pause
