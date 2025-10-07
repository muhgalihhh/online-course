# Fix Auto Enrollment Setelah Pembayaran Midtrans

## Masalah yang Ditemukan

1. **Queue Configuration**: Queue menggunakan `QUEUE_CONNECTION=sync` yang menyebabkan job di-execute secara synchronous, tapi delay diabaikan
2. **Error Handling**: Error di listener tidak di-throw sehingga masalah enrollment tidak terdeteksi
3. **Webhook Delay**: Jika webhook Midtrans terlambat/gagal, enrollment tidak terjadi
4. **Tidak Ada Fallback**: Tidak ada mekanisme untuk trigger enrollment dari frontend callback

## Solusi yang Diterapkan

### 1. Backend - PaymentController.php

#### a. Webhook Handler

- **Prioritaskan auto-enrollment langsung** sebelum dispatch event
- Refresh transaction sebelum enrollment untuk data terkini
- Tambah logging yang lebih detail

```php
// handleMidtransWebhook
if ($newStatus === 'completed') {
    $transaction->refresh();
    $this->autoEnrollUserToCourse($transaction); // LANGSUNG
    TransactionCompleted::dispatch($transaction); // Event untuk job backup
}
```

#### b. Endpoint Baru: verifyPaymentAndEnroll

- **Route**: `POST /payments/{orderId}/verify-and-enroll`
- **Fungsi**: Dipanggil dari frontend setelah pembayaran sukses
- Verifikasi status pembayaran real-time dengan Midtrans API
- Trigger enrollment jika status completed
- Return response dengan status enrollment

**Response:**

```json
{
    "success": true,
    "enrolled": true,
    "message": "Pembayaran berhasil dan Anda telah terdaftar di kursus.",
    "redirect_url": "/courses/{id}/learn"
}
```

#### c. autoEnrollUserToCourse Enhancement

- Re-throw exception agar caller tahu jika gagal
- Better error logging
- Idempotent: aman dipanggil berkali-kali

### 2. Backend - AutoEnrollUserToCourse Listener

#### Perubahan:

- **Hapus delay**: Job tidak lagi pakai `->delay(now()->addSeconds(5))`
- **Better error handling**: Error di immediate enrollment akan di-catch dan dispatch backup job
- **Throw exception**: Error tidak di-swallow lagi

```php
try {
  $this->processImmediateEnrollment($event->transaction);
} catch (\Exception $e) {
  Log::error('Immediate enrollment failed, dispatching backup job', [...]);
  ProcessEnrollmentAfterPayment::dispatch($event->transaction); // No delay
}
```

### 3. Frontend - payment/index.tsx

#### Perubahan di refreshStatus():

- Setelah detect status `completed`, langsung call endpoint `/payments/{orderId}/verify-and-enroll`
- Jika berhasil enrolled, redirect ke `redirect_url` dari response
- Fallback: redirect ke learning page

```typescript
if (data.status === 'completed') {
    setStatus('completed');

    // Trigger verify and enroll
    const verifyRes = await fetch(`/payments/${orderId}/verify-and-enroll`, {
        method: 'POST',
        // ...
    });

    if (verifyData.enrolled && verifyData.redirect_url) {
        window.location.href = verifyData.redirect_url;
    }
}
```

### 4. Frontend - courses/enroll.tsx

#### Perubahan di onSuccess callback:

- Setelah pembayaran sukses, call endpoint verify-and-enroll
- Redirect ke learning page jika enrollment berhasil

```typescript
snap.pay(data.snap_token, {
    onSuccess: async function () {
        const verifyRes = await fetch(`/payments/${data.order_id}/verify-and-enroll`, {
            method: 'POST',
            // ...
        });

        if (verifyData.enrolled && verifyData.redirect_url) {
            window.location.href = verifyData.redirect_url;
        }
    },
    // ...
});
```

## Alur Auto Enrollment (Triple Safety)

### Safety #1: Webhook dari Midtrans

```
Midtrans → handleMidtransWebhook() → autoEnrollUserToCourse() → Enrollment Created
```

### Safety #2: Event Listener

```
handleMidtransWebhook() → TransactionCompleted::dispatch() → AutoEnrollUserToCourse → ProcessEnrollmentAfterPayment Job
```

### Safety #3: Frontend Callback

```
snap.onSuccess() / refreshStatus() → verifyPaymentAndEnroll() → autoEnrollUserToCourse() → Enrollment Created
```

## Testing Checklist

### 1. Test Normal Flow

- [ ] User melakukan pembayaran
- [ ] Pembayaran berhasil di Midtrans
- [ ] Webhook diterima dengan benar
- [ ] User otomatis terdaftar di kursus
- [ ] User dapat mengakses halaman belajar

### 2. Test Webhook Delay

- [ ] User melakukan pembayaran
- [ ] Pembayaran berhasil di Midtrans
- [ ] Webhook delay/gagal
- [ ] Frontend callback trigger enrollment
- [ ] User tetap terdaftar di kursus

### 3. Test Double Enrollment

- [ ] Coba trigger enrollment 2x untuk transaksi yang sama
- [ ] Pastikan tidak ada error
- [ ] Pastikan hanya 1 enrollment record

### 4. Test Transaction Status

- [ ] Check log untuk status update
- [ ] Verify Midtrans API dipanggil dengan benar
- [ ] Status transaksi sesuai dengan Midtrans

## Monitoring & Logging

### Log yang Ditambahkan:

1. `[Payment] Success callback - verifying and enrolling...` - Frontend callback triggered
2. `[Payment] Verify response:` - Response dari verify-and-enroll endpoint
3. `Frontend callback: verify payment and enroll` - Backend receive verify request
4. `Payment verified as completed, triggering enrollment` - Status verified
5. `Payment completed via webhook, triggering auto-enrollment` - Webhook path
6. Various error logs untuk debugging

### Cara Monitor:

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log | grep -i "enroll"

# Check specific order
tail -f storage/logs/laravel.log | grep "ORDER_ID"
```

## Troubleshooting

### User tidak ter-enroll setelah pembayaran?

1. **Check logs untuk order_id:**

    ```bash
    grep "ORDER_ID" storage/logs/laravel.log
    ```

2. **Check transaction status di database:**

    ```sql
    SELECT * FROM transactions WHERE midtrans_order_id = 'ORDER_ID';
    ```

3. **Check enrollment:**

    ```sql
    SELECT * FROM enrollments WHERE user_id = USER_ID AND course_id = COURSE_ID;
    ```

4. **Manual enrollment jika perlu:**
    ```sql
    INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, created_at, updated_at)
    VALUES (USER_ID, COURSE_ID, NOW(), 0, NOW(), NOW());
    ```

### Webhook tidak diterima?

1. Check Midtrans dashboard untuk webhook logs
2. Pastikan URL webhook sudah di-set: `https://yourdomain.com/payments/midtrans/webhook`
3. Check middleware `midtrans.webhook` sudah benar
4. Test webhook dengan manual POST

### Frontend tidak call verify-and-enroll?

1. Check browser console untuk error
2. Check CSRF token ada
3. Check route sudah terdaftar:
    ```bash
    php artisan route:list | grep verify-enroll
    ```

## Konfigurasi yang Direkomendasikan

### Untuk Production:

```env
QUEUE_CONNECTION=database  # atau redis untuk performa lebih baik
```

Jangan lupa jalankan queue worker:

```bash
php artisan queue:work --tries=3 --timeout=60
```

### Untuk Development:

```env
QUEUE_CONNECTION=sync  # OK untuk testing lokal
```

## Files yang Diubah

1. `app/Http/Controllers/PaymentController.php`
    - Method `handleMidtransWebhook()` - prioritize direct enrollment
    - Method `verifyPaymentAndEnroll()` - NEW endpoint
    - Method `autoEnrollUserToCourse()` - throw exception on error

2. `app/Listeners/AutoEnrollUserToCourse.php`
    - Remove delay from job dispatch
    - Better error handling
    - Throw exceptions instead of swallowing

3. `routes/web.php`
    - Added route: `POST /payments/{orderId}/verify-and-enroll`

4. `resources/js/pages/payment/index.tsx`
    - Added verify-and-enroll call in `refreshStatus()`
    - Better logging

5. `resources/js/pages/courses/enroll.tsx`
    - Added verify-and-enroll call in `onSuccess` callback
    - Better logging

## Catatan Tambahan

- **Idempotent**: Semua enrollment logic menggunakan `firstOrCreate()`, aman dipanggil berkali-kali
- **Database Transaction**: Enrollment dibungkus dalam DB transaction untuk consistency
- **Triple Safety**: 3 mekanisme berbeda untuk memastikan enrollment berhasil
- **Real-time Verification**: Frontend verify status langsung ke Midtrans API
- **Better Logging**: Tracking lengkap untuk debugging

## Next Steps (Optional Improvements)

1. **Queue Worker**: Setup proper queue worker untuk production
2. **Notification**: Send email/notification setelah enrollment berhasil
3. **Admin Dashboard**: Tampilkan failed enrollments untuk manual review
4. **Retry Mechanism**: Auto-retry failed enrollments dengan exponential backoff
5. **Metrics**: Track enrollment success rate
