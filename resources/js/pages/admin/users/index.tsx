import { DeleteConfirmation } from '@/components/delete-confirmation';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface UserIndexProps extends PageProps {
    users: {
        data: User[];
        links: any[];
    };
}

export default function UserIndex({ users }: UserIndexProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
                <Card>
                    <CardHeader>
                        <CardTitle>Tabel Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
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
                                                    <Avatar>
                                                        <AvatarImage src={user.profile_photo_url} alt={user.name} />
                                                        <AvatarFallback>{useInitials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn({
                                                        'bg-blue-500 text-white': user.role === 'admin',
                                                        'bg-gray-200 text-gray-800': user.role === 'user',
                                                    })}
                                                >
                                                    {user.role}
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
                                            Tidak ada data pengguna.
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
