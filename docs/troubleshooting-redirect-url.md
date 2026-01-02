# 🚨 TROUBLESHOOTING: "redirect_url is invalid" Error

## Masalah

Error dari Flip: **"Param redirect_url Url is invalid"**

## Penyebab

Laravel masih menggunakan `localhost:8000` dalam config cache, meskipun .env sudah di-update dengan ngrok URL.

---

## ✅ Solusi (Ikuti Urutan Ini!)

### 1️⃣ **Stop Laravel Server**

```
Terminal yang running `php artisan serve`
Tekan: Ctrl + C
```

### 2️⃣ **Clear All Cache**

**Opsi A: Gunakan Script (Mudah)**

```cmd
clear-cache.bat
```

**Opsi B: Manual**

```powershell
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
```

### 3️⃣ **Verify .env File**

Pastikan .env punya ngrok URL:

```env
APP_URL=https://your-ngrok-url.ngrok-free.app
```

### 4️⃣ **Restart Laravel Server**

```powershell
php artisan serve
```

### 5️⃣ **Test di Browser**

```
https://your-ngrok-url.ngrok-free.app/payments/courses/13
```

---

## 🔍 Verifikasi Setup

### Check 1: Ngrok Masih Running?

```
Terminal ngrok harus masih terbuka dan showing:
Forwarding: https://xxxx.ngrok-free.app -> http://localhost:8000
```

### Check 2: APP_URL Benar?

```powershell
# Check file .env
Get-Content .env | Select-String "APP_URL"

# Should show:
# APP_URL=https://xxxx.ngrok-free.app
```

### Check 3: Cache Sudah Clear?

```powershell
# List cache files
Get-ChildItem bootstrap\cache\config.php -ErrorAction SilentlyContinue

# If file exists, cache not cleared. Run clear-cache.bat again
```

---

## 🎯 Complete Checklist

- [ ] Ngrok running (check terminal)
- [ ] Ngrok URL copied (https://xxxx.ngrok-free.app)
- [ ] .env updated with ngrok URL
- [ ] **Laravel server STOPPED (Ctrl+C)**
- [ ] **Cache cleared (run clear-cache.bat)**
- [ ] **Laravel server RESTARTED (php artisan serve)**
- [ ] Browser opened to ngrok URL
- [ ] Payment tested

---

## 🚫 Common Mistakes

❌ **Updating .env but NOT clearing cache**
✅ Solution: Always clear cache after .env changes

❌ **Updating .env but NOT restarting Laravel**
✅ Solution: Stop (Ctrl+C) and restart server

❌ **Ngrok stopped/changed URL**
✅ Solution: Update .env with new URL, clear cache, restart

❌ **Still using localhost:8000 in browser**
✅ Solution: Use ngrok URL in browser instead

---

## 📝 Testing Steps (After Fix)

1. **Open Browser** to ngrok URL:

    ```
    https://your-ngrok-url.ngrok-free.app
    ```

2. **Click "Visit Site"** (ngrok warning page)

3. **Login** to application

4. **Go to Course** and click "Beli Kursus"

5. **Payment Page Should Load** without errors

6. **Click "Buka Halaman Pembayaran"**

7. **Complete Payment** in Flip

8. **Should Auto-Redirect** back to app with completed status

---

## 🆘 Still Having Issues?

### Check Laravel Log

```powershell
Get-Content storage\logs\laravel.log -Tail 50
```

Look for:

```
[timestamp] Creating Flip Bill
[timestamp] Flip API Error
[timestamp] redirect_url
```

### Check Ngrok Inspector

Open: http://127.0.0.1:4040

Check:

- Recent requests from your browser
- Any 500 errors
- Request/response details

### Manual Test Route

```powershell
php artisan route:list --path=payments
```

Should show:

```
payments.flip.callback
payments.flip.webhook
```

---

## 💡 Pro Tip

Create a shortcut workflow:

**File: `restart-with-ngrok.bat`**

```batch
@echo off
echo Clearing cache...
call clear-cache.bat

echo.
echo Starting Laravel server...
start cmd /k "cd /d %CD% && php artisan serve"

echo.
echo Done! Server restarted with fresh config.
pause
```

Then just run: `restart-with-ngrok.bat` after updating .env!

---

**Last Updated:** January 2026
