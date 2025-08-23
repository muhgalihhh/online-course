import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/pagination';

interface Category {
    id: number;
    name: string;
    description: string;
    created_at: string;
    courses_count: number;
}

interface CategoryIndexProps extends PageProps {
    categories: PaginatedData<Category>;
}

export default function CategoryIndex({ categories }: CategoryIndexProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Categories', href: route('admin.categories.index') },
            ]}
        >
            <Head title="Manage Categories" />

            <div className="">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Daftar Kategori</h1>
                    <Link href={route('admin.categories.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
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
                                                <Button variant="destructive" size="sm">
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
                                <Pagination links={categories.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}