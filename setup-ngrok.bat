@echo off
REM ========================================
REM Quick Setup Script untuk Ngrok Testing
REM ========================================

echo.
echo ============================================
echo  NGROK SETUP HELPER - Flip Payment Testing
echo ============================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ngrok tidak ditemukan!
    echo.
    echo Silakan install ngrok terlebih dahulu:
    echo 1. Download dari: https://ngrok.com/download
    echo 2. Extract ke folder C:\ngrok
    echo 3. Atau install via: choco install ngrok
    echo.
    pause
    exit /b 1
)

echo [OK] Ngrok ditemukan!
echo.

REM Check if Laravel project exists
if not exist "artisan" (
    echo [ERROR] File artisan tidak ditemukan!
    echo Pastikan Anda menjalankan script ini dari root project Laravel.
    echo.
    pause
    exit /b 1
)

echo [OK] Laravel project ditemukan!
echo.

REM Clear Laravel cache
echo [Step 1] Clearing Laravel cache...
php artisan config:clear >nul 2>nul
php artisan cache:clear >nul 2>nul
php artisan route:clear >nul 2>nul
php artisan view:clear >nul 2>nul
echo [OK] Cache cleared!
echo.

REM Instructions
echo ============================================
echo  LANGKAH SELANJUTNYA:
echo ============================================
echo.
echo 1. Buka terminal BARU dan jalankan:
echo    cd "%CD%"
echo    php artisan serve
echo.
echo 2. Buka terminal BARU lagi dan jalankan:
echo    ngrok http 8000
echo.
echo 3. Copy URL dari ngrok (https://xxxx.ngrok-free.app)
echo.
echo 4. Update file .env:
echo    APP_URL=https://xxxx.ngrok-free.app
echo.
echo 5. Restart Laravel server (Ctrl+C lalu php artisan serve lagi)
echo.
echo 6. Update Webhook di Flip Dashboard:
echo    https://xxxx.ngrok-free.app/payments/flip/webhook
echo.
echo 7. Buka browser ke ngrok URL untuk testing!
echo.
echo ============================================
echo  TIPS:
echo ============================================
echo - Monitor requests di: http://127.0.0.1:4040
echo - Cek log dengan: Get-Content storage\logs\laravel.log -Wait -Tail 50
echo - Baca panduan lengkap di: docs\ngrok-setup-guide.md
echo.
echo ============================================

pause
