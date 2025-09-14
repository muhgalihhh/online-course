# ✅ CHECKLIST UPLOAD FILEZILLA - Step by Step

## 📋 PERSIAPAN DI KOMPUTER (LOKAL)

### ☐ Step 1: Build Project

```cmd
npm run build
composer install --no-dev --optimize-autoloader
```

### ☐ Step 2: Buat Package (Pilih salah satu)

**Opsi A: Script Otomatis**

```cmd
create-deployment-package.bat
```

**Opsi B: Manual**

- Siapkan semua folder untuk upload

---

## 🌐 KONEKSI FILEZILLA

### ☐ Step 3: Data Koneksi

Siapkan data ini dari hosting panel:

- **Host:** `ftp.domainanda.com`
- **Username:** `username_ftp_anda`
- **Password:** `password_ftp_anda`
- **Port:** `21` (FTP) atau `22` (SFTP)

### ☐ Step 4: Connect FileZilla

1. ☐ Buka FileZilla
2. ☐ Masukkan data koneksi
3. ☐ Klik "Quick Connect"
4. ☐ Pastikan terhubung (lihat folder hosting di sebelah kanan)

---

## 📁 STRUKTUR UPLOAD

### ☐ Step 5: Tentukan Lokasi Upload

**Pilih salah satu sesuai hosting:**

**Opsi A: Domain Utama**

- Upload ke: `public_html/` atau `/`
- Domain: `https://domainanda.com`

**Opsi B: Subdomain/Folder**

- Upload ke: `public_html/kursus/`
- Domain: `https://domainanda.com/kursus`

### ☐ Step 6: Upload Files

Drag & drop dari kiri (komputer) ke kanan (hosting):

#### Jika Upload ZIP:

- ☐ Upload `online-course-shared-hosting.zip`
- ☐ Extract via File Manager hosting
- ☐ Lanjut ke Step 8

#### Jika Upload Manual:

Upload folder/file ini:

- ☐ `app/` folder
- ☐ `bootstrap/` folder
- ☐ `config/` folder
- ☐ `database/` folder
- ☐ `lang/` folder
- ☐ `public/` folder ⭐ (PENTING!)
- ☐ `resources/` folder
- ☐ `routes/` folder
- ☐ `storage/` folder
- ☐ `vendor/` folder ⏰ (Upload terakhir - besar)
- ☐ `.htaccess` file
- ☐ `artisan` file
- ☐ `composer.json` file
- ☐ `composer.lock` file
- ☐ `.env.shared-hosting` file

### ☐ Step 7: Tunggu Upload Selesai

- ☐ Monitor progress upload
- ☐ Pastikan semua file terupload
- ☐ Cek tidak ada error

---

## ⚙️ SETUP DI HOSTING PANEL

### ☐ Step 8: Setup File .env

1. ☐ Masuk cPanel → File Manager
2. ☐ Rename `.env.shared-hosting` → `.env`
3. ☐ Edit `.env` dengan data hosting:

```env
APP_URL=https://domainanda.com
DB_DATABASE=namadb_kursus
DB_USERNAME=user_database
DB_PASSWORD=password_database
MAIL_HOST=mail.domainanda.com
MAIL_USERNAME=noreply@domainanda.com
MAIL_PASSWORD=password_email
```

### ☐ Step 9: Setup Database

1. ☐ cPanel → MySQL Databases
2. ☐ Buat database baru
3. ☐ Buat user database
4. ☐ Assign user ke database (All Privileges)
5. ☐ Catat nama database, user, password

### ☐ Step 10: Setup Domain (Pilih sesuai hosting)

**Opsi A: Document Root** (Recommended)

- ☐ cPanel → Addon/Subdomains
- ☐ Set Document Root ke: `public_html/public`

**Opsi B: Manual Redirect**

- ☐ Biarkan default, akses: `domainanda.com/public`

---

## 🔧 SETUP APLIKASI

### ☐ Step 11: Setup via Terminal SSH (Jika ada)

```bash
cd public_html  # atau folder upload Anda
php artisan key:generate --force
php artisan setup:shared-hosting
php artisan migrate --force
php artisan config:cache
```

### ☐ Step 12: Setup Manual (Jika tidak ada SSH)

1. ☐ **Set Permissions** via File Manager:
    - Folder `storage/` → **755**
    - Folder `bootstrap/cache/` → **755**
    - File lainnya → **644**

2. ☐ **Buat folder storage** di `public/`:
    - ☐ `public/storage/courses/`
    - ☐ `public/storage/gallery/`
    - ☐ `public/storage/institutions/`
    - ☐ `public/storage/materials/`
    - ☐ `public/storage/profile-photos/`

3. ☐ **Setup database** via phpMyAdmin:
    - ☐ Import SQL jika ada
    - ☐ Atau buat tables manual

---

## ✅ TESTING & VERIFIKASI

### ☐ Step 13: Test Website

- ☐ Buka: `https://domainanda.com`
- ☐ Website load tanpa error 500
- ☐ Tampilan website benar
- ☐ Test navigation menu

### ☐ Step 14: Test Fungsionalitas

- ☐ Login/Register works
- ☐ Database connection works
- ☐ File upload works
- ☐ Images display correctly
- ☐ Email sending works (optional)

### ☐ Step 15: Cek Error Log

- ☐ cPanel → Error Logs
- ☐ Tidak ada error PHP fatal
- ☐ Fix error jika ada

---

## 🚨 TROUBLESHOOTING

### ❌ FileZilla tidak connect:

- ☐ Cek hostname, username, password
- ☐ Coba port 21 atau 22
- ☐ Ganti Active/Passive mode

### ❌ Website error 500:

- ☐ Cek file permissions (755/644)
- ☐ Cek file `.env` exists
- ☐ Cek Error Log hosting

### ❌ Database error:

- ☐ Cek credentials `.env`
- ☐ Pastikan database & user exists
- ☐ Test connection via phpMyAdmin

### ❌ Images tidak tampil:

- ☐ Cek folder `public/storage/` exists
- ☐ Set permissions 755
- ☐ Upload gambar test

---

## 🎉 SELESAI!

### ☐ Final Check:

- ☐ ✅ Website bisa diakses
- ☐ ✅ Fitur utama berfungsi
- ☐ ✅ SSL Certificate aktif
- ☐ ✅ No error di log
- ☐ ✅ Performance bagus

**🚀 Project Anda berhasil online di shared hosting!**

---

## 📞 Bantuan Tambahan:

- **Error Log:** cPanel → Error Logs
- **File Manager:** cPanel → File Manager
- **Database:** cPanel → phpMyAdmin
- **Support:** Hubungi support hosting jika ada masalah teknis
