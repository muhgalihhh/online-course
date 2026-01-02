# 📋 Production Deployment Checklist - Pareeduhub.com

## **A. PRE-DEPLOYMENT (Sebelum Deploy)**

### 1. **Domain & DNS Setup**

- [ ] Domain pareeduhub.com sudah terdaftar
- [ ] DNS A Record mengarah ke IP server production
- [ ] TTL sudah dikurangi (15 menit) untuk propagasi cepat
- [ ] Test DNS propagation: `nslookup pareeduhub.com`

### 2. **Server Preparation**

- [ ] Server production siap (VPS/Cloud Server)
- [ ] OS: Ubuntu 22.04/24.04 LTS (recommended)
- [ ] RAM minimal: 2GB
- [ ] Storage: Minimal 20GB SSD
- [ ] SSH access tersedia
- [ ] Firewall configured (port 80, 443 open)

### 3. **Software Installation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install PHP 8.2 dan extensions
sudo apt install php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring \
  php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath -y

# Install MySQL
sudo apt install mysql-server -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y
```

- [ ] Semua software terinstall
- [ ] Verifikasi versi: `php -v`, `composer -V`, `node -v`, `mysql --version`

---

## **B. SSL CERTIFICATE SETUP**

### 1. **Install Certbot (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. **Generate SSL Certificate**

```bash
sudo certbot --nginx -d pareeduhub.com -d www.pareeduhub.com
```

- [ ] SSL certificate berhasil di-generate
- [ ] Auto-renewal configured
- [ ] Test renewal: `sudo certbot renew --dry-run`

### 3. **Certificate Locations**

- Certificate: `/etc/letsencrypt/live/pareeduhub.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/pareeduhub.com/privkey.pem`
- [ ] Certificate files ada dan readable

---

## **C. DATABASE SETUP**

### 1. **Create Production Database**

```bash
sudo mysql

CREATE DATABASE pareeduhub_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pareeduhub_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON pareeduhub_production.* TO 'pareeduhub_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

- [ ] Database created
- [ ] User created dengan password kuat
- [ ] Privileges granted
- [ ] Simpan credentials dengan aman

### 2. **Database Security**

```bash
sudo mysql_secure_installation
```

- [ ] Root password set
- [ ] Remove anonymous users
- [ ] Disallow root login remotely
- [ ] Remove test database

---

## **D. APPLICATION DEPLOYMENT**

### 1. **Clone Repository**

```bash
sudo mkdir -p /var/www/pareeduhub.com
sudo chown $USER:$USER /var/www/pareeduhub.com
cd /var/www/pareeduhub.com
git clone YOUR_REPOSITORY_URL .
```

- [ ] Repository cloned
- [ ] Branch production checked out

### 2. **Setup Environment File**

```bash
cp .env.production.example .env
nano .env
```

**Update values:**

- [ ] `APP_URL=https://pareeduhub.com`
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] Database credentials (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
- [ ] `FLIP_IS_PRODUCTION=true`
- [ ] `FLIP_SECRET_KEY=` (production key)
- [ ] `FLIP_VALIDATION_TOKEN=` (production token)
- [ ] `MIDTRANS_IS_PRODUCTION=true`
- [ ] `MIDTRANS_SERVER_KEY=` (production key)
- [ ] `MIDTRANS_CLIENT_KEY=` (production key)
- [ ] Mail SMTP credentials (MAIL\_\*)
- [ ] Session domain: `SESSION_DOMAIN=.pareeduhub.com`

### 3. **Generate Application Key**

```bash
php artisan key:generate
```

- [ ] APP_KEY generated di .env

### 4. **Install Dependencies**

```bash
# PHP dependencies
composer install --no-dev --optimize-autoloader

# Node dependencies & build
npm ci
npm run build
```

- [ ] Composer dependencies installed
- [ ] NPM dependencies installed
- [ ] Frontend assets built (public/build/ exists)

### 5. **Run Migrations**

```bash
php artisan migrate --force
```

- [ ] Migrations berhasil dijalankan
- [ ] Check tables: `php artisan db:show`

### 6. **Setup Storage**

```bash
php artisan storage:link
```

- [ ] Symbolic link created (public/storage)

### 7. **Optimize Application**

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

- [ ] All caches generated

### 8. **Set Permissions**

```bash
sudo chown -R www-data:www-data /var/www/pareeduhub.com
sudo chmod -R 755 /var/www/pareeduhub.com/storage
sudo chmod -R 755 /var/www/pareeduhub.com/bootstrap/cache
```

- [ ] Permissions set correctly

---

## **E. NGINX CONFIGURATION**

### 1. **Copy Configuration**

```bash
sudo cp docs/nginx-production.conf /etc/nginx/sites-available/pareeduhub.com
sudo ln -s /etc/nginx/sites-available/pareeduhub.com /etc/nginx/sites-enabled/
```

### 2. **Test & Reload Nginx**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

- [ ] Nginx config test passed
- [ ] Nginx reloaded successfully

---

## **F. PAYMENT GATEWAY SETUP**

### 1. **Flip Production Credentials**

**Langkah:**

1. Login ke https://flip.id
2. Daftar akun business/production
3. Verifikasi akun (KTP, dokumen perusahaan)
4. Dashboard → API → Get production credentials
5. Copy `Secret Key` dan `Validation Token`
6. Update `.env`:
    ```
    FLIP_SECRET_KEY=your_production_secret_key
    FLIP_VALIDATION_TOKEN=your_production_validation_token
    FLIP_IS_PRODUCTION=true
    ```

**Webhook URL Setup:**

- [ ] Login to Flip dashboard
- [ ] Settings → Webhook → Set URL: `https://pareeduhub.com/payments/flip/webhook`
- [ ] Save dan test webhook

### 2. **Midtrans Production Credentials**

**Langkah:**

1. Login ke https://dashboard.midtrans.com
2. Switch to Production mode (toggle di dashboard)
3. Settings → Access Keys
4. Copy `Server Key` dan `Client Key`
5. Update `.env`:
    ```
    MIDTRANS_SERVER_KEY=your_production_server_key
    MIDTRANS_CLIENT_KEY=your_production_client_key
    MIDTRANS_IS_PRODUCTION=true
    ```

**Webhook URL Setup:**

- [ ] Settings → Configuration → Payment Notification URL
- [ ] Set: `https://pareeduhub.com/payments/midtrans/webhook`
- [ ] Save configuration

### 3. **Clear Cache After Update**

```bash
php artisan config:clear
php artisan config:cache
```

---

## **G. TESTING**

### 1. **Website Accessibility**

- [ ] Visit https://pareeduhub.com (homepage loads)
- [ ] Check HTTPS redirect (http → https works)
- [ ] No SSL errors/warnings
- [ ] Static assets loading (CSS, JS, images)

### 2. **Authentication Testing**

- [ ] Register new user
- [ ] Login works
- [ ] Logout works
- [ ] Password reset email sent

### 3. **Payment Gateway Testing**

**Flip Testing:**

- [ ] Create course transaction (Flip method)
- [ ] Bill created successfully
- [ ] Redirect to Flip payment page
- [ ] Complete test payment
- [ ] Return to payment page shows "success" (not expired)
- [ ] User enrolled in course
- [ ] Transaction status in database = "paid"
- [ ] Webhook received (check logs: `tail -f storage/logs/laravel.log`)

**Midtrans Testing:**

- [ ] Create course transaction (Midtrans method)
- [ ] Redirect to Midtrans Snap
- [ ] Complete test payment (use test card: 4811 1111 1111 1114)
- [ ] Payment successful
- [ ] Webhook received
- [ ] User enrolled

### 4. **File Upload Testing**

- [ ] Upload profile picture
- [ ] Upload course thumbnail (admin)
- [ ] Upload course video (admin)
- [ ] Files accessible via public URL

### 5. **Email Testing**

- [ ] Registration email received
- [ ] Password reset email received
- [ ] Payment confirmation email received

---

## **H. MONITORING & MAINTENANCE**

### 1. **Setup Log Monitoring**

```bash
# Laravel logs
tail -f /var/www/pareeduhub.com/storage/logs/laravel.log

# Nginx error logs
tail -f /var/nginx/error.log
```

- [ ] Log monitoring configured

### 2. **Setup Backup Cron**

```bash
crontab -e
```

Add:

```
# Daily database backup (2 AM)
0 2 * * * mysqldump -u pareeduhub_user -p'PASSWORD' pareeduhub_production > /var/backups/db_$(date +\%Y\%m\%d).sql

# Weekly full backup (Sunday 3 AM)
0 3 * * 0 tar -czf /var/backups/full_$(date +\%Y\%m\%d).tar.gz /var/www/pareeduhub.com
```

- [ ] Backup cron configured
- [ ] Test backup manually

### 3. **SSL Auto-Renewal**

- [ ] Certbot auto-renewal enabled (should be by default)
- [ ] Test renewal: `sudo certbot renew --dry-run`

### 4. **Performance Monitoring**

- [ ] Setup monitoring tool (optional): New Relic, Sentry, etc.
- [ ] Enable Laravel Telescope (development only)
- [ ] Monitor server resources (CPU, RAM, disk)

---

## **I. SECURITY CHECKLIST**

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production`
- [ ] Strong database passwords (16+ characters)
- [ ] `.env` file NOT in version control
- [ ] File permissions correct (no 777)
- [ ] Firewall configured (UFW/iptables)
- [ ] SSH key-based authentication (disable password login)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] CSRF protection enabled (Laravel default)
- [ ] SQL injection protection (Eloquent ORM)
- [ ] XSS protection (Blade escaping)

---

## **J. ROLLBACK PLAN**

**If something goes wrong:**

### 1. **Restore Database Backup**

```bash
mysql -u pareeduhub_user -p pareeduhub_production < /var/backups/db_YYYYMMDD.sql
```

### 2. **Restore Application Backup**

```bash
cd /var/www
sudo rm -rf pareeduhub.com
sudo tar -xzf /var/backups/full_YYYYMMDD.tar.gz
```

### 3. **Revert Git Commit**

```bash
cd /var/www/pareeduhub.com
git revert HEAD
composer install
npm ci && npm run build
php artisan migrate:rollback
```

---

## **K. POST-DEPLOYMENT**

- [ ] Announce downtime completion (if any)
- [ ] Monitor error logs for 24 hours
- [ ] Check payment transactions daily (first week)
- [ ] Update documentation if needed
- [ ] Inform stakeholders deployment successful
- [ ] Schedule follow-up review (1 week later)

---

## **L. SUPPORT CONTACTS**

**Payment Gateways:**

- Flip Support: support@flip.id
- Midtrans Support: support@midtrans.com

**Server/Hosting:**

- Your hosting provider support

**Emergency Contacts:**

- Developer: [Your contact]
- Server admin: [Admin contact]

---

## 📝 **NOTES**

- **Keep this checklist updated** after each deployment
- **Document any issues** encountered during deployment
- **Store credentials securely** (use password manager)
- **Never commit** `.env` files to version control
- **Test on staging first** if possible

---

## ✅ **DEPLOYMENT COMPLETE**

Deployment Date: ******\_\_******
Deployed By: ******\_\_******
Version/Tag: ******\_\_******
Notes: ******\_\_******
