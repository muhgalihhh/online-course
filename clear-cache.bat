@echo off
echo ========================================
echo  CLEAR CACHE AFTER NGROK UPDATE
echo ========================================
echo.

echo [1/5] Clearing config cache...
php artisan config:clear

echo [2/5] Clearing application cache...
php artisan cache:clear

echo [3/5] Clearing route cache...
php artisan route:clear

echo [4/5] Clearing view cache...
php artisan view:clear

echo [5/5] Rebuilding config cache...
php artisan config:cache

echo.
echo ========================================
echo  CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo Next steps:
echo 1. Restart Laravel server: php artisan serve
echo 2. Refresh browser page
echo 3. Try payment again
echo.
pause
