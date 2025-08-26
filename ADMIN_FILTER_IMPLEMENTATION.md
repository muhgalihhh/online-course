# Admin Filter & Search Auto-Update Implementation

## Overview
Telah berhasil mengimplementasikan sistem filter dan search dengan auto-update untuk semua halaman admin management. Implementasi ini memungkinkan pengguna untuk melakukan filtering dan searching tanpa perlu menekan tombol submit, dengan update otomatis setiap 300ms (debounced).

## Komponen yang Dibuat

### 1. AdminFilter Component (`/resources/js/components/admin/AdminFilter.tsx`)
Komponen reusable yang menyediakan:
- **Search field** dengan auto-update
- **Select filters** untuk berbagai kategori data
- **Number range filters** untuk nilai numerik (harga, jumlah, dll)
- **Date range picker** untuk filtering berdasarkan tanggal
- **Sort options** dengan pilihan field dan direction
- **Reset functionality** untuk membersihkan semua filter
- **Collapsible interface** untuk menghemat ruang
- **Active filter indicator** untuk menunjukkan status filter

### 2. UI Components Pendukung
- **Calendar component** (`/resources/js/components/ui/calendar.tsx`)
- **Popover component** (`/resources/js/components/ui/popover.tsx`)

## Backend Implementation

### Controllers yang Diupdate:
1. **UserController** - Filter berdasarkan role, tanggal registrasi, sorting
2. **CourseController** - Filter berdasarkan kategori, institusi, tipe (pro/free), range harga, tanggal
3. **TransactionController** - Filter berdasarkan status, metode pembayaran, range amount, tanggal
4. **CategoryController** - Filter berdasarkan jumlah course, tanggal pembuatan
5. **ChapterController** - Filter berdasarkan course, jumlah materi, durasi
6. **CourseMaterialController** - Filter berdasarkan tipe, chapter, course
7. **ReviewController** - Filter berdasarkan status, rating, tipe review (course/institution)

### Filter Features per Halaman:

#### User Management
- **Search**: Name atau Email
- **Role Filter**: Admin/User
- **Date Range**: Tanggal registrasi
- **Sort**: Registration Date, Name, Email, Role

#### Course Management
- **Search**: Title atau Description
- **Category Filter**: Semua kategori yang tersedia
- **Institution Filter**: Semua institusi yang tersedia
- **Course Type**: Pro Course/Free Course
- **Price Range**: Min/Max harga
- **Date Range**: Tanggal pembuatan
- **Sort**: Creation Date, Title, Price

#### Transaction Management
- **Search**: User name, email, atau order ID
- **Status Filter**: Pending, Completed, Failed, Cancelled
- **Payment Method**: Credit Card, Bank Transfer, GoPay, OVO, DANA
- **Amount Range**: Min/Max jumlah transaksi
- **Date Range**: Tanggal transaksi
- **Sort**: Transaction Date, Amount, Status

#### Category Management
- **Search**: Name atau Description
- **Course Count Range**: Min/Max jumlah course dalam kategori
- **Date Range**: Tanggal pembuatan
- **Sort**: Creation Date, Name, Course Count

#### Chapter Management
- **Search**: Title atau Description
- **Course Filter**: Filter berdasarkan course tertentu
- **Material Count Range**: Min/Max jumlah materi
- **Duration Range**: Min/Max durasi
- **Date Range**: Tanggal pembuatan
- **Sort**: Creation Date, Course Materials Count

#### Course Material Management
- **Search**: Title atau Content
- **Type Filter**: Video, Document, Quiz, Assignment
- **Chapter Filter**: Filter berdasarkan chapter
- **Course Filter**: Filter berdasarkan course
- **Date Range**: Tanggal pembuatan
- **Sort**: Creation Date

#### Review Management
- **Search**: Comment atau user name/email
- **Status Filter**: Pending, Approved, Rejected
- **Rating Range**: Min/Max rating
- **Review Type**: Institution/Course reviews
- **Date Range**: Tanggal review
- **Sort**: Review Date, Rating, Status

## Features Utama

### 1. Auto-Update (300ms debounce)
Semua filter akan otomatis mengupdate data tanpa perlu menekan tombol submit. Menggunakan debounce 300ms untuk performa optimal.

### 2. URL Preservation
Semua filter state disimpan dalam URL query parameters, memungkinkan:
- Bookmark URL dengan filter tertentu
- Share URL dengan filter yang sudah diterapkan
- Browser back/forward navigation yang konsisten

### 3. Reset Functionality
Tombol reset yang mudah diakses untuk membersihkan semua filter sekaligus.

### 4. Responsive Design
Interface filter yang responsive dan dapat dikollaps untuk menghemat ruang di layar kecil.

### 5. Active Filter Indication
Visual indicator yang menunjukkan kapan filter sedang aktif.

## Cara Penggunaan

### Implementasi di Halaman Baru
```tsx
import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';

const filterConfig: FilterConfig = {
    search: {
        placeholder: "Search placeholder...",
    },
    select: {
        field_name: {
            label: "Field Label",
            options: [
                { value: "value1", label: "Label 1" },
                { value: "value2", label: "Label 2" }
            ],
            placeholder: "Select placeholder"
        }
    },
    numberRange: {
        field_name: {
            label: "Range Label",
            min: 0,
            step: 1
        }
    },
    dateRange: {
        enabled: true,
        label: "Date Range Label"
    },
    sort: {
        enabled: true,
        options: [
            { value: "field1", label: "Field 1" },
            { value: "field2", label: "Field 2" }
        ],
        defaultSort: "created_at",
        defaultOrder: "desc"
    }
};

// Dalam component
<AdminFilter 
    config={filterConfig}
    filters={filters}
    route="admin.route.name"
/>
```

### Backend Controller Pattern
```php
public function index(Request $request)
{
    $query = Model::query();

    // Search filter
    if ($request->filled('search')) {
        $search = $request->get('search');
        $query->where(function ($q) use ($search) {
            $q->where('field1', 'like', "%{$search}%")
              ->orWhere('field2', 'like', "%{$search}%");
        });
    }

    // Select filter
    if ($request->filled('select_field')) {
        $query->where('select_field', $request->get('select_field'));
    }

    // Number range
    if ($request->filled('number_min')) {
        $query->where('number_field', '>=', $request->get('number_min'));
    }
    
    if ($request->filled('number_max')) {
        $query->where('number_field', '<=', $request->get('number_max'));
    }

    // Date range
    if ($request->filled('date_from')) {
        $query->whereDate('created_at', '>=', $request->get('date_from'));
    }
    
    if ($request->filled('date_to')) {
        $query->whereDate('created_at', '<=', $request->get('date_to'));
    }

    // Sort
    $sortBy = $request->get('sort_by', 'created_at');
    $sortOrder = $request->get('sort_order', 'desc');
    $query->orderBy($sortBy, $sortOrder);

    $results = $query->paginate(10)->withQueryString();

    return Inertia::render('admin/page', [
        'results' => $results,
        'filters' => $request->only(['search', 'select_field', 'number_min', 'number_max', 'date_from', 'date_to', 'sort_by', 'sort_order']),
    ]);
}
```

## Dependencies
- `date-fns` - untuk formatting tanggal dalam date picker
- Semua UI components menggunakan shadcn/ui pattern
- Inertia.js untuk handling navigation tanpa reload halaman

## Testing
Aplikasi sudah berhasil di-build dan siap untuk testing. Jalankan `php artisan serve` untuk menguji implementasi.

## Benefits
1. **User Experience**: Filter dan search yang responsive tanpa perlu reload halaman
2. **Performance**: Debounced requests untuk mengurangi load server
3. **Maintainability**: Komponen reusable yang mudah dikonfigurasi
4. **Scalability**: Pattern yang dapat diterapkan ke halaman admin lainnya
5. **Consistency**: Interface yang konsisten di semua halaman admin