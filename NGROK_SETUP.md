# Konfigurasi Ngrok untuk Laravel + Vite

## Masalah CORS yang Diatasi

Masalah CORS terjadi karena:
1. Vite development server berjalan di `localhost:5173`
2. Ngrok membuat tunnel ke domain eksternal (`https://9c43d871631f.ngrok-free.app`)
3. Browser memblokir request cross-origin dari domain ngrok ke localhost

## Solusi yang Diterapkan

### 1. Konfigurasi Vite (`vite.config.ts`)
- Mengatur `host: '0.0.0.0'` untuk menerima koneksi eksternal
- Menambahkan CORS origin untuk domain ngrok
- Mengkonfigurasi HMR (Hot Module Replacement) dengan protocol WebSocket
- Menambahkan konfigurasi `preview` untuk production-like environment

### 2. Middleware CORS Laravel
- Membuat `CorsMiddleware` custom di `app/Http/Middleware/CorsMiddleware.php`
- Menambahkan middleware ke `bootstrap/app.php`
- Mengizinkan semua origin untuk development

### 3. Konfigurasi Environment
- Mengupdate `APP_URL` di `.env` ke domain ngrok
- Menggenerate `APP_KEY` yang valid
- Mengatur `SESSION_DOMAIN` untuk ngrok
- Menambahkan `VITE_BASE_URL` untuk Vite

### 4. Perbaikan JavaScript
- Memperbaiki null checks di `use-appearance.tsx`
- Menambahkan proper error handling untuk `addEventListener`

## Cara Menjalankan

### Opsi 1: Script Otomatis (Direkomendasikan)
```bash
./start-dev-ngrok.sh
```

### Opsi 2: Manual
```bash
# 1. Setup environment
./start-ngrok.sh

# 2. Start Laravel server
php artisan serve --host=0.0.0.0 --port=8000

# 3. Start Vite server
./start-vite-ngrok.sh

# 4. Start ngrok
ngrok http 8000
```

## File yang Dimodifikasi

1. `vite.config.ts` - Konfigurasi Vite untuk ngrok dengan HMR yang benar
2. `app/Http/Middleware/CorsMiddleware.php` - Middleware CORS custom
3. `bootstrap/app.php` - Registrasi middleware CORS
4. `config/cors.php` - Konfigurasi CORS Laravel
5. `.env` - Environment variables untuk ngrok
6. `resources/js/hooks/use-appearance.tsx` - Perbaikan null checks
7. `start-dev-ngrok.sh` - Script otomatis untuk menjalankan semua server
8. `start-vite-ngrok.sh` - Script khusus untuk Vite dengan ngrok

## Troubleshooting

### Error: "Cannot read properties of null (reading 'addEventListener')"
**Solusi**: Sudah diperbaiki di `use-appearance.tsx` dengan proper null checks.

### Error CORS masih muncul:
1. Pastikan Vite server berjalan dengan `host: '0.0.0.0'`
2. Periksa bahwa domain ngrok sudah ditambahkan ke allowed origins
3. Clear cache browser dan restart development server
4. Coba akses via localhost terlebih dahulu

### HMR tidak berfungsi:
1. Pastikan konfigurasi HMR di `vite.config.ts` sudah benar
2. Periksa firewall settings
3. Restart Vite server
4. Pastikan WebSocket connection tidak diblokir

### Script tidak berjalan:
1. Pastikan file memiliki permission execute: `chmod +x start-dev-ngrok.sh`
2. Periksa bahwa semua dependencies terinstall
3. Pastikan port 8000 dan 5173 tidak digunakan oleh aplikasi lain

## Langkah-langkah Debugging

### 1. Periksa Server Status
```bash
# Cek apakah Laravel berjalan
curl http://localhost:8000

# Cek apakah Vite berjalan
curl http://localhost:5173
```

### 2. Periksa CORS Headers
```bash
# Test CORS headers
curl -H "Origin: https://9c43d871631f.ngrok-free.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000
```

### 3. Periksa Environment Variables
```bash
# Pastikan VITE_BASE_URL sudah benar
grep VITE_BASE_URL .env
```

## Catatan Keamanan

Konfigurasi ini hanya untuk development. Untuk production:
- Hapus `allowed_origins: ['*']`
- Batasi origins yang diizinkan
- Gunakan HTTPS
- Konfigurasi CORS dengan lebih ketat
- Hapus atau batasi middleware CORS custom

## Tips Tambahan

1. **Browser Cache**: Selalu clear cache browser saat testing ngrok
2. **HTTPS**: Ngrok menggunakan HTTPS, pastikan semua assets dimuat via HTTPS
3. **Session**: Gunakan `SESSION_DOMAIN=.ngrok-free.app` untuk session yang konsisten
4. **Hot Reload**: Jika HMR tidak berfungsi, refresh manual masih bisa digunakan