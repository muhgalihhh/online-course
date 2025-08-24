# Fix Blank Page Saat Akses Ngrok dari Device Lain

## Masalah: Blank Page di Device Berbeda

**Gejala**: 
- ✅ Buka di localhost → Normal
- ❌ Buka via ngrok di device lain → Blank page putih

## Penyebab Utama

### 1. **CORS Issues** (Cross-Origin Resource Sharing)
- Browser memblokir request dari domain ngrok ke localhost
- JavaScript/CSS tidak bisa dimuat karena policy CORS

### 2. **Asset Loading Problems**
- Vite assets tidak bisa diakses dari domain ngrok
- Path asset tidak sesuai dengan domain ngrok

### 3. **Session/Cookie Issues**
- Domain ngrok berbeda dengan localhost
- Session tidak konsisten antar domain

### 4. **Server Binding Issues**
- Server hanya bind ke localhost (127.0.0.1)
- Tidak bisa diakses dari IP eksternal

## Solusi Lengkap

### Step 1: Update Environment Variables

```bash
# Jalankan script quick fix
chmod +x quick-ngrok-test.sh
./quick-ngrok-test.sh
```

**Atau manual update .env:**
```env
APP_URL=https://YOUR_NGROK_URL.ngrok-free.app
SESSION_DOMAIN=YOUR_NGROK_URL.ngrok-free.app
VITE_BASE_URL=https://YOUR_NGROK_URL.ngrok-free.app
SANCTUM_STATEFUL_DOMAINS=YOUR_NGROK_URL.ngrok-free.app
CORS_ALLOWED_ORIGINS=https://YOUR_NGROK_URL.ngrok-free.app
```

### Step 2: Fix Vite Configuration

**Update vite.config.ts:**
```typescript
server: {
    host: '0.0.0.0',  // Penting! Bukan localhost
    port: 5173,
    cors: {
        origin: [
            'https://*.ngrok-free.app',  // Allow semua subdomain ngrok
            'https://*.ngrok.io',
            'YOUR_SPECIFIC_NGROK_URL',   // URL spesifik Anda
        ],
        credentials: true,
    },
    hmr: {
        host: '0.0.0.0',  // Penting untuk HMR
    },
}
```

### Step 3: Start Servers dengan Host yang Benar

```bash
# Terminal 1: Laravel Server
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Vite Dev Server
npm run dev -- --host 0.0.0.0 --port 5173

# Terminal 3: Ngrok Tunnel
ngrok http 8000
```

### Step 4: Clear Cache

```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Clear Vite cache
rm -rf node_modules/.vite
```

## Troubleshooting Step by Step

### 1. Test Local Access
```bash
# Test Laravel
curl http://localhost:8000

# Test Vite
curl http://localhost:5173
```

### 2. Test External Access
```bash
# Test dari IP lokal (bukan localhost)
curl http://YOUR_LOCAL_IP:8000
curl http://YOUR_LOCAL_IP:5173
```

### 3. Test Ngrok Access
```bash
# Test ngrok URL
curl https://YOUR_NGROK_URL.ngrok-free.app
```

### 4. Check CORS Headers
```bash
# Test CORS preflight
curl -H "Origin: https://YOUR_NGROK_URL.ngrok-free.app" \
     -X OPTIONS \
     http://localhost:8000
```

## Common Errors & Solutions

### Error: "Failed to load resource"
**Solusi:**
- Pastikan Vite server berjalan di `0.0.0.0:5173`
- Update CORS origin di vite.config.ts
- Clear browser cache

### Error: "WebSocket connection failed"
**Solusi:**
- Update HMR host ke `0.0.0.0`
- Restart Vite server
- Check firewall settings

### Error: "Session expired" atau login tidak konsisten
**Solusi:**
- Update SESSION_DOMAIN di .env
- Clear Laravel cache
- Restart Laravel server

## Browser Testing Checklist

### Di Device Eksternal:
1. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R)
2. **Disable Extensions** - Coba di incognito mode
3. **Check Console** - Lihat error di Developer Tools
4. **Network Tab** - Cek request yang gagal

### Di Device Lokal:
1. **Test localhost** - Pastikan berfungsi normal
2. **Test IP lokal** - Pastikan bisa diakses via IP
3. **Test ngrok** - Pastikan tunnel aktif

## Debugging Commands

### Check Server Status
```bash
# Check Laravel process
ps aux | grep "php artisan serve"

# Check Vite process
ps aux | grep "vite"

# Check ports
netstat -tulpn | grep -E ":8000|:5173"
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

## Quick Fix Script

Gunakan script yang sudah dibuat:

```bash
# Script lengkap dengan auto-fix
chmod +x fix-ngrok-access.sh
./fix-ngrok-access.sh

# Script sederhana untuk testing
chmod +x quick-ngrok-test.sh
./quick-ngrok-test.sh
```

## Fallback Options

Jika ngrok masih bermasalah:

1. **Use localhost development** untuk testing cepat
2. **Use ngrok with custom domain** (jika tersedia)
3. **Use Laravel Valet** dengan ngrok (macOS)
4. **Use Docker** dengan port mapping

## Testing dari Device Lain

### Android:
- Buka Chrome
- Masukkan URL ngrok
- Clear cache jika perlu
- Check console untuk error

### iOS:
- Buka Safari
- Masukkan URL ngrok
- Clear website data jika perlu
- Check console untuk error

### Laptop Lain:
- Buka browser
- Masukkan URL ngrok
- Clear cache dan cookies
- Check developer tools

## Verifikasi Sukses

Website berhasil diakses dari device lain jika:
- ✅ Halaman tampil normal (bukan blank)
- ✅ JavaScript berfungsi
- ✅ CSS styling tampil
- ✅ Tidak ada error di console
- ✅ Assets (gambar, font) dimuat
- ✅ HMR berfungsi (jika diaktifkan)

## Support

Jika masalah masih berlanjut:
1. Periksa versi ngrok (gunakan versi terbaru)
2. Periksa versi Node.js dan npm
3. Periksa versi PHP dan Laravel
4. Coba di browser yang berbeda
5. Coba di jaringan yang berbeda
6. Check firewall dan antivirus settings