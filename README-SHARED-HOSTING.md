# 🎓 PareEduHUB - Online Course Platform

Sistem manajemen kursus online yang dibangun dengan Laravel dan React (Inertia.js).

## 🚀 Quick Deploy ke Shared Hosting

### Opsi 1: Menggunakan Package Otomatis (Recommended)

1. **Buat package deployment:**

    ```bash
    # Windows
    create-deployment-package.bat

    # Linux/Mac
    chmod +x create-deployment-package.sh
    ./create-deployment-package.sh
    ```

2. **Upload ke hosting:**
    - Upload file `.zip` yang dihasilkan ke shared hosting
    - Extract di root directory hosting Anda

3. **Setup otomatis:**

    ```bash
    # Jalankan script setup
    deploy-shared-hosting.bat  # Windows
    # atau
    ./deploy-shared-hosting.sh  # Linux

    # Atau gunakan Artisan command
    php artisan setup:shared-hosting
    ```

### Opsi 2: Manual Setup

1. **Build project:**

    ```bash
    npm run build
    composer install --no-dev --optimize-autoloader
    ```

2. **Upload files ke hosting** (semua folder kecuali `node_modules/`, `tests/`, `.git/`)

3. **Konfigurasi .env:**
    - Copy `.env.shared-hosting` ke `.env`
    - Update database credentials
    - Set `APP_ENV=production`, `APP_DEBUG=false`
    - Update `APP_URL` dengan domain Anda

4. **Setup database:**

    ```bash
    php artisan migrate --force
    php artisan db:seed --force
    ```

5. **Setup storage:**

    ```bash
    php artisan storage:link
    php artisan setup:shared-hosting
    ```

6. **Optimize:**
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

## 📁 Struktur untuk Shared Hosting

Pastikan domain Anda mengarah ke folder `public/` atau sesuaikan struktur:

```
your-hosting-root/
├── .htaccess              # Redirect ke public/
├── .env                   # Environment production
├── app/, bootstrap/, config/, database/, etc.
└── public/                # Document root
    ├── index.php          # Entry point
    ├── storage/           # Files storage (bukan symlink)
    └── build/             # CSS/JS assets
```

## 🔧 Fitur Khusus Shared Hosting

### SharedHostingStorageHelper

Helper untuk menangani file storage di shared hosting:

```php
use App\Helpers\SharedHostingStorageHelper;

// Upload file
$path = SharedHostingStorageHelper::uploadFile($file, 'courses');

// Get URL
$url = SharedHostingStorageHelper::getFileUrl($path);

// Delete file
SharedHostingStorageHelper::deleteFile($path);
```

### Storage Macros

```php
use Illuminate\Support\Facades\Storage;

// Upload dengan macro
$path = Storage::putFileSharedHosting('courses', $file);

// Get URL
$url = Storage::urlSharedHosting($path);
```

### Auto Storage Setup

- Middleware `EnsureStorageExists` otomatis membuat folder storage
- ServiceProvider `SharedHostingServiceProvider` setup macro dan direktori

## 🛠️ Development

### Requirements

- PHP >= 8.1
- Node.js >= 16
- MySQL/MariaDB
- Composer

### Local Setup

```bash
# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate
php artisan db:seed

# Storage
php artisan storage:link

# Development server
php artisan serve
npm run dev
```

## 📋 Checklist Deployment

- [ ] ✅ Build assets (`npm run build`)
- [ ] ✅ Install dependencies (`composer install --no-dev`)
- [ ] ✅ Upload files ke hosting
- [ ] ✅ Setup `.env` untuk production
- [ ] ✅ Run migrations (`php artisan migrate --force`)
- [ ] ✅ Setup storage (`php artisan setup:shared-hosting`)
- [ ] ✅ Cache config (`php artisan config:cache`)
- [ ] ✅ Set file permissions (755/644)
- [ ] ✅ Test website berfungsi
- [ ] ✅ Test upload file
- [ ] ✅ SSL aktif

## 🚨 Troubleshooting

### File upload tidak berfungsi

- Periksa folder `public/storage/` ada dan writable
- Jalankan `php artisan setup:shared-hosting`
- Set permissions: 755 untuk folder, 644 untuk file

### 500 Internal Server Error

- Periksa file permissions
- Periksa `.env` file exists dan benar
- Clear cache: `php artisan cache:clear`

### Database error

- Verifikasi credentials di `.env`
- Pastikan database sudah dibuat di hosting panel

### Assets tidak load

- Pastikan `npm run build` sudah dijalankan
- Upload folder `public/build/`
- Periksa `APP_URL` di `.env`

## 📞 Support

Untuk panduan lengkap deployment, lihat: `DEPLOYMENT-SHARED-HOSTING.md`

---

**Catatan:** Project ini sudah dioptimalkan khusus untuk shared hosting dengan handling otomatis untuk storage, permissions, dan konfigurasi.
