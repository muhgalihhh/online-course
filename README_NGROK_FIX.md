# 🚀 Ngrok Access Fix - Solusi Blank Page

## 📋 Overview

Repository ini berisi solusi lengkap untuk masalah **blank page** saat mengakses website Laravel + Vite melalui ngrok dari device lain.

## 🎯 Masalah yang Dipecahkan

- ❌ **Blank page putih** saat akses dari device lain
- ❌ **CORS errors** di browser console
- ❌ **Assets tidak dimuat** (JavaScript/CSS)
- ❌ **Session tidak konsisten** antar domain
- ❌ **HMR (Hot Module Replacement) tidak berfungsi**

## 🛠️ Script yang Tersedia

### 1. **`test-ngrok-access.sh`** - Testing & Quick Fix
```bash
chmod +x test-ngrok-access.sh
./test-ngrok-access.sh
```
**Fitur:**
- Test accessibility ngrok
- Update environment variables
- Clear Laravel cache
- Check server status
- Diagnose masalah

### 2. **`quick-ngrok-test.sh`** - Start Servers
```bash
chmod +x quick-ngrok-test.sh
./quick-ngrok-test.sh
```
**Fitur:**
- Update konfigurasi otomatis
- Start Laravel server (0.0.0.0:8000)
- Start Vite server (0.0.0.0:5173)
- Auto-cleanup saat exit

### 3. **`fix-ngrok-access.sh`** - Complete Fix
```bash
chmod +x fix-ngrok-access.sh
./fix-ngrok-access.sh
```
**Fitur:**
- Fix lengkap semua masalah
- Update vite.config.ts
- Konfigurasi CORS otomatis
- Environment setup lengkap

## 🚀 Cara Penggunaan

### Step 1: Jalankan Test Script
```bash
./test-ngrok-access.sh
```
Masukkan URL ngrok Anda saat diminta.

### Step 2: Start Servers
```bash
# Terminal 1: Laravel
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Vite
npm run dev -- --host 0.0.0.0 --port 5173

# Terminal 3: Ngrok
ngrok http 8000
```

### Step 3: Test dari Device Lain
Buka URL ngrok di device lain dan pastikan:
- ✅ Halaman tampil normal (bukan blank)
- ✅ JavaScript berfungsi
- ✅ CSS styling tampil
- ✅ Tidak ada error di console

## 🔧 Konfigurasi yang Diperbaiki

### Environment Variables (.env)
```env
APP_URL=https://YOUR_NGROK_URL.ngrok-free.app
SESSION_DOMAIN=YOUR_NGROK_URL.ngrok-free.app
VITE_BASE_URL=https://YOUR_NGROK_URL.ngrok-free.app
SANCTUM_STATEFUL_DOMAINS=YOUR_NGROK_URL.ngrok-free.app
CORS_ALLOWED_ORIGINS=https://YOUR_NGROK_URL.ngrok-free.app
```

### Vite Configuration (vite.config.ts)
```typescript
server: {
    host: '0.0.0.0',  // Penting! Bukan localhost
    port: 5173,
    cors: {
        origin: [
            'https://*.ngrok-free.app',  // Allow semua subdomain ngrok
            'YOUR_SPECIFIC_NGROK_URL',
        ],
        credentials: true,
    },
    hmr: {
        host: '0.0.0.0',  // Penting untuk HMR
    },
}
```

### Laravel CORS Middleware
- ✅ Sudah dikonfigurasi di `bootstrap/app.php`
- ✅ Allow semua domain ngrok
- ✅ Handle preflight requests
- ✅ Set proper CORS headers

## 🧪 Troubleshooting

### 1. **Masih Blank Page?**
```bash
# Clear browser cache di device eksternal
# Hard refresh (Ctrl+Shift+R)
# Check browser console untuk error
```

### 2. **CORS Errors?**
```bash
# Pastikan servers bind ke 0.0.0.0
# Restart servers setelah update konfigurasi
# Check CORS headers di browser network tab
```

### 3. **Assets Tidak Dimuat?**
```bash
# Pastikan Vite server running di 0.0.0.0:5173
# Check vite.config.ts CORS settings
# Clear Vite cache: rm -rf node_modules/.vite
```

### 4. **Session Issues?**
```bash
# Update SESSION_DOMAIN di .env
# Clear Laravel cache
# Restart Laravel server
```

## 📱 Testing dari Device Lain

### Android
- Buka Chrome
- Masukkan URL ngrok
- Clear cache jika perlu
- Check console untuk error

### iOS
- Buka Safari
- Masukkan URL ngrok
- Clear website data jika perlu
- Check console untuk error

### Laptop Lain
- Buka browser
- Masukkan URL ngrok
- Clear cache dan cookies
- Check developer tools

## 🔍 Debugging Commands

### Check Server Status
```bash
# Check Laravel process
ps aux | grep "php artisan serve"

# Check Vite process
ps aux | grep "vite"

# Check ports
ss -tulpn | grep -E ":8000|:5173"
```

### Check Environment
```bash
# Check .env variables
grep -E "(APP_URL|SESSION_DOMAIN|VITE_BASE_URL)" .env

# Check Laravel config
php artisan config:show app.url
```

### Check Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Vite logs (di terminal npm run dev)
```

## ⚠️ Penting!

1. **Host Binding**: Pastikan servers bind ke `0.0.0.0` bukan `localhost`
2. **CORS**: Update CORS origin sesuai domain ngrok Anda
3. **Cache**: Clear cache di browser device eksternal
4. **Environment**: Update semua environment variables yang terkait
5. **Restart**: Restart servers setelah update konfigurasi

## 🆘 Jika Masih Bermasalah

1. **Check versi ngrok** (gunakan versi terbaru)
2. **Check versi Node.js dan npm**
3. **Check versi PHP dan Laravel**
4. **Coba di browser yang berbeda**
5. **Coba di jaringan yang berbeda**
6. **Check firewall dan antivirus settings**

## 📚 Dokumentasi Lengkap

- `BLANK_PAGE_FIX.md` - Troubleshooting detail
- `NGROK_TROUBLESHOOTING.md` - Solusi masalah umum
- `NGROK_QUICK_FIX.md` - Quick fixes
- `NGROK_SETUP.md` - Setup awal

## 🎉 Success Criteria

Website berhasil diakses dari device lain jika:
- ✅ Halaman tampil normal (bukan blank)
- ✅ JavaScript berfungsi
- ✅ CSS styling tampil
- ✅ Tidak ada error di console
- ✅ Assets (gambar, font) dimuat
- ✅ HMR berfungsi (jika diaktifkan)

---

**Happy Coding! 🚀**