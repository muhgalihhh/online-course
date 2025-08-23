// resources/js/pages/admin/users/index.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { useState } from 'react';
import { router } from '@inertiajs/react';

// Definisikan props yang diterima dari controller
interface UserIndexProps extends PageProps {
    users: PaginatedData<User>;
}

export default function UserIndex({ users }: UserIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        userId: number | null;
        userName: string;
    }>({
        isOpen: false,
        userId: null,
        userName: '',
    });

    const handleDelete = (userId: number, userName: string) => {
        setDeleteDialog({
            isOpen: true,
            userId,
            userName,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.userId) {
            router.delete(route('admin.users.destroy', deleteDialog.userId));
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Users', href: route('admin.users.index') },
            ]}
        >
            <Head title="Manage Users" />

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Daftar Pengguna</h1>
                    <Link href={route('admin.users.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah User
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Peran</TableHead>
                                    <TableHead>Tanggal Bergabung</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.users.edit', user.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {users.links && users.links.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, userId: null, userName: '' })}
                onConfirm={confirmDelete}
                title="Hapus User"
                description="Apakah Anda yakin ingin menghapus user"
                itemName={deleteDialog.userName}
            />
        </AdminLayout>
    );
}
