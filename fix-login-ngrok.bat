@echo off
REM ========================================
REM Fix Login Issues for Ngrok
REM ========================================

echo.
echo ========================================
echo  NGROK LOGIN FIX - Complete Reset
echo ========================================
echo.

echo [Step 1/6] Clearing configuration cache...
php artisan config:clear >nul 2>&1

echo [Step 2/6] Clearing application cache...
php artisan cache:clear >nul 2>&1

echo [Step 3/6] Clearing route cache...
php artisan route:clear >nul 2>&1

echo [Step 4/6] Clearing view cache...
php artisan view:clear >nul 2>&1

echo [Step 5/6] Clearing session data...
php artisan session:clear >nul 2>&1

echo [Step 6/6] Deleting old session files...
del /Q storage\framework\sessions\* >nul 2>&1

echo.
echo ========================================
echo  REBUILDING CACHE
echo ========================================
echo.

php artisan config:cache

echo.
echo ========================================
echo  CURRENT CONFIGURATION
echo ========================================
echo.

echo Checking APP_URL...
findstr "^APP_URL" .env

echo.
echo Checking SESSION settings...
findstr "^SESSION" .env

echo.
echo ========================================
echo  NEXT STEPS
echo ========================================
echo.
echo 1. RESTART Laravel server:
echo    - Go to terminal running 'php artisan serve'
echo    - Press Ctrl+C
echo    - Run: php artisan serve
echo.
echo 2. CLEAR browser data:
echo    - Open DevTools (F12)
echo    - Go to Application ^> Cookies
echo    - Delete ALL cookies
echo    - Close ALL browser tabs
echo.
echo 3. TEST login in INCOGNITO window:
echo    - Open new incognito/private window
echo    - Go to: [YOUR_NGROK_URL]
echo    - Login with: admin@onlinecourse.com / password
echo.
echo ========================================
echo.

pause
