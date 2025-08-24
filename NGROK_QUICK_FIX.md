# Ngrok Blank Page - Quick Fix Guide

## Masalah: Blank Page di Device Berbeda

**Gejala**: 
- ✅ Buka di localhost → Normal
- ❌ Buka via ngrok di device lain → Blank page

## Penyebab Utama

1. **CORS Issues** - Browser memblokir request cross-origin
2. **Asset Loading** - JavaScript/CSS tidak bisa dimuat
3. **Session Issues** - Domain berbeda menyebabkan session tidak konsisten
4. **HMR Issues** - WebSocket connection gagal

## Solusi Langsung (Tanpa File .sh)

### Step 1: Setup Environment
```bash
# Jalankan script setup
php setup-ngrok.php
```

### Step 2: Start Servers
```bash
# Terminal 1: Laravel Server
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Vite Dev Server  
npm run dev

# Terminal 3: Ngrok Tunnel
ngrok http 8000
```

### Step 3: Update Ngrok URL
```bash
# Copy URL dari ngrok (contoh: https://abc123.ngrok-free.app)
php update-ngrok-url.php https://abc123.ngrok-free.app
```

### Step 4: Restart Servers
```bash
# Restart Laravel dan Vite server setelah update URL
# Gunakan Ctrl+C lalu jalankan ulang
```

## Troubleshooting Langsung

### 1. Cek CORS Headers
```bash
# Test CORS
curl -H "Origin: https://abc123.ngrok-free.app" \
     -X OPTIONS \
     http://localhost:8000
```

### 2. Cek Asset Loading
```bash
# Test Vite assets
curl http://localhost:5173/resources/js/app.tsx
```

### 3. Cek Session
```bash
# Test session
curl -c cookies.txt http://localhost:8000
curl -b cookies.txt http://localhost:8000
```

## Quick Fixes

### Fix 1: Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Fix 2: Check Ports
```bash
# Cek port yang digunakan
netstat -tulpn | grep :8000
netstat -tulpn | grep :5173
```

### Fix 3: Check Firewall
```bash
# Cek firewall
sudo ufw status
# Jika aktif, allow ports
sudo ufw allow 8000
sudo ufw allow 5173
```

## Environment Variables yang Harus Benar

```env
APP_URL=https://abc123.ngrok-free.app
SESSION_DOMAIN=abc123.ngrok-free.app
VITE_BASE_URL=https://abc123.ngrok-free.app
SANCTUM_STATEFUL_DOMAINS=abc123.ngrok-free.app
```

## Browser Testing

1. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R)
2. **Disable Extensions** - Coba di incognito mode
3. **Check Console** - Lihat error di Developer Tools
4. **Network Tab** - Cek request yang gagal

## Common Errors & Solutions

### Error: "Failed to load resource"
- ✅ Cek CORS headers
- ✅ Restart Vite server
- ✅ Clear browser cache

### Error: "WebSocket connection failed"
- ✅ Cek HMR configuration di vite.config.ts
- ✅ Restart Vite server
- ✅ Cek firewall settings

### Error: "Session expired"
- ✅ Update SESSION_DOMAIN
- ✅ Clear Laravel cache
- ✅ Restart Laravel server

## Testing Checklist

- [ ] Localhost berfungsi normal
- [ ] Ngrok tunnel aktif
- [ ] Environment variables updated
- [ ] Servers restarted
- [ ] CORS headers working
- [ ] Assets loading properly
- [ ] Session working
- [ ] HMR working (optional)

## Jika Masih Blank Page

1. **Check Browser Console** - Lihat error messages
2. **Check Network Tab** - Cek failed requests
3. **Check Laravel Logs** - `tail -f storage/logs/laravel.log`
4. **Check Vite Logs** - Lihat di terminal npm run dev
5. **Check Ngrok Logs** - Lihat di terminal ngrok

## Fallback Options

Jika ngrok masih bermasalah:
1. **Use localhost development** untuk testing cepat
2. **Use ngrok with custom domain** (jika tersedia)
3. **Use Laravel Valet** dengan ngrok (macOS)
4. **Use Docker** dengan port mapping