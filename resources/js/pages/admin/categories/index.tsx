import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    description: string;
    created_at: string;
    courses_count: number;
}

interface CategoryIndexProps extends PageProps {
    categories: PaginatedData<Category>;
    filters: {
        search: string;
        course_count_min: string;
        course_count_max: string;
        date_from: string;
        date_to: string;
        sort_by: string;
        sort_order: string;
    };
}

export default function CategoryIndex({ categories, filters }: CategoryIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        categoryId: number | null;
        categoryName: string;
    }>({
        isOpen: false,
        categoryId: null,
        categoryName: '',
    });

    const handlePagination = (url: string) => {
        router.get(url, filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const filterConfig: FilterConfig = {
        search: {
            placeholder: 'Search by name or description...',
        },
        numberRange: {
            course_count: {
                label: 'Course Count Range',
                min: 0,
                step: 1,
            },
        },
        dateRange: {
            enabled: true,
            label: 'Creation Date',
        },
        sort: {
            enabled: true,
            options: [
                { value: 'created_at', label: 'Creation Date' },
                { value: 'name', label: 'Name' },
                { value: 'courses_count', label: 'Course Count' },
            ],
            defaultSort: 'created_at',
            defaultOrder: 'desc',
        },
    };

    const handleDelete = (categoryId: number, categoryName: string) => {
        setDeleteDialog({
            isOpen: true,
            categoryId,
            categoryName,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.categoryId) {
            router.delete(route('admin.categories.destroy', deleteDialog.categoryId));
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Categories', href: route('admin.categories.index') },
            ]}
        >
            <Head title="Manage Categories" />

            <div className="space-y-4">
                <AdminFilter config={filterConfig} filters={filters} route="admin.categories.index" />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Daftar Kategori</h1>
                    <Link href={route('admin.categories.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Jumlah Kursus</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{category.courses_count}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.categories.edit', category.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id, category.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {categories.links && categories.links.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={categories.links} onPageChange={handlePagination} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, categoryId: null, categoryName: '' })}
                onConfirm={confirmDelete}
                title="Hapus Kategori"
                description="Apakah Anda yakin ingin menghapus kategori"
                itemName={deleteDialog.categoryName}
            />
        </AdminLayout>
    );
}
