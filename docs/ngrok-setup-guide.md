# 🚀 Panduan Setup Ngrok untuk Testing Flip Payment

## Apa itu Ngrok?

Ngrok adalah tool yang membuat tunnel dari URL publik ke localhost Anda. Ini memungkinkan Flip mengirim callback/webhook ke aplikasi Laravel yang berjalan di localhost.

---

## 📋 Step-by-Step Setup

### **Step 1: Download & Install ngrok**

#### Opsi A: Download Manual

1. Buka browser ke: https://ngrok.com/download
2. Download versi **Windows (64-bit)**
3. Extract file ZIP ke folder (contoh: `C:\ngrok`)
4. Tambahkan folder ngrok ke PATH atau jalankan dari folder tersebut

#### Opsi B: Install via Chocolatey

```powershell
choco install ngrok
```

#### Opsi C: Install via Scoop

```powershell
scoop install ngrok
```

---

### **Step 2: Daftar Account ngrok (Gratis)**

1. Buka: https://dashboard.ngrok.com/signup
2. Daftar dengan email, Google, atau GitHub
3. Setelah login, masuk ke dashboard
4. Copy **"Authtoken"** dari halaman dashboard

---

### **Step 3: Setup Authtoken**

```powershell
# Masuk ke folder ngrok
cd C:\ngrok

# Add authtoken (ganti YOUR_AUTHTOKEN dengan token dari dashboard)
.\ngrok config add-authtoken YOUR_AUTHTOKEN

# Contoh:
# .\ngrok config add-authtoken 2abc123def456ghi789jkl
```

Anda akan melihat pesan:

```
Authtoken saved to configuration file: C:\Users\YourName\.ngrok2\ngrok.yml
```

---

### **Step 4: Jalankan Laravel Development Server**

Buka **Terminal/PowerShell PERTAMA**:

```powershell
# Masuk ke folder project
cd "C:\Materi Kuliah\JOKI\WEBSITE - Online Course\online-course"

# Jalankan Laravel server
php artisan serve

# Output:
# Starting Laravel development server: http://127.0.0.1:8000
```

> ⚠️ **PENTING:** Jangan tutup terminal ini! Biarkan tetap running.

---

### **Step 5: Jalankan ngrok**

Buka **Terminal/PowerShell KEDUA** (baru):

```powershell
# Masuk ke folder ngrok
cd C:\ngrok

# Jalankan ngrok untuk tunnel ke port 8000
.\ngrok http 8000
```

Anda akan melihat interface seperti ini:

```
ngrok

Session Status                online
Account                       yourname@email.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5
                              0       0       0.00    0.00
```

> 📝 **COPY URL INI:** `https://abc123def456.ngrok-free.app`
>
> ⚠️ **PENTING:** Jangan tutup terminal ini! Biarkan ngrok tetap running.

---

### **Step 6: Update Laravel .env File**

Edit file `.env` di root project:

```env
# Ganti APP_URL dengan URL ngrok Anda
APP_URL=https://abc123def456.ngrok-free.app

# Pastikan semua konfigurasi Flip sudah benar
FLIP_SECRET_KEY=JDJ5JDEzJFFVVFZ4QzI2a1kvLm5JZGR5b3VQLk84bTJldllHUEUwNjFHSkoyUllQbm4zNnV0ZXdZSFoy
FLIP_VALIDATION_TOKEN=$2y$13$uTWmOQGyey8EWaVgN9kGm.0r9Yv40z6iKz6p6vlaDj0DfGRFKe9Km
FLIP_IS_PRODUCTION=false
```

**Restart Laravel server** (Ctrl+C di terminal pertama, lalu jalankan lagi):

```powershell
php artisan serve
```

---

### **Step 7: Clear Cache Laravel**

Di terminal **KETIGA** (baru):

```powershell
cd "C:\Materi Kuliah\JOKI\WEBSITE - Online Course\online-course"

# Clear semua cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Pastikan config ter-load ulang
php artisan config:cache
```

---

### **Step 8: Konfigurasi Webhook di Flip Dashboard**

1. Login ke **Flip Dashboard**: https://flip.id/business/dashboard
2. Masuk ke **Settings** → **Webhook**
3. Set **Webhook URL**:
    ```
    https://abc123def456.ngrok-free.app/payments/flip/webhook
    ```
    (Ganti dengan ngrok URL Anda)
4. **Save** konfigurasi

---

### **Step 9: Test Payment Flow**

1. **Buka Browser** ke ngrok URL:

    ```
    https://abc123def456.ngrok-free.app
    ```

2. **Warning ngrok:** Klik "Visit Site" (muncul di free plan)

3. **Login** ke aplikasi

4. **Pilih Course** dan klik "Beli Kursus"

5. **Di halaman Payment:**
    - Klik "Buka Halaman Pembayaran"
    - Lakukan pembayaran di Flip (gunakan Sandbox)
    - **Tunggu setelah payment berhasil**

6. **Flip akan redirect otomatis** ke:

    ```
    https://abc123def456.ngrok-free.app/payments/flip/callback?bill_link_id=xxx&course_id=yyy
    ```

7. **Aplikasi akan:**
    - Receive callback dari Flip
    - Update status transaksi ke "completed"
    - Auto-enroll user ke course
    - Redirect ke halaman learning

---

## 🔍 Monitoring & Debugging

### **1. Monitor Requests di ngrok Web Interface**

Buka browser ke: http://127.0.0.1:4040

Anda bisa melihat:

- Semua HTTP requests yang masuk
- Request/Response headers dan body
- Webhook dari Flip akan terlihat di sini

### **2. Laravel Log**

Monitor log real-time:

```powershell
# Di terminal baru
cd "C:\Materi Kuliah\JOKI\WEBSITE - Online Course\online-course"
Get-Content storage\logs\laravel.log -Wait -Tail 50
```

Cari log seperti:

```
[timestamp] Flip callback received
[timestamp] Flip Bill Status Retrieved
[timestamp] Flip transaction status updated from API
[timestamp] Payment verified as completed
```

### **3. Check Database**

```powershell
# Masuk ke MySQL
mysql -u root -p

# Di MySQL:
USE online_course;

# Cek transaction terakhir
SELECT id, flip_bill_id, status, payment_method, created_at, updated_at
FROM transactions
ORDER BY id DESC
LIMIT 5;

# Cek enrollment terakhir
SELECT * FROM enrollments ORDER BY id DESC LIMIT 5;
```

---

## ⚙️ Troubleshooting

### **Problem: "Tunnel not found"**

**Solution:**

- Pastikan ngrok masih running
- Restart ngrok jika URL berubah
- Update APP_URL di .env dengan URL baru

### **Problem: "ERR_NGROK_6024: Too Many Connections"**

**Solution:**

- Free plan ngrok punya limit connections
- Restart ngrok untuk reset
- Upgrade ke ngrok paid plan jika perlu

### **Problem: "Invalid CSRF token"**

**Solution:**

```powershell
# Clear session
php artisan session:clear

# Clear cache
php artisan config:clear
php artisan cache:clear
```

### **Problem: Webhook tidak diterima**

**Solution:**

1. Check ngrok masih running
2. Check webhook URL di Flip dashboard
3. Monitor ngrok web interface (http://127.0.0.1:4040)
4. Check Laravel log untuk errors

### **Problem: "Warning: This site ahead contains harmful programs"**

**Solution:**

- Ini warning dari ngrok free plan
- Klik "Visit Site" atau "Details" → "Visit this unsafe site"
- Atau upgrade ke ngrok paid plan

---

## 📝 Catatan Penting

### **Setiap Kali Restart ngrok:**

1. **URL ngrok akan berubah!** (di free plan)
2. **Update .env:**
    ```env
    APP_URL=https://NEW_NGROK_URL.ngrok-free.app
    ```
3. **Restart Laravel:**
    ```powershell
    # Ctrl+C di terminal Laravel server
    php artisan serve
    ```
4. **Clear cache:**
    ```powershell
    php artisan config:clear
    php artisan config:cache
    ```
5. **Update Webhook di Flip Dashboard** dengan URL baru

### **Tips untuk Development:**

- **Gunakan ngrok hanya saat perlu test callback/webhook**
- Untuk test biasa tanpa webhook, cukup gunakan localhost + manual refresh
- **Jangan commit** file .env dengan ngrok URL ke git
- **Keep terminal ngrok open** selama testing

### **Alternatif ngrok (Optional):**

Jika ngrok bermasalah, coba alternatif:

- **localhost.run**: https://localhost.run
- **localtunnel**: https://localtunnel.github.io/www/
- **serveo**: https://serveo.net

---

## 🎯 Quick Reference Commands

```powershell
# Start Laravel
cd "C:\Materi Kuliah\JOKI\WEBSITE - Online Course\online-course"
php artisan serve

# Start ngrok (di terminal terpisah)
cd C:\ngrok
.\ngrok http 8000

# Clear cache
php artisan config:clear && php artisan cache:clear && php artisan route:clear

# Monitor log
Get-Content storage\logs\laravel.log -Wait -Tail 50

# Check database
mysql -u root -p online_course -e "SELECT id, flip_bill_id, status FROM transactions ORDER BY id DESC LIMIT 5;"
```

---

## 📞 Support

Jika masih ada masalah:

1. Check Laravel log: `storage/logs/laravel.log`
2. Check ngrok web interface: http://127.0.0.1:4040
3. Check browser console untuk JavaScript errors
4. Check database untuk status transaksi

---

**Happy Testing! 🎉**
