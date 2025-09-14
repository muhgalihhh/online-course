# 🚀 Panduan Deploy ke Shared Hosting

## 📋 Persiapan Sebelum Upload

### 1. Environment Setup

1. Copy file `.env.shared-hosting` menjadi `.env`
2. Sesuaikan konfigurasi database, email, dan domain Anda
3. Set `APP_ENV=production` dan `APP_DEBUG=false`
4. Update `APP_URL` dengan domain Anda

### 2. Build Assets

```bash
npm run build
```

### 3. Optimize untuk Production

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📁 Struktur File untuk Upload

Untuk shared hosting, Anda perlu mengupload semua file ke root directory hosting Anda. Pastikan struktur seperti ini:

```
your-hosting-root/
├── .htaccess                 # Redirect ke public/
├── .env                      # Environment production
├── app/                      # Laravel app files
├── bootstrap/
├── config/
├── database/
├── public/                   # Entry point aplikasi
│   ├── index.php
│   ├── storage/             # Storage files (bukan symlink)
│   └── ...
├── resources/
├── routes/
├── storage/
├── vendor/
└── ...
```

## 🔧 Langkah Deployment

### Opsi 1: Menggunakan Script Otomatis

#### Windows:

```cmd
deploy-shared-hosting.bat
```

#### Linux/Mac:

```bash
chmod +x deploy-shared-hosting.sh
./deploy-shared-hosting.sh
```

### Opsi 2: Manual Steps

1. **Upload semua file ke hosting**
2. **Set file permissions:**
    - Folders: 755
    - Files: 644
    - Special: 775 untuk `storage/` dan `bootstrap/cache/`

3. **Setup storage:**

    ```bash
    php artisan storage:link
    ```

4. **Database setup:**

    ```bash
    php artisan migrate --force
    php artisan db:seed --force
    ```

5. **Clear & cache:**
    ```bash
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

## 🛠️ Konfigurasi Khusus Shared Hosting

### 1. Storage Configuration

Aplikasi ini sudah dikonfigurasi dengan `SharedHostingStorageHelper` yang akan:

- Otomatis membuat direktori storage
- Handle file upload langsung ke `public/storage/`
- Fallback jika symbolic link tidak berfungsi

### 2. Database Configuration

Pastikan di `.env` Anda:

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### 3. Mail Configuration

Untuk SMTP hosting:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
```

### 4. Queue Configuration

Untuk shared hosting, gunakan database queue:

```env
QUEUE_CONNECTION=database
```

Kemudian jalankan:

```bash
php artisan queue:table
php artisan migrate
```

## 🔒 Security Setup

### 1. File Permissions

```bash
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod -R 775 storage bootstrap/cache
```

### 2. Protect Sensitive Files

File `.htaccess` di root sudah dikonfigurasi untuk melindungi:

- `.env`
- `composer.json`
- `composer.lock`
- Files yang dimulai dengan `.`

### 3. SSL/HTTPS

Pastikan hosting Anda sudah mengaktifkan SSL dan update:

```env
APP_URL=https://yourdomain.com
```

## 🚨 Troubleshooting

### Problem: Storage files tidak bisa diakses

**Solusi:**

1. Pastikan `public/storage/` ada dan berisi file
2. Cek permissions folder (755/775)
3. Gunakan `SharedHostingStorageHelper` untuk upload file

### Problem: 500 Internal Server Error

**Solusi:**

1. Cek file permissions
2. Pastikan `.env` ada dan benar
3. Cek error log hosting
4. Clear cache: `php artisan cache:clear`

### Problem: Database connection error

**Solusi:**

1. Verifikasi kredensial database di `.env`
2. Pastikan database sudah dibuat di hosting
3. Test koneksi dengan script sederhana

### Problem: Assets tidak load (CSS/JS)

**Solusi:**

1. Pastikan `npm run build` sudah dijalankan
2. Upload folder `public/build/`
3. Cek `APP_URL` di `.env`

### Problem: Symlink tidak berfungsi

**Solusi:**

1. Gunakan `SharedHostingStorageHelper::createStorageLink()`
2. Atau copy manual dari `storage/app/public/` ke `public/storage/`

## ✅ Checklist Setelah Deploy

- [ ] Website bisa diakses
- [ ] Database terkoneksi
- [ ] File upload berfungsi
- [ ] Email terkirim
- [ ] SSL aktif
- [ ] Error log bersih
- [ ] Performance optimal

## 📞 Support

Jika ada masalah, cek:

1. Error log hosting Anda
2. Laravel log di `storage/logs/`
3. Browser developer console untuk error frontend

---

**Catatan:** Setiap shared hosting provider mungkin memiliki konfigurasi yang sedikit berbeda. Sesuaikan panduan ini dengan dokumentasi hosting provider Anda.
