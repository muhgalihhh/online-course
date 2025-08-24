# Ngrok Error Fix Guide

## Masalah yang Ditemui

Berdasarkan error yang Anda alami, ada beberapa masalah utama:

1. **CORS Error**: Browser memblokir request dari domain ngrok ke localhost:5173
2. **Missing share-modal.js**: File JavaScript yang direferensikan tidak ada
3. **HMR Configuration**: Hot Module Replacement tidak dikonfigurasi dengan benar

## Solusi yang Telah Diterapkan

### 1. ✅ Konfigurasi Vite yang Diperbaiki

File `vite.config.ts` telah diperbarui dengan:
- CORS headers yang lebih lengkap
- HMR configuration yang tepat untuk ngrok
- Origin whitelist yang mencakup domain ngrok Anda

### 2. ✅ File share-modal.js Placeholder

File `public/share-modal.js` telah dibuat untuk mengatasi error:
```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
```

### 3. ✅ CORS Middleware Laravel

Middleware CORS sudah dikonfigurasi di `app/Http/Middleware/CorsMiddleware.php`

### 4. ✅ Script Otomatis

Script `fix-ngrok-errors.sh` telah dibuat untuk restart server dengan konfigurasi yang benar

## Langkah-langkah Perbaikan

### Step 1: Jalankan Script Perbaikan

```bash
./fix-ngrok-errors.sh
```

Script ini akan:
- Menghentikan server yang berjalan
- Clear cache Laravel dan Vite
- Update environment variables untuk ngrok
- Restart server dengan konfigurasi yang benar

### Step 2: Pastikan Ngrok Berjalan

```bash
ngrok http 8000
```

### Step 3: Clear Browser Cache

1. Buka Developer Tools (F12)
2. Klik kanan pada tombol refresh
3. Pilih "Empty Cache and Hard Reload"
4. Atau gunakan incognito mode

### Step 4: Test Akses

1. Akses via ngrok: `https://joint-strongly-bulldog.ngrok-free.app`
2. Periksa console browser untuk error yang tersisa
3. Pastikan semua resource (CSS, JS) dimuat dengan benar

## Troubleshooting Lanjutan

### Jika CORS Error Masih Muncul

1. **Periksa Vite Server**:
   ```bash
   curl -I http://localhost:5173
   ```

2. **Test CORS Headers**:
   ```bash
   curl -H "Origin: https://joint-strongly-bulldog.ngrok-free.app" \
        -X OPTIONS \
        http://localhost:5173
   ```

3. **Restart Vite dengan Manual**:
   ```bash
   pkill -f vite
   export VITE_BASE_URL="https://joint-strongly-bulldog.ngrok-free.app"
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

### Jika HMR Tidak Berfungsi

1. **Periksa WebSocket Connection**:
   - Buka Developer Tools
   - Tab Network
   - Filter by WS (WebSocket)
   - Pastikan connection ke `ws://localhost:5173` berhasil

2. **Update HMR Configuration**:
   ```javascript
   // Di vite.config.ts
   hmr: {
       host: 'localhost',
       port: 5173,
       protocol: 'ws',
       clientPort: 5173,
       overlay: false
   }
   ```

### Jika Session/Cookie Bermasalah

1. **Periksa Environment Variables**:
   ```bash
   grep -E "(APP_URL|SESSION_DOMAIN|VITE_BASE_URL)" .env
   ```

2. **Clear Laravel Cache**:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

## Konfigurasi Environment yang Benar

Pastikan file `.env` memiliki konfigurasi berikut:

```env
APP_URL=https://joint-strongly-bulldog.ngrok-free.app
SESSION_DOMAIN=.ngrok-free.app
VITE_BASE_URL=https://joint-strongly-bulldog.ngrok-free.app
VITE_DEV_SERVER_URL=https://joint-strongly-bulldog.ngrok-free.app
```

## Monitoring dan Debug

### Laravel Logs
```bash
tail -f storage/logs/laravel.log
```

### Vite Logs
Logs akan muncul di terminal yang menjalankan `npm run dev`

### Browser Console
Periksa console browser untuk error JavaScript yang tersisa

## Fallback Options

Jika masalah masih berlanjut:

1. **Gunakan Localhost Development**:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   npm run dev
   ```

2. **Disable HMR Sementara**:
   ```javascript
   // Di vite.config.ts
   hmr: false
   ```

3. **Gunakan Build Production**:
   ```bash
   npm run build
   php artisan serve --host=0.0.0.0 --port=8000
   ```

## Verifikasi Perbaikan

Setelah menjalankan semua langkah di atas, Anda seharusnya tidak lagi melihat error:

- ❌ `Cannot read properties of null (reading 'addEventListener')`
- ❌ `Access to script blocked by CORS policy`
- ❌ `GET http://localhost:5173/@vite/client net::ERR_FAILED`

Dan seharusnya melihat:
- ✅ Halaman web dimuat dengan benar
- ✅ CSS dan JavaScript berfungsi
- ✅ HMR (Hot Module Replacement) berfungsi
- ✅ Tidak ada error di console browser

## Support

Jika masalah masih berlanjut setelah mengikuti semua langkah di atas:

1. Periksa versi ngrok (gunakan versi terbaru)
2. Periksa versi Node.js dan npm
3. Periksa versi PHP dan Laravel
4. Coba di browser yang berbeda
5. Coba di jaringan yang berbeda