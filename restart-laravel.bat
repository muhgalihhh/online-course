@echo off
REM ========================================
REM Quick Restart after .env Update
REM ========================================

echo.
echo ========================================
echo  RESTART LARAVEL WITH FRESH CONFIG
echo ========================================
echo.

echo Step 1: Clearing all cache...
call php artisan config:clear
call php artisan cache:clear
call php artisan route:clear
call php artisan view:clear

echo.
echo Step 2: Rebuilding config cache...
call php artisan config:cache

echo.
echo Step 3: Checking APP_URL...
findstr "APP_URL" .env
echo.

echo ========================================
echo  CACHE CLEARED!
echo ========================================
echo.
echo NEXT: Restart Laravel server manually
echo 1. Go to terminal running 'php artisan serve'
echo 2. Press Ctrl+C to stop
echo 3. Run: php artisan serve
echo.
echo Or press any key to open NEW terminal for Laravel...
pause >nul

echo.
echo Opening new terminal for Laravel server...
start cmd /k "cd /d %CD% && echo Starting Laravel server... && php artisan serve"

echo.
echo Done! Laravel server started in new terminal.
echo.
pause
