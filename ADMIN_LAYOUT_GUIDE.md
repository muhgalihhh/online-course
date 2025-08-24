# Admin Layout Guide - Optimized with shadcn/ui

## Overview

Layout admin telah dioptimalkan untuk menggunakan shadcn/ui components dengan maksimal, menghilangkan custom CSS dan memastikan konsistensi desain. Semua komponen menggunakan design system shadcn/ui yang terstandarisasi.

## Komponen Utama

### 1. AdminLayout

Layout utama untuk halaman admin dengan sidebar yang dapat di-collapse.

```tsx
import AdminLayout from '@/layouts/admin-layout';

export default function AdminPage() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            {/* Konten halaman */}
        </AdminLayout>
    );
}
```

### 2. AdminSidebar

Sidebar dengan navigasi menu dan toggle functionality menggunakan shadcn/ui components.

**Fitur:**
- Auto-collapse pada mobile
- Transisi halus menggunakan Tailwind CSS
- State tersimpan di localStorage
- Responsive design dengan shadcn/ui Sheet component

### 3. AdminHeader

Header dengan search, notifications, dan user menu menggunakan shadcn/ui components.

**Fitur:**
- Sticky positioning
- Search bar responsive dengan shadcn/ui Input
- Notifications dropdown dengan shadcn/ui DropdownMenu
- User profile dropdown dengan shadcn/ui Avatar

## Komponen Pendukung

### 1. AdminContentWrapper

Wrapper untuk konten dengan spacing yang konsisten menggunakan Tailwind CSS.

```tsx
import { AdminContentWrapper } from '@/components/admin-content-wrapper';

<AdminContentWrapper padding="md">
    {/* Konten */}
</AdminContentWrapper>
```

**Props:**
- `padding`: 'sm' | 'md' | 'lg' | 'none'
- `className`: Custom CSS classes

### 2. AdminSection

Section untuk grouping konten menggunakan shadcn/ui styling patterns.

```tsx
import { AdminSection } from '@/components/admin-section';

<AdminSection 
    title="Section Title"
    description="Section description"
>
    {/* Konten section */}
</AdminSection>
```

### 3. AdminCard

Card component menggunakan shadcn/ui Card components.

```tsx
import { AdminCard } from '@/components/admin-card';

<AdminCard 
    title="Card Title"
    description="Card description"
    padding="md"
>
    {/* Konten card */}
</AdminCard>
```

### 4. AdminTable

Table component menggunakan shadcn/ui Table components dengan fitur built-in.

```tsx
import { AdminTable } from '@/components/admin-table';

<AdminTable
    title="Users"
    description="List of all users"
    data={users}
    columns={columns}
    searchable
    filterable
    exportable
    onSearch={handleSearch}
    onExport={handleExport}
/>
```

### 5. AdminForm

Form component menggunakan shadcn/ui Card dan Button components.

```tsx
import { AdminForm } from '@/components/admin-form';

<AdminForm
    title="Create User"
    description="Add a new user to the system"
    onSubmit={handleSubmit}
    submitLabel="Create User"
    loading={isLoading}
>
    {/* Form fields */}
</AdminForm>
```

### 6. PageHeader

Header halaman dengan breadcrumbs dan actions menggunakan shadcn/ui components.

```tsx
import { PageHeader } from '@/components/page-header';

<PageHeader 
    title="Page Title"
    description="Page description"
    backUrl="/admin/dashboard"
    actions={<Button>Action</Button>}
/>
```

## shadcn/ui Components Used

### Layout Components
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `Button` (various variants)
- `Input`
- `Badge`
- `Avatar`, `AvatarFallback`, `AvatarImage`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, etc.
- `Sheet`, `SheetContent`, `SheetTrigger`
- `ScrollArea`

### Styling Approach
- Menggunakan Tailwind CSS utility classes
- Memanfaatkan shadcn/ui design tokens
- Konsisten dengan design system shadcn/ui
- Tidak ada custom CSS classes

## Responsive Behavior

### Desktop (md+)
- Sidebar dapat di-toggle dengan transisi halus
- Content area menyesuaikan dengan sidebar state
- Menggunakan Tailwind responsive classes

### Mobile (< md)
- Sidebar otomatis collapsed
- Mobile sidebar menggunakan shadcn/ui Sheet component
- Content area full width

## State Management

### useSidebar Hook

```tsx
import { useSidebar } from '@/hooks/use-sidebar';

const { isCollapsed, toggleSidebar, isMobile } = useSidebar();
```

**Features:**
- State tersimpan di localStorage
- Auto-responsive behavior
- Smooth transitions menggunakan Tailwind CSS

## Best Practices

### 1. Layout Structure
```tsx
<AdminLayout breadcrumbs={breadcrumbs}>
    <AdminContentWrapper>
        <PageHeader title="Page Title" />
        <AdminSection title="Section Title">
            <AdminCard title="Card Title">
                <AdminTable data={data} columns={columns} />
            </AdminCard>
        </AdminSection>
    </AdminContentWrapper>
</AdminLayout>
```

### 2. shadcn/ui Integration
- Gunakan shadcn/ui components sebagai dasar
- Manfaatkan built-in variants dan styling
- Konsisten dengan design system
- Gunakan Tailwind CSS untuk custom styling

### 3. Component Composition
- Compose components menggunakan shadcn/ui patterns
- Gunakan proper TypeScript interfaces
- Maintain consistent prop naming

## Migration Guide

### Dari Layout Lama
1. Ganti custom CSS classes dengan Tailwind utilities
2. Gunakan shadcn/ui components yang sesuai
3. Update component imports untuk menggunakan shadcn/ui
4. Remove custom CSS styling

### Breaking Changes
- Semua custom CSS classes dihapus
- Menggunakan shadcn/ui components secara eksklusif
- Tailwind CSS untuk semua styling
- Design system yang lebih konsisten

## Troubleshooting

### Component Styling Issues
- Pastikan menggunakan shadcn/ui components dengan benar
- Check Tailwind CSS classes
- Verify design tokens consistency

### Responsive Issues
- Gunakan Tailwind responsive classes
- Check shadcn/ui responsive behavior
- Verify component variants

### Performance Issues
- shadcn/ui components sudah dioptimalkan
- Tailwind CSS purging untuk production
- Minimal JavaScript overhead