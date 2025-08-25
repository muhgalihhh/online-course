import { DeleteConfirmation } from '@/components/delete-confirmation';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, PlusCircle, Search, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserIndexProps extends PageProps {
    users: {
        data: User[];
        links: any[];
    };
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UserIndex({ users, filters }: UserIndexProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    const openDeleteDialog = (user: User) => {
        setUserToDelete(user);
        setConfirmDelete(true);
    };

    const handleDelete = () => {
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete.id), {
                onSuccess: () => {
                    setConfirmDelete(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.users.index'), {
                search,
                role: roleFilter,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, roleFilter]);

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        router.get(route('admin.users.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasFilters = search || roleFilter;

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Users', href: route('admin.users.index') },
            ]}
        >
            <Head title="Users" />

            <DeleteConfirmation
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
                title="Hapus Pengguna"
                description={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />

            <div className="space-y-6">
                <PageHeader
                    title="Daftar Pengguna"
                    description="Kelola semua pengguna terdaftar di platform ini"
                    actions={
                        <Link href={route('admin.users.create')}>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah User
                            </Button>
                        </Link>
                    }
                />

                {/* Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Cari Nama atau Email</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Cari pengguna..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Filter Role</Label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Role</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                {hasFilters && (
                                    <Button variant="outline" onClick={clearFilters} className="w-full">
                                        <X className="mr-2 h-4 w-4" />
                                        Bersihkan Filter
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tabel Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Foto & Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Tanggal Verifikasi</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage 
                                                            src={user.profile_photo_url} 
                                                            alt={user.name}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                                            {useInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{user.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn({
                                                        'bg-blue-500 text-white hover:bg-blue-600': user.role === 'admin',
                                                        'bg-gray-200 text-gray-800 hover:bg-gray-300': user.role === 'user',
                                                    })}
                                                >
                                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.email_verified_at
                                                    ? new Date(user.email_verified_at).toLocaleDateString('id-ID', {
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                      })
                                                    : 'Belum diverifikasi'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Buka menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.users.edit', user.id)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Hapus</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {hasFilters ? 'Tidak ada pengguna yang sesuai dengan filter.' : 'Tidak ada data pengguna.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Pagination links={users.links} />
            </div>
        </AdminLayout>
    );
}
