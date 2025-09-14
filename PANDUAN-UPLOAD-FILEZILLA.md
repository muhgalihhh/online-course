# 📁 Panduan Upload ke Shared Hosting via FileZilla

## 🚀 Langkah 1: Persiapan File untuk Upload

### 1.1 Build Project untuk Production

```cmd
# Pastikan Anda di root project
npm run build
composer install --no-dev --optimize-autoloader
```

### 1.2 Buat Package Deployment (Opsional - Mudah)

```cmd
# Jalankan script ini untuk buat zip file siap upload
create-deployment-package.bat
```

## 📤 Langkah 2: Upload via FileZilla

### 2.1 Koneksi ke Hosting

1. Buka **FileZilla**
2. Masukkan koneksi hosting:
    - **Host/Server:** `ftp.domainanda.com` atau IP hosting
    - **Username:** Username FTP hosting Anda
    - **Password:** Password FTP hosting Anda
    - **Port:** `21` (FTP) atau `22` (SFTP)

### 2.2 Struktur Upload

Ada 2 cara upload:

#### **Cara A: Upload ZIP Package (Recommended)**

1. Upload file `online-course-shared-hosting.zip` ke root hosting
2. Extract via **File Manager** hosting atau **cPanel**
3. Lanjut ke **Langkah 3**

#### **Cara B: Upload Manual Folder**

Upload semua folder/file ini ke **root directory** hosting Anda:

```
hosting-root/
├── app/                    ✅ Upload
├── bootstrap/              ✅ Upload
├── config/                 ✅ Upload
├── database/               ✅ Upload
├── lang/                   ✅ Upload
├── public/                 ✅ Upload (Penting!)
├── resources/              ✅ Upload
├── routes/                 ✅ Upload
├── storage/                ✅ Upload
├── vendor/                 ✅ Upload
├── .htaccess               ✅ Upload
├── artisan                 ✅ Upload
├── composer.json           ✅ Upload
├── composer.lock           ✅ Upload
├── .env.shared-hosting     ✅ Upload (rename ke .env)
└── README-SHARED-HOSTING.md ✅ Upload
```

⚠️ **JANGAN UPLOAD:**

- `node_modules/` (terlalu besar)
- `.git/` (tidak perlu)
- `tests/` (tidak perlu di production)
- `.env` (gunakan .env.shared-hosting)

### 2.3 Upload Process

1. **Drag & Drop** folder dari komputer ke FileZilla
2. Tunggu upload selesai (bisa lama tergantung internet)
3. Pastikan semua file terupload dengan benar

## ⚙️ Langkah 3: Setup via cPanel/File Manager

### 3.1 Setup File .env

1. Masuk ke **cPanel → File Manager**
2. Rename `.env.shared-hosting` menjadi `.env`
3. Edit file `.env` dan sesuaikan:

```env
APP_NAME="PareEduHUB"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domainanda.com

# Database - Dapatkan dari cPanel Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=namadatabase_anda
DB_USERNAME=username_database
DB_PASSWORD=password_database

# Email SMTP - Dapatkan dari hosting
MAIL_HOST=mail.domainanda.com
MAIL_USERNAME=noreply@domainanda.com
MAIL_PASSWORD=password_email
```

### 3.2 Setup Domain/Subdomain

**Pilih salah satu:**

#### **Opsi A: Domain Utama**

1. **cPanel → Subdomains/Addon Domains**
2. Set **Document Root** ke: `public_html/public`

#### **Opsi B: Subdomain**

1. **cPanel → Subdomains**
2. Buat subdomain: `kursus.domainanda.com`
3. Set **Document Root** ke: `public_html/public`

#### **Opsi C: Folder (jika tidak bisa setting document root)**

1. Upload semua file ke `public_html/kursus/`
2. Akses via: `https://domainanda.com/kursus/`

### 3.3 Setup Database

1. **cPanel → MySQL Databases**
2. **Buat database baru:** `namadatabase_kursus`
3. **Buat user database** dengan password
4. **Assign user ke database** dengan semua privileges

## 🔧 Langkah 4: Setup Aplikasi via Terminal/SSH

### 4.1 Masuk Terminal (jika tersedia)

```bash
# Via SSH atau Terminal cPanel
cd public_html  # atau ke folder upload Anda
```

### 4.2 Setup Otomatis

```bash
# Generate application key
php artisan key:generate --force

# Setup storage untuk shared hosting
php artisan setup:shared-hosting

# Setup database
php artisan migrate --force

# Seed data (opsional)
php artisan db:seed --force

# Cache untuk performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4.3 Setup Manual (jika tidak ada terminal)

Via **cPanel File Manager**:

1. **Set Permissions:**
    - Folder `storage/` → **755**
    - Folder `bootstrap/cache/` → **755**
    - File lainnya → **644**

2. **Buat folder storage manual:**
    ```
    public/storage/courses/
    public/storage/gallery/
    public/storage/institutions/
    public/storage/materials/
    public/storage/profile-photos/
    ```

## 📋 Langkah 5: Setup Database via phpMyAdmin

### 5.1 Import Database (jika ada)

1. **cPanel → phpMyAdmin**
2. Pilih database Anda
3. **Import** → Upload file SQL

### 5.2 Run Migrations Manual

Jika tidak bisa via terminal, upload file SQL ini via phpMyAdmin:

1. Export database struktur dari local: `php artisan migrate --pretend`
2. Atau jalankan query SQL untuk create tables

## ✅ Langkah 6: Testing & Verifikasi

### 6.1 Cek Website

1. Buka: `https://domainanda.com`
2. Pastikan website load tanpa error
3. Test login/register
4. Test upload file

### 6.2 Cek Error Log

1. **cPanel → Error Logs**
2. Lihat jika ada error PHP
3. Fix sesuai error yang muncul

### 6.3 Test Fungsionalitas

- [ ] ✅ Homepage load
- [ ] ✅ Login/Register works
- [ ] ✅ Database connected
- [ ] ✅ File upload works
- [ ] ✅ Email send works
- [ ] ✅ Images display
- [ ] ✅ No 500 errors

## 🚨 Troubleshooting FileZilla & Hosting

### Problem: FileZilla tidak bisa connect

**Solusi:**

- Cek hostname: biasanya `ftp.domainanda.com`
- Cek port: 21 (FTP) atau 22 (SFTP)
- Cek username/password dari hosting panel
- Coba ganti mode: Active/Passive

### Problem: Upload sangat lambat

**Solusi:**

- Upload file ZIP lalu extract di hosting
- Upload folder vendor/ terakhir (paling besar)
- Gunakan resume jika koneksi putus

### Problem: 500 Internal Server Error

**Solusi:**

1. Cek file permissions (755/644)
2. Cek file `.env` exists dan benar
3. Cek Error Log di cPanel
4. Pastikan PHP version >= 8.1

### Problem: Database connection failed

**Solusi:**

1. Cek credentials di `.env`
2. Pastikan database user ada privileges
3. Cek hostname database (biasanya `localhost`)

### Problem: Storage/Images tidak bisa upload

**Solusi:**

1. Set permissions folder `storage/` ke 755
2. Jalankan: `php artisan setup:shared-hosting`
3. Atau buat folder manual di `public/storage/`

### Problem: CSS/JS tidak load

**Solusi:**

1. Pastikan `npm run build` sudah dijalankan
2. Upload folder `public/build/`
3. Cek `APP_URL` di `.env`

## 📞 Checklist Final Upload

### Pre-Upload:

- [ ] `npm run build` completed
- [ ] `composer install --no-dev` completed
- [ ] Database backup (jika ada data)

### Upload via FileZilla:

- [ ] All folders uploaded to hosting root
- [ ] `.env.shared-hosting` renamed to `.env`
- [ ] `.env` configured with hosting details
- [ ] Domain/subdomain pointing to `public/` folder

### Post-Upload Setup:

- [ ] Database created and configured
- [ ] `php artisan setup:shared-hosting` executed
- [ ] `php artisan migrate --force` executed
- [ ] File permissions set (755/644)
- [ ] Website accessible and working

### Testing:

- [ ] Homepage loads successfully
- [ ] Login/register functionality works
- [ ] File upload works
- [ ] Email sending works (if configured)
- [ ] No errors in hosting error logs

---

## 💡 Tips Hosting:

1. **Backup:** Selalu backup database sebelum update
2. **SSL:** Aktifkan SSL Certificate di hosting panel
3. **Performance:** Set PHP version ke 8.1 atau 8.2
4. **Cache:** Gunakan OPcache jika tersedia
5. **Monitoring:** Pantau error logs secara berkala

Jika ada masalah, cek error di **cPanel → Error Logs** atau hubungi support hosting Anda! 🚀
