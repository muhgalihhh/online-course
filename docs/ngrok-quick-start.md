# 🚀 Ngrok Quick Start - Flip Payment Testing

## Prerequisites

- [ ] Ngrok installed (https://ngrok.com/download)
- [ ] Ngrok authtoken configured
- [ ] Laravel server ready
- [ ] MySQL running

---

## Quick Setup (5 Minutes)

### 1️⃣ Start Laravel (Terminal 1)

```bash
cd "C:\Materi Kuliah\JOKI\WEBSITE - Online Course\online-course"
php artisan serve
```

**Keep this terminal open!**

---

### 2️⃣ Start ngrok (Terminal 2)

```bash
ngrok http 8000
```

**Copy the HTTPS URL:** `https://abc123.ngrok-free.app`
**Keep this terminal open!**

---

### 3️⃣ Update .env

```env
APP_URL=https://abc123.ngrok-free.app
```

_(Ganti dengan URL ngrok Anda)_

---

### 4️⃣ Restart Laravel (Terminal 1)

```bash
# Press Ctrl+C to stop
php artisan serve
```

---

### 5️⃣ Clear Cache (Terminal 3)

```bash
cd "C:\Materi Kuliah\JOKI\WEBSITE - Online Course\online-course"
php artisan config:clear
php artisan config:cache
```

---

### 6️⃣ Update Flip Dashboard

**Webhook URL:**

```
https://abc123.ngrok-free.app/payments/flip/webhook
```

1. Login: https://flip.id/business/dashboard
2. Settings → Webhook
3. Paste URL di atas
4. Save

---

### 7️⃣ Test Payment

1. Open browser: `https://abc123.ngrok-free.app`
2. Click "Visit Site" on ngrok warning
3. Login to app
4. Select course → Buy
5. Pay via Flip
6. Watch callback work! ✨

---

## Monitoring

### Ngrok Web Interface

```
http://127.0.0.1:4040
```

View all HTTP requests/responses

### Laravel Log (Real-time)

```powershell
Get-Content storage\logs\laravel.log -Wait -Tail 50
```

### Database Check

```sql
SELECT id, flip_bill_id, status, payment_method, updated_at
FROM transactions
ORDER BY id DESC LIMIT 5;
```

---

## Troubleshooting

| Problem              | Solution                    |
| -------------------- | --------------------------- |
| Tunnel not found     | Restart ngrok               |
| CSRF token invalid   | `php artisan session:clear` |
| Webhook not received | Check ngrok web interface   |
| URL changed          | Update .env + clear cache   |

---

## Important URLs

| Description     | URL                                                      |
| --------------- | -------------------------------------------------------- |
| Ngrok Public    | `https://YOUR-URL.ngrok-free.app`                        |
| Ngrok Dashboard | `http://127.0.0.1:4040`                                  |
| Laravel Local   | `http://127.0.0.1:8000`                                  |
| Flip Callback   | `https://YOUR-URL.ngrok-free.app/payments/flip/callback` |
| Flip Webhook    | `https://YOUR-URL.ngrok-free.app/payments/flip/webhook`  |
| Flip Dashboard  | `https://flip.id/business/dashboard`                     |

---

## Remember! ⚠️

- ✅ Keep Laravel terminal open
- ✅ Keep ngrok terminal open
- ✅ Update .env when ngrok URL changes
- ✅ Clear cache after .env changes
- ✅ Update Flip webhook when URL changes
- ❌ Don't commit .env with ngrok URL

---

## Auto-Scripts Available

### Windows Batch

```cmd
setup-ngrok.bat
```

### PowerShell

```powershell
.\setup-ngrok.ps1
```

### Full Documentation

```
docs\ngrok-setup-guide.md
```

---

**Happy Testing! 🎉**

_Last Updated: January 2026_
