# Toast Notifications & Sidebar Collapse - Panduan Penggunaan

## Fitur yang Ditambahkan

### 1. Sidebar Collapse/Expand
- Sidebar admin sekarang bisa di-collapse dan expand
- State sidebar disimpan di localStorage
- Tombol toggle tersedia di header dan sidebar
- Responsive design untuk mobile dan desktop

### 2. Toast Notifications
- Sistem toast notifications yang komprehensif
- 4 jenis toast: success, error, warning, info
- Otomatis menampilkan flash messages dari Laravel
- Bisa digunakan secara manual untuk aksi user

## Cara Menggunakan

### Sidebar Collapse

Sidebar akan otomatis menggunakan hook `useSidebar()` yang sudah diintegrasikan di `AdminLayout`. Tidak perlu konfigurasi tambahan.

### Toast Notifications

#### 1. Otomatis dari Flash Messages

Toast akan otomatis muncul ketika ada flash messages dari Laravel:

```php
// Di controller Laravel
return redirect()->back()->with('success', 'Data berhasil disimpan!');
return redirect()->back()->with('error', 'Terjadi kesalahan!');
return redirect()->back()->with('warning', 'Perhatian!');
return redirect()->back()->with('info', 'Informasi penting');
```

#### 2. Manual Toast

Gunakan hook `useFormToast()` untuk menampilkan toast secara manual:

```tsx
import { useFormToast } from '@/hooks/use-form-toast';

export default function MyComponent() {
    const { showSuccess, showError, showWarning, showInfo } = useFormToast();

    const handleSave = () => {
        // Simulasi save
        showSuccess('Data berhasil disimpan!');
    };

    const handleDelete = () => {
        showWarning('Anda yakin ingin menghapus data ini?');
        // Proses delete
        showSuccess('Data berhasil dihapus!');
    };

    const handleError = () => {
        showError('Terjadi kesalahan pada sistem!');
    };

    return (
        <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleDelete}>Delete</button>
            <button onClick={handleError}>Error</button>
        </div>
    );
}
```

#### 3. Toast dengan Variant

```tsx
import { useToast } from '@/hooks/use-toast';

export default function MyComponent() {
    const { toast } = useToast();

    const showCustomToast = () => {
        toast({
            title: "Judul Toast",
            description: "Deskripsi toast notification",
            variant: "success", // "success", "error", "warning", "info", "default"
        });
    };
}
```

## Komponen yang Ditambahkan

### 1. UI Components
- `resources/js/components/ui/toast.tsx` - Komponen toast dasar
- `resources/js/components/ui/toaster.tsx` - Komponen untuk menampilkan toast

### 2. Hooks
- `resources/js/hooks/use-toast.ts` - Hook untuk mengelola toast state
- `resources/js/hooks/use-toast-notifications.ts` - Hook untuk flash messages otomatis
- `resources/js/hooks/use-form-toast.ts` - Hook untuk toast manual
- `resources/js/hooks/use-sidebar.ts` - Hook untuk mengelola sidebar state

### 3. Layout Updates
- `resources/js/layouts/admin-layout.tsx` - Menambahkan Toaster dan sidebar collapse
- `resources/js/components/admin-sidebar.tsx` - Menambahkan fitur collapse/expand
- `resources/js/components/admin-header.tsx` - Menambahkan tombol toggle sidebar

## Dependencies

Pastikan dependency berikut sudah terinstall:

```bash
npm install @radix-ui/react-toast
```

## Contoh Penggunaan di Dashboard

Lihat file `resources/js/pages/admin/dashboard.tsx` untuk contoh penggunaan lengkap:

- Demo toast notifications
- Tombol refresh data dengan toast
- Tombol kirim notifikasi dengan toast
- Berbagai jenis toast (success, error, warning)

## Styling

Toast menggunakan Tailwind CSS dengan variant yang sudah didefinisikan:

- `success`: Hijau untuk pesan sukses
- `error`: Merah untuk pesan error
- `warning`: Kuning untuk pesan peringatan
- `info`: Biru untuk pesan informasi
- `default`: Default styling

## Responsive Design

- Sidebar collapse hanya aktif di desktop (md: breakpoint ke atas)
- Mobile tetap menggunakan Sheet component untuk sidebar
- Toast notifications responsive di semua ukuran layar