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
- Mengkonfigurasi HMR (Hot Module Replacement)

### 2. Middleware CORS Laravel
- Membuat `CorsMiddleware` custom di `app/Http/Middleware/CorsMiddleware.php`
- Menambahkan middleware ke `bootstrap/app.php`
- Mengizinkan semua origin untuk development

### 3. Konfigurasi Environment
- Mengupdate `APP_URL` di `.env` ke domain ngrok
- Menggenerate `APP_KEY` yang valid
- Mengatur `SESSION_DOMAIN` untuk ngrok

## Cara Menjalankan

### 1. Start Laravel Server
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Start Vite Development Server
```bash
./start-dev.sh
```

### 3. Start Ngrok
```bash
ngrok http 8000
```

## File yang Dimodifikasi

1. `vite.config.ts` - Konfigurasi Vite untuk ngrok
2. `app/Http/Middleware/CorsMiddleware.php` - Middleware CORS custom
3. `bootstrap/app.php` - Registrasi middleware CORS
4. `config/cors.php` - Konfigurasi CORS Laravel
5. `.env` - Environment variables untuk ngrok
6. `start-dev.sh` - Script untuk menjalankan Vite

## Troubleshooting

### Jika masih ada error CORS:
1. Pastikan Vite server berjalan dengan `host: '0.0.0.0'`
2. Periksa bahwa domain ngrok sudah ditambahkan ke allowed origins
3. Clear cache browser dan restart development server

### Jika HMR tidak berfungsi:
1. Pastikan konfigurasi HMR di `vite.config.ts` sudah benar
2. Periksa firewall settings
3. Restart Vite server

## Catatan Keamanan

Konfigurasi ini hanya untuk development. Untuk production:
- Hapus `allowed_origins: ['*']`
- Batasi origins yang diizinkan
- Gunakan HTTPS
- Konfigurasi CORS dengan lebih ketat