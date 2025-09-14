# Payment Flow - Saran Lanjutan

Dokumen ini merangkum saran lanjutan untuk meningkatkan robustness & performa flow Midtrans.

## 1. Index Database

Tambahkan index komposit untuk mempercepat query yang sering dipakai:

```
user_id, transactionable_type, transactionable_id, status
```

Migration contoh:

```php
Schema::table('transactions', function (Blueprint $table) {
    $table->index(['user_id','transactionable_type','transactionable_id','status'], 'trx_user_object_status_idx');
});
```

Jika sering cari berdasarkan `midtrans_order_id` pastikan sudah ada unique / index tunggal.

## 2. Scheduler Auto-Expire / Status Sync

Buat command artisan yang dijalankan via cron tiap 5–10 menit:

- Ambil transaksi `pending|processing` lebih tua dari (misal) 10 menit.
- Panggil `MidtransService::getTransactionStatus()` untuk sinkron status.
- Tandai `expired` jika tidak ditemukan / sudah melewati waktu kadaluarsa.

Contoh cron (Linux):

```
*/10 * * * * php /path/to/artisan payments:sync-pending >> /var/log/app_sync.log 2>&1
```

## 3. Soft-Unique Constraint / Row Locking

Untuk mencegah race condition (double click cepat / multi tab):

1. Bungkus create di DB transaction.
2. `SELECT ... FOR UPDATE` transaksi pending existing.
3. Jika ada aktif -> reuse; jika tidak -> create baru.

Contoh pola:

```php
DB::transaction(function () use($user,$course) {
    $active = Transaction::where('user_id',$user->id)
        ->where('transactionable_id',$course->id)
        ->where('transactionable_type', Course::class)
        ->whereIn('status',['pending','processing'])
        ->lockForUpdate()
        ->first();
    if ($active) { /* reuse */ }
    else { /* create */ }
});
```

## 4. Frontend Refresh Strategy

- Saat reload halaman pembayaran: jangan langsung minta token baru.
- Panggil endpoint create (yang sekarang sudah otomatis reuse) atau langsung pakai state lokal yang menyimpan `snap_token` + `order_id`.
- Hanya panggil `/refresh` jika status final (expired/failed/cancelled) dan user ingin coba lagi.

## 5. UX Saat Token Hilang (need_cancel)

Jika backend mengembalikan `{ need_cancel: true }` pada refresh:

- Tampilkan banner: "Token pembayaran hilang. Hapus transaksi lama untuk membuat transaksi baru." + Tombol "Hapus Transaksi" (panggil DELETE API).
- Tambahkan event/log (frontend console + optional POST ke endpoint logging) supaya bisa dianalisis kalau sering terjadi.

## 6. Observability & Logging Tambahan

- Tambah channel log khusus `payments` (config/logging.php) untuk memisahkan noise.
- Simpan metrik sederhana (jumlah pending > 1 jam, jumlah refresh yang gagal) ke tabel kecil atau Redis.

## 7. Graceful Expiry UI

Saat status sudah `expired`:

- Otomatis tampilkan tombol "Buat Transaksi Baru".
- Jangan render komponen Snap sebelum transaksi baru berhasil dibuat.

## 8. Retry Midtrans Status (Backoff)

Pada kegagalan network sementara:

- Lakukan retry 2-3x dengan delay incremental (200ms, 800ms) sebelum menandai unknown.

## 9. Integrity Checks Harian

Job harian:

- Cari transaksi `completed` tanpa enrollment -> trigger enroll otomatis.
- Cari enrollment tanpa transaksi `completed` (kecuali kursus gratis) -> flag untuk audit.

## 10. Security

- Pastikan signature webhook dicek (sudah) dan batasi IP (opsional via firewall / WAF).
- Simpan hash ringkas dari body webhook untuk dedup jika Midtrans retry.

---

Implementasi bertahap disarankan: (1) index + locking, (2) scheduler sync, (3) UX need_cancel, (4) observability.
