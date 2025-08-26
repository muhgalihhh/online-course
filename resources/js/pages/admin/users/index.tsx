// resources/js/pages/admin/users/index.tsx

import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/layouts/admin-layout';
import { User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';

type IndexPageProps = {
    users: {
        data: User[];
        links: {
            url: string;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search: string;
        role: string;
        date_from: string;
        date_to: string;
        sort_by: string;
        sort_order: string;
    };
};

export default function Index({ users, filters }: IndexPageProps) {
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false,
        userId: null as number | null,
        userName: ''
    });
    const { toast } = useToast();
    const getInitials = useInitials();

    const filterConfig: FilterConfig = {
        search: {
            placeholder: "Search by name or email...",
        },
        select: {
            role: {
                label: "Role",
                options: [
                    { value: "admin", label: "Admin" },
                    { value: "user", label: "User" }
                ],
                placeholder: "All Roles"
            }
        },
        dateRange: {
            enabled: true,
            label: "Registration Date"
        },
        sort: {
            enabled: true,
            options: [
                { value: "created_at", label: "Registration Date" },
                { value: "name", label: "Name" },
                { value: "email", label: "Email" },
                { value: "role", label: "Role" }
            ],
            defaultSort: "created_at",
            defaultOrder: "desc"
        }
    };

    const confirmDelete = () => {
        if (deleteDialog.userId) {
            router.delete(route('admin.users.destroy', deleteDialog.userId), {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'User deleted successfully',
                    });
                    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete user',
                        variant: 'destructive',
                    });
                    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
                }
            });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                </div>
            }
        >
            <Head title="Users" />

            <div className="space-y-4">
                <AdminFilter 
                    config={filterConfig}
                    filters={filters}
                    route="admin.users.index"
                />

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">User List</h2>
                    <Link href={route('admin.users.create')} className={buttonVariants({ size: 'sm' })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah User
                    </Link>
                </div>
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Foto Profil</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage 
                                                src={user.profile_photo_url} 
                                                alt={user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('admin.users.edit', user.id)}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    variant="destructive"
                                                    onClick={() => setDeleteDialog({
                                                        isOpen: true,
                                                        userId: user.id,
                                                        userName: user.name
                                                    })}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination>
                    <PaginationContent>
                        {users.links.map((link, index) => {
                            const { label, url, active } = link;
                            const page = parseInt(qs.parse(url?.split('?')[1] || '').page as string, 10);

                            if (label.includes('Previous')) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationPrevious href={url} disabled={!url} />
                                    </PaginationItem>
                                );
                            }

                            if (label.includes('Next')) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationNext href={url} disabled={!url} />
                                    </PaginationItem>
                                );
                            }

                            if (label.includes('...')) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }

                            return (
                                <PaginationItem key={index}>
                                    <PaginationLink href={url} isActive={active}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                    </PaginationContent>
                </Pagination>
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
