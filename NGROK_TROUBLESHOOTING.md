# Ngrok Troubleshooting Guide

## Error yang Sering Ditemui dan Solusinya

### 1. Error: "Cannot read properties of null (reading 'addEventListener')"

**Penyebab**: JavaScript mencoba mengakses elemen yang belum ada di DOM atau `null`.

**Solusi yang Diterapkan**:
- ✅ Memperbaiki `use-appearance.tsx` dengan proper null checks
- ✅ Menambahkan conditional checks sebelum `addEventListener`

**Jika masih terjadi**:
```javascript
// Pastikan elemen ada sebelum menambahkan event listener
const element = document.getElementById('myElement');
if (element) {
    element.addEventListener('click', handleClick);
}
```

### 2. CORS Error: "Access to script blocked by CORS policy"

**Penyebab**: Browser memblokir request cross-origin dari ngrok ke localhost.

**Solusi yang Diterapkan**:
- ✅ Konfigurasi CORS di `vite.config.ts`
- ✅ Middleware CORS custom di Laravel
- ✅ Environment variables untuk ngrok

**Langkah Debugging**:
```bash
# 1. Periksa apakah Vite berjalan dengan host yang benar
curl -I http://0.0.0.0:5173

# 2. Test CORS headers
curl -H "Origin: https://9c43d871631f.ngrok-free.app" \
     -X OPTIONS \
     http://localhost:8000

# 3. Periksa environment variables
grep VITE_BASE_URL .env
```

### 3. HMR (Hot Module Replacement) Tidak Berfungsi

**Penyebab**: WebSocket connection untuk HMR tidak bisa terhubung melalui ngrok.

**Solusi yang Diterapkan**:
- ✅ Konfigurasi HMR dengan protocol WebSocket
- ✅ Host binding ke `0.0.0.0`

**Jika masih bermasalah**:
```bash
# Restart Vite dengan konfigurasi yang benar
pkill -f vite
npm run dev -- --host 0.0.0.0 --port 5173
```

### 4. Session/Cookie Tidak Konsisten

**Penyebab**: Domain ngrok berbeda dengan localhost.

**Solusi yang Diterapkan**:
- ✅ `SESSION_DOMAIN=.ngrok-free.app`
- ✅ `APP_URL=https://9c43d871631f.ngrok-free.app`

**Verifikasi**:
```bash
# Periksa session domain di .env
grep SESSION_DOMAIN .env
grep APP_URL .env
```

## Checklist Sebelum Menjalankan Ngrok

### ✅ Environment Setup
- [ ] `.env` file ada dan terkonfigurasi
- [ ] `APP_KEY` sudah di-generate
- [ ] `APP_URL` mengarah ke domain ngrok
- [ ] `SESSION_DOMAIN` sudah diset
- [ ] `VITE_BASE_URL` sudah diset

### ✅ Server Configuration
- [ ] Laravel server berjalan di `0.0.0.0:8000`
- [ ] Vite server berjalan di `0.0.0.0:5173`
- [ ] CORS middleware terdaftar di `bootstrap/app.php`
- [ ] `vite.config.ts` sudah dikonfigurasi untuk ngrok

### ✅ Network & Security
- [ ] Port 8000 dan 5173 tidak diblokir firewall
- [ ] Ngrok tunnel aktif dan berfungsi
- [ ] Browser cache sudah di-clear
- [ ] Tidak ada proses yang menggunakan port yang sama

## Langkah-langkah Debugging Step by Step

### Step 1: Verifikasi Environment
```bash
# Jalankan script setup
./start-ngrok.sh

# Periksa hasil
cat .env | grep -E "(APP_URL|SESSION_DOMAIN|VITE_BASE_URL)"
```

### Step 2: Start Servers
```bash
# Opsi A: Script otomatis
./start-dev-ngrok.sh

# Opsi B: Manual
php artisan serve --host=0.0.0.0 --port=8000 &
npm run dev -- --host 0.0.0.0 --port 5173 &
```

### Step 3: Test Local Access
```bash
# Test Laravel
curl http://localhost:8000

# Test Vite
curl http://localhost:5173
```

### Step 4: Start Ngrok
```bash
ngrok http 8000
```

### Step 5: Test Ngrok Access
```bash
# Ganti dengan URL ngrok Anda
curl https://9c43d871631f.ngrok-free.app
```

## Common Issues dan Quick Fixes

### Issue: "Port already in use"
```bash
# Kill existing processes
pkill -f "php artisan serve"
pkill -f "vite"
```

### Issue: "Permission denied" pada script
```bash
chmod +x start-dev-ngrok.sh
chmod +x start-vite-ngrok.sh
```

### Issue: "Module not found" di browser
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Issue: "Session expired" atau login tidak konsisten
```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Monitoring dan Logs

### Laravel Logs
```bash
tail -f storage/logs/laravel.log
```

### Vite Logs
```bash
# Vite logs akan muncul di terminal yang menjalankan npm run dev
```

### Ngrok Logs
```bash
# Ngrok logs akan muncul di terminal yang menjalankan ngrok
```

## Performance Tips

1. **Use ngrok with custom domain** (jika tersedia) untuk konsistensi
2. **Disable browser extensions** yang mungkin mengganggu CORS
3. **Use incognito mode** untuk testing yang bersih
4. **Monitor network tab** di browser developer tools

## Fallback Options

Jika ngrok masih bermasalah:

1. **Use localhost development** untuk testing cepat
2. **Use Laravel Valet** dengan ngrok (jika menggunakan macOS)
3. **Use Laravel Homestead** dengan port forwarding
4. **Use Docker** dengan port mapping

## Support

Jika masalah masih berlanjut:
1. Periksa versi ngrok (gunakan versi terbaru)
2. Periksa versi Node.js dan npm
3. Periksa versi PHP dan Laravel
4. Coba di browser yang berbeda
5. Coba di jaringan yang berbeda