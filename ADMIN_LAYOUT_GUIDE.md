# Admin Layout Guide

## Overview

Layout admin telah diperbaiki dengan desain yang lebih rapi, transisi yang halus, dan responsivitas yang lebih baik. Berikut adalah panduan penggunaan komponen-komponen admin yang telah diperbaiki.

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

Sidebar dengan navigasi menu dan toggle functionality.

**Fitur:**
- Auto-collapse pada mobile
- Transisi halus saat expand/collapse
- State tersimpan di localStorage
- Responsive design

### 3. AdminHeader

Header dengan search, notifications, dan user menu.

**Fitur:**
- Sticky positioning
- Search bar responsive
- Notifications dropdown
- User profile dropdown

## Komponen Pendukung

### 1. AdminContentWrapper

Wrapper untuk konten dengan spacing yang konsisten.

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

Section untuk grouping konten.

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

Card component untuk konten yang terstruktur.

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

### 4. PageHeader

Header halaman dengan breadcrumbs dan actions.

```tsx
import { PageHeader } from '@/components/page-header';

<PageHeader 
    title="Page Title"
    description="Page description"
    backUrl="/admin/dashboard"
    actions={<Button>Action</Button>}
/>
```

## CSS Classes

### Layout Classes
- `.admin-layout`: Layout utama
- `.admin-sidebar`: Sidebar container
- `.admin-sidebar-collapsed`: Sidebar collapsed state
- `.admin-sidebar-expanded`: Sidebar expanded state
- `.admin-content`: Content area
- `.admin-content-collapsed`: Content dengan sidebar collapsed
- `.admin-content-expanded`: Content dengan sidebar expanded

### Transition Classes
- `.sidebar-transition`: Transisi untuk elemen sidebar
- `.sidebar-item`: Item navigasi sidebar
- `.sidebar-item-active`: Item navigasi aktif
- `.scrollbar-thin`: Custom scrollbar styling

## Responsive Behavior

### Desktop (md+)
- Sidebar dapat di-toggle
- Content area menyesuaikan dengan sidebar state
- Transisi halus saat collapse/expand

### Mobile (< md)
- Sidebar otomatis collapsed
- Mobile sidebar menggunakan Sheet component
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
- Smooth transitions

## Best Practices

### 1. Layout Structure
```tsx
<AdminLayout breadcrumbs={breadcrumbs}>
    <AdminContentWrapper>
        <PageHeader title="Page Title" />
        <AdminSection title="Section Title">
            <AdminCard title="Card Title">
                {/* Content */}
            </AdminCard>
        </AdminSection>
    </AdminContentWrapper>
</AdminLayout>
```

### 2. Responsive Design
- Gunakan `AdminContentWrapper` untuk spacing konsisten
- Gunakan `AdminCard` untuk konten yang terstruktur
- Gunakan `AdminSection` untuk grouping konten

### 3. Navigation
- Sidebar state otomatis tersimpan
- Mobile-friendly dengan Sheet component
- Smooth transitions di semua ukuran layar

## Customization

### CSS Variables
Semua styling menggunakan CSS variables yang dapat dikustomisasi:

```css
:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    /* ... */
}
```

### Component Props
Semua komponen mendukung `className` prop untuk custom styling:

```tsx
<AdminCard className="custom-card">
    {/* Content */}
</AdminCard>
```

## Migration Guide

### Dari Layout Lama
1. Ganti `div` wrapper dengan `AdminContentWrapper`
2. Gunakan `AdminCard` untuk konten yang sebelumnya menggunakan card
3. Gunakan `AdminSection` untuk grouping konten
4. Update breadcrumbs menggunakan komponen `Breadcrumbs` yang diperbaiki

### Breaking Changes
- Layout structure sedikit berubah untuk performa yang lebih baik
- CSS classes baru untuk transisi yang lebih halus
- Responsive behavior yang lebih konsisten

## Troubleshooting

### Sidebar Tidak Toggle
- Pastikan `useSidebar` hook digunakan dengan benar
- Check localStorage untuk state yang tersimpan
- Verify responsive breakpoints

### Layout Tidak Responsive
- Pastikan CSS classes diterapkan dengan benar
- Check viewport meta tag
- Verify Tailwind responsive classes

### Transisi Tidak Halus
- Pastikan CSS transition classes diterapkan
- Check browser support untuk CSS transitions
- Verify tidak ada CSS yang override transitions