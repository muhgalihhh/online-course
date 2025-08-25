import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children, ...props }: AdminLayoutProps) {
    return <AdminSidebarLayout {...props}>{children}</AdminSidebarLayout>;
}
