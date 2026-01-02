# ============================================
# PowerShell Script untuk Setup Ngrok Testing
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  NGROK SETUP HELPER - Flip Payment Testing" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check if ngrok is installed
Write-Host "[Step 1] Checking ngrok installation..." -ForegroundColor Yellow
if (Test-CommandExists ngrok) {
    Write-Host "[OK] Ngrok found!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Ngrok not found!" -ForegroundColor Red
    Write-Host "`nPlease install ngrok:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://ngrok.com/download"
    Write-Host "2. Or install via: choco install ngrok"
    Write-Host "3. Or install via: scoop install ngrok`n"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in Laravel project root
Write-Host "`n[Step 2] Checking Laravel project..." -ForegroundColor Yellow
if (Test-Path "artisan") {
    Write-Host "[OK] Laravel project found!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Not in Laravel project root!" -ForegroundColor Red
    Write-Host "Please run this script from the Laravel project root directory.`n"
    Read-Host "Press Enter to exit"
    exit 1
}

# Clear Laravel cache
Write-Host "`n[Step 3] Clearing Laravel cache..." -ForegroundColor Yellow
try {
    php artisan config:clear 2>&1 | Out-Null
    php artisan cache:clear 2>&1 | Out-Null
    php artisan route:clear 2>&1 | Out-Null
    php artisan view:clear 2>&1 | Out-Null
    Write-Host "[OK] Cache cleared!" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Could not clear cache: $_" -ForegroundColor Yellow
}

# Check if ngrok authtoken is configured
Write-Host "`n[Step 4] Checking ngrok configuration..." -ForegroundColor Yellow
$ngrokConfigPath = "$env:USERPROFILE\.ngrok2\ngrok.yml"
if (Test-Path $ngrokConfigPath) {
    Write-Host "[OK] Ngrok config found!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Ngrok authtoken not configured!" -ForegroundColor Yellow
    Write-Host "`nPlease configure ngrok authtoken:" -ForegroundColor Cyan
    Write-Host "1. Sign up at: https://dashboard.ngrok.com/signup"
    Write-Host "2. Get your authtoken from dashboard"
    Write-Host "3. Run: ngrok config add-authtoken YOUR_TOKEN`n"

    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

# Instructions for manual steps
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  MANUAL STEPS REQUIRED" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Please follow these steps in order:`n" -ForegroundColor Yellow

Write-Host "[Terminal 1] Start Laravel Server:" -ForegroundColor Cyan
Write-Host "  cd '$PWD'"
Write-Host "  php artisan serve`n"

Write-Host "[Terminal 2] Start ngrok:" -ForegroundColor Cyan
Write-Host "  ngrok http 8000`n"

Write-Host "[Action] After ngrok starts:" -ForegroundColor Cyan
Write-Host "  1. Copy the HTTPS URL from ngrok output"
Write-Host "     Example: https://abc123.ngrok-free.app"
Write-Host "`n  2. Update .env file:"
Write-Host "     APP_URL=https://your-ngrok-url.ngrok-free.app"
Write-Host "`n  3. Restart Laravel server (Ctrl+C then php artisan serve)"
Write-Host "`n  4. Clear config cache:"
Write-Host "     php artisan config:clear"
Write-Host "     php artisan config:cache"
Write-Host "`n  5. Update Flip Dashboard Webhook URL:"
Write-Host "     https://your-ngrok-url.ngrok-free.app/payments/flip/webhook"
Write-Host "`n  6. Open browser to ngrok URL and test payment!`n"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  MONITORING TOOLS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Monitor ngrok requests:" -ForegroundColor Yellow
Write-Host "  Open browser to: http://127.0.0.1:4040`n"

Write-Host "Monitor Laravel logs:" -ForegroundColor Yellow
Write-Host "  Get-Content storage\logs\laravel.log -Wait -Tail 50`n"

Write-Host "Check database transactions:" -ForegroundColor Yellow
Write-Host "  mysql -u root -p online_course -e 'SELECT * FROM transactions ORDER BY id DESC LIMIT 5;'`n"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QUICK REFERENCE" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Callback URL format:" -ForegroundColor Yellow
Write-Host "  https://your-ngrok-url.ngrok-free.app/payments/flip/callback`n"

Write-Host "Webhook URL format:" -ForegroundColor Yellow
Write-Host "  https://your-ngrok-url.ngrok-free.app/payments/flip/webhook`n"

Write-Host "Remember:" -ForegroundColor Yellow
Write-Host "  - Keep both Laravel and ngrok terminals open during testing"
Write-Host "  - Ngrok URL changes every restart (free plan)"
Write-Host "  - Update .env and Flip dashboard when URL changes"
Write-Host "  - Clear cache after changing .env`n"

Write-Host "============================================`n" -ForegroundColor Cyan

# Ask if user wants to open documentation
$openDocs = Read-Host "Open full documentation? (y/n)"
if ($openDocs -eq "y") {
    $docsPath = "docs\ngrok-setup-guide.md"
    if (Test-Path $docsPath) {
        Start-Process notepad $docsPath
    } else {
        Write-Host "[WARNING] Documentation not found at: $docsPath" -ForegroundColor Yellow
    }
}

Write-Host "`nSetup helper completed!" -ForegroundColor Green
Write-Host "Read the full guide at: docs\ngrok-setup-guide.md`n" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
