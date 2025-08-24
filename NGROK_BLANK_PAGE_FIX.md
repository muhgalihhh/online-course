# Ngrok Blank Page Fix Guide

## Masalah yang Diatasi
- Blank page saat mengakses ngrok dari device lain
- CORS errors
- Asset loading issues
- HMR (Hot Module Replacement) tidak berfungsi

## Solusi yang Diterapkan

### 1. Environment Variables
- `APP_URL`: URL ngrok lengkap
- `SESSION_DOMAIN`: Domain ngrok untuk session
- `VITE_BASE_URL`: Base URL untuk Vite
- `VITE_DEV_SERVER_URL`: Dev server URL untuk external access

### 2. Vite Configuration
- Host binding ke `0.0.0.0` untuk external access
- CORS configuration untuk domain ngrok
- HMR configuration yang benar untuk external devices
- WebSocket protocol configuration

### 3. Server Configuration
- Laravel server berjalan di `0.0.0.0:8000`
- Vite server berjalan di `0.0.0.0:5173`
- CORS headers yang benar

## Cara Menggunakan

### 1. Jalankan Script Perbaikan
```bash
./fix-blank-page-ngrok.sh
```

### 2. Start Servers
```bash
./start-ngrok-fixed.sh
```

### 3. Start Ngrok
```bash
ngrok http 8000
```

## Troubleshooting

### Jika masih blank page:
1. Clear browser cache dan cookies
2. Gunakan incognito mode
3. Periksa browser console untuk errors
4. Pastikan ngrok tunnel aktif
5. Coba akses dari device yang berbeda

### CORS Errors:
1. Pastikan domain ngrok sudah benar di .env
2. Restart servers setelah update .env
3. Clear Laravel cache: `php artisan cache:clear`

### HMR tidak berfungsi:
1. Pastikan WebSocket tidak diblokir firewall
2. Periksa konfigurasi HMR di vite.config.ngrok.ts
3. Refresh manual jika HMR gagal

## Testing Checklist

- [ ] Ngrok tunnel aktif
- [ ] Laravel server berjalan di 0.0.0.0:8000
- [ ] Vite server berjalan di 0.0.0.0:5173
- [ ] Environment variables sudah benar
- [ ] Browser cache sudah di-clear
- [ ] Coba akses dari device lain
- [ ] Periksa browser console untuk errors

## Fallback Options

Jika masih bermasalah:
1. Gunakan localhost development
2. Coba browser yang berbeda
3. Coba jaringan yang berbeda
4. Periksa firewall settings
