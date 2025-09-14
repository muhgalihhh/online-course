# 🏢 Konfigurasi Hosting Populer Indonesia

## 🎯 Niagahoster

### Koneksi FTP:

```
Host: ftp.yourdomain.com
Username: yourdomain.com
Password: (password hosting)
Port: 21
```

### Database:

```env
DB_HOST=localhost
DB_DATABASE=yourdomain_dbname
DB_USERNAME=yourdomain_dbuser
```

### Email SMTP:

```env
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=noreply@yourdomain.com
```

### Document Root:

- Set ke: `public_html/public` via cPanel Addon Domains
- PHP Version: 8.1 atau 8.2

---

## 🎯 Hostinger

### Koneksi FTP:

```
Host: files.000webhost.com (atau IP dari panel)
Username: (dari hPanel)
Password: (password hosting)
Port: 21
```

### Database:

```env
DB_HOST=localhost
DB_DATABASE=id12345678_database
DB_USERNAME=id12345678_user
```

### Upload:

- Maksimal file: 10MB per file
- Total space: sesuai paket
- Extract ZIP via File Manager

---

## 🎯 Rumahweb

### Koneksi FTP:

```
Host: yourdomain.com
Username: yourdomain.com
Password: (password hosting)
Port: 21
```

### Database:

```env
DB_HOST=localhost
DB_DATABASE=yourdomain_dbname
DB_USERNAME=yourdomain_dbuser
```

### PHP:

- Set PHP 8.1+ via cPanel
- Enable extension: mysqli, pdo_mysql, mbstring, xml, curl

---

## 🎯 IDCloudHost

### Koneksi FTP:

```
Host: yourdomain.com atau IP server
Username: (dari panel hosting)
Password: (password FTP)
Port: 21
```

### Database:

```env
DB_HOST=localhost
DB_DATABASE=username_dbname
DB_USERNAME=username_dbuser
```

---

## ⚙️ Settings Umum Shared Hosting

### File .htaccess (Root):

```apache
# Redirect ke public folder
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/public/
RewriteRule ^(.*)$ /public/$1 [L]

# Security
<Files .env>
    Order Allow,Deny
    Deny from all
</Files>
```

### PHP Settings yang Dibutuhkan:

```ini
upload_max_filesize = 100M
post_max_size = 105M
max_execution_time = 300
memory_limit = 512M
max_input_vars = 3000

# Extensions
extension=mysqli
extension=pdo_mysql
extension=mbstring
extension=xml
extension=curl
extension=gd
extension=zip
```

### Permissions yang Benar:

```bash
# Folders
storage/ = 755 atau 775
bootstrap/cache/ = 755 atau 775
public/ = 755

# Files
.env = 644
index.php = 644
artisan = 755
```

---

## 🔧 Setup Database via phpMyAdmin

### 1. Import SQL (Jika ada backup):

```sql
-- Upload file .sql via phpMyAdmin Import
```

### 2. Manual Setup (Jika fresh install):

```bash
# Via SSH/Terminal
php artisan migrate --force
php artisan db:seed --force

# Via Web
# Akses: yourdomain.com/artisan/migrate (jika dibuat route khusus)
```

---

## 📧 Email SMTP Testing

### Test Email via Tinker:

```php
// Via SSH
php artisan tinker

// Test SMTP
Mail::raw('Test email', function($m) {
    $m->to('test@example.com')->subject('Test');
});
```

### Gmail SMTP (Backup):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=youremail@gmail.com
MAIL_PASSWORD=app_password
MAIL_ENCRYPTION=tls
```

---

## 🚀 Optimasi Performance

### 1. Enable OPcache (via .htaccess):

```apache
# Enable OPcache
php_value opcache.enable 1
php_value opcache.memory_consumption 128
php_value opcache.max_accelerated_files 4000
```

### 2. Laravel Optimizations:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 3. Database Indexing:

- Pastikan migration ada index untuk foreign keys
- Tambah index untuk kolom yang sering di-query

---

## 🔐 Security Checklist

### File Permissions:

- [ ] ☐ `.env` = 644 (tidak bisa diakses public)
- [ ] ☐ `storage/` = 755 (writable tapi aman)
- [ ] ☐ `public/` = 755 (bisa diakses web)

### Environment:

- [ ] ☐ `APP_ENV=production`
- [ ] ☐ `APP_DEBUG=false`
- [ ] ☐ `APP_KEY` generated
- [ ] ☐ Database credentials benar

### SSL Certificate:

- [ ] ☐ SSL aktif di hosting panel
- [ ] ☐ Force HTTPS redirect
- [ ] ☐ `APP_URL=https://...`

---

## 📱 Domain & DNS Setup

### Jika Domain Terpisah:

1. **Nameservers:** Arahkan ke hosting
2. **DNS A Record:** Point ke IP hosting
3. **CNAME www:** Point ke domain utama

### Subdomain:

1. **cPanel → Subdomains**
2. **Document Root:** `public_html/public`
3. **DNS otomatis terupdate**

---

## 🆘 Support & Debugging

### Log Locations:

- **Laravel:** `storage/logs/laravel.log`
- **Hosting:** cPanel → Error Logs
- **Access:** cPanel → Raw Access Logs

### Debug Commands:

```bash
# Cek Laravel installation
php artisan about

# Test database connection
php artisan migrate:status

# Clear all cache
php artisan optimize:clear

# Test storage
php artisan storage:link
```

### Contact Support:

Jika masalah teknis, hubungi support hosting dengan info:

- **Error message** lengkap
- **Log error** dari cPanel
- **Screenshot** error
- **Langkah** yang sudah dicoba

---

**💡 Tips:** Setiap hosting provider bisa sedikit berbeda. Selalu cek dokumentasi hosting Anda atau hubungi support mereka untuk konfigurasi spesifik!
