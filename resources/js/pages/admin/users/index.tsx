// resources/js/pages/admin/users/index.tsx

import AdminLayout from '@/layouts/admin-layout';
import { AdminContentWrapper } from '@/components/admin-content-wrapper';
import { AdminSection } from '@/components/admin-section';
import { AdminTable } from '@/components/admin-table';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('admin.dashboard') },
    { title: 'Users', href: route('admin.users.index') }
];

// Mock data
const users = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        avatar: null,
        created_at: '2024-01-15'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        avatar: null,
        created_at: '2024-01-20'
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        status: 'inactive',
        avatar: null,
        created_at: '2024-01-25'
    }
];

export default function AdminUsersIndex() {
    const columns = [
        {
            key: 'avatar',
            header: '',
            cell: (user: any) => (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
            ),
            className: 'w-12'
        },
        {
            key: 'name',
            header: 'Name',
            cell: (user: any) => (
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
            )
        },
        {
            key: 'role',
            header: 'Role',
            cell: (user: any) => (
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                </Badge>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (user: any) => (
                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status}
                </Badge>
            )
        },
        {
            key: 'created_at',
            header: 'Joined',
            cell: (user: any) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (user: any) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            ),
            className: 'w-32'
        }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <AdminContentWrapper>
                {/* Page Header */}
                <PageHeader 
                    title="Users"
                    description="Manage user accounts and permissions"
                    actions={
                        <Button asChild>
                            <Link href={route('admin.users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    }
                />

                {/* Users Table */}
                <AdminSection>
                    <AdminTable
                        title="All Users"
                        description="List of all registered users in the system"
                        data={users}
                        columns={columns}
                        searchable
                        filterable
                        exportable
                        onSearch={(value) => console.log('Search:', value)}
                        onExport={() => console.log('Export')}
                    />
                </AdminSection>
            </AdminContentWrapper>
        </AdminLayout>
    );
}
