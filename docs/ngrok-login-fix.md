# 🔐 Fix Login Issues with Ngrok

## Masalah

Tidak bisa login saat menggunakan ngrok forwarding. Setelah submit login form, halaman refresh tapi tetap di halaman login (tidak ter-authenticate).

---

## 🔍 Penyebab

1. **Session Cookie Domain Mismatch**
    - Laravel set cookie untuk `localhost`
    - Browser akses via `xxx.ngrok-free.app`
    - Cookie tidak ter-set/ter-kirim dengan benar

2. **Proxy Headers Not Trusted**
    - Laravel tidak recognize ngrok sebagai trusted proxy
    - HTTPS detection gagal
    - Session redirect tidak bekerja

3. **CSRF Token Issues**
    - Token mismatch karena domain/protocol berbeda

---

## ✅ Solusi

### **Step 1: Update .env File**

Tambahkan/update session settings:

```env
# App URL - HARUS pakai ngrok URL
APP_URL=https://your-ngrok-url.ngrok-free.app

# Session Settings for Ngrok
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax
```

**PENTING:**

- `SESSION_DOMAIN` harus **kosong** (jangan isi!)
- `SESSION_SECURE_COOKIE=false` untuk development
- `APP_URL` harus ngrok URL lengkap dengan https://

---

### **Step 2: Update bootstrap/app.php**

File ini sudah di-update dengan trusted proxies. Verify baris ini ada:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

    // Trust all proxies for ngrok/development
    $middleware->trustProxies(at: '*');

    // ... rest of code
})
```

---

### **Step 3: Clear All Cache & Restart**

**CRITICAL!** Jalankan ini setiap kali update config:

```powershell
# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan session:clear

# Rebuild config
php artisan config:cache

# Restart Laravel server
# Press Ctrl+C then:
php artisan serve
```

Atau gunakan script:

```cmd
restart-laravel.bat
```

---

### **Step 4: Clear Browser Data**

**PENTING!** Clear cookies untuk domain lama:

1. Open Browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Cookies**
4. Delete ALL cookies for:
    - `localhost:8000`
    - `127.0.0.1:8000`
    - Your ngrok domain
5. Close DevTools
6. **Hard refresh:** Ctrl+Shift+R

---

### **Step 5: Test Login**

1. **Close all browser tabs** for the app

2. **Open NEW incognito/private window**

3. Navigate to ngrok URL:

    ```
    https://your-ngrok-url.ngrok-free.app
    ```

4. Click **"Visit Site"** on ngrok warning

5. Go to login page:

    ```
    https://your-ngrok-url.ngrok-free.app/login
    ```

6. Login dengan credentials dari UserSeeder:

    ```
    Email: admin@onlinecourse.com
    Password: password
    ```

    Atau user biasa:

    ```
    Email: ahmad.rahman@gmail.com
    Password: password
    ```

7. **Should work!** ✅

---

## 🔧 Troubleshooting

### Problem: Masih tidak bisa login

**Solution 1: Check Session Files**

```powershell
# Delete old session files
Remove-Item -Path "storage\framework\sessions\*" -Force

# Restart server
php artisan serve
```

**Solution 2: Verify Config**

```powershell
# Check loaded config
php artisan tinker
> config('app.url')
> config('session.domain')
> config('session.secure')
```

Should show:

```
"https://your-ngrok-url.ngrok-free.app"
null
false
```

**Solution 3: Check Browser Console**

Open DevTools → Console, look for errors:

- CSRF token mismatch
- Cookie blocked
- CORS errors

**Solution 4: Use Different Browser**

Try Chrome Incognito or Firefox Private Window

---

### Problem: Login works but redirect fails

**Check:**

```env
# Make sure APP_URL is correct
APP_URL=https://your-ngrok-url.ngrok-free.app

# NOT localhost!
# APP_URL=http://localhost:8000  ❌
```

Then:

```powershell
php artisan config:clear
php artisan config:cache
```

---

### Problem: "419 Page Expired" on login

**Cause:** CSRF token expired

**Solution:**

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Try login again

Or add to `.env`:

```env
SESSION_LIFETIME=120
```

---

## 📋 Complete Checklist

Before testing login with ngrok:

- [ ] Ngrok running and URL copied
- [ ] `.env` updated with ngrok URL
- [ ] `SESSION_DOMAIN=` (empty/blank)
- [ ] `SESSION_SECURE_COOKIE=false`
- [ ] `bootstrap/app.php` has `trustProxies(at: '*')`
- [ ] Cache cleared (`restart-laravel.bat`)
- [ ] Laravel server restarted
- [ ] Browser cookies cleared
- [ ] Testing in incognito/private window
- [ ] Using ngrok URL (NOT localhost)

---

## 🎯 Quick Commands

```powershell
# 1. Stop Laravel (Ctrl+C)

# 2. Clear everything
php artisan config:clear
php artisan cache:clear
php artisan session:clear
Remove-Item -Path "storage\framework\sessions\*" -Force

# 3. Rebuild config
php artisan config:cache

# 4. Restart server
php artisan serve

# 5. In browser:
# - Clear cookies (F12 → Application → Cookies → Delete All)
# - Open incognito window
# - Go to ngrok URL
# - Test login
```

---

## 💡 Production Notes

**IMPORTANT:** Sebelum deploy ke production:

1. **Update .env untuk production:**

```env
APP_URL=https://yourdomain.com
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

2. **Update bootstrap/app.php:**

```php
// Change from '*' to specific trusted proxies
$middleware->trustProxies(
    at: env('TRUSTED_PROXIES') ?
        explode(',', env('TRUSTED_PROXIES')) :
        null
);
```

3. **In production .env:**

```env
TRUSTED_PROXIES=your_load_balancer_ip
```

---

## 📝 Test Accounts

From `database/seeders/UserSeeder.php`:

### Admin Accounts

```
Email: admin@onlinecourse.com
Password: password
```

```
Email: admin.materi@onlinecourse.com
Password: password
```

### User Accounts

```
Email: ahmad.rahman@gmail.com
Password: password
```

```
Email: budi.santoso@gmail.com
Password: password
```

```
Email: sari.dewi@gmail.com
Password: password
```

All passwords are: `password`

---

## 🆘 Still Not Working?

### Enable Debug Mode

Update `.env`:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Check Laravel Log

```powershell
Get-Content storage\logs\laravel.log -Tail 100 | Select-String -Pattern "session|cookie|auth|login"
```

### Check Network Tab

1. F12 → Network tab
2. Try login
3. Look for:
    - Status codes (should be 302 redirect after login)
    - Response headers (Set-Cookie)
    - Request headers (Cookie)

### Test Session Manually

```powershell
php artisan tinker
```

```php
// Set test session
session(['test' => 'value']);

// Get it back
session('test');
// Should show: "value"
```

---

**Last Updated:** January 2026

**Files Modified:**

- `.env` (SESSION\_\* variables)
- `bootstrap/app.php` (trustProxies)
