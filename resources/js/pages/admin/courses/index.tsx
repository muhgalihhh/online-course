import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { useState } from 'react';
import { DeleteConfirmation } from '@/components/delete-confirmation';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_pro: boolean;
    created_at: string;
    institution: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
}

interface CourseIndexProps extends PageProps {
    courses: PaginatedData<Course>;
}

export default function CourseIndex({ courses }: CourseIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; courseId: number | null; courseTitle: string }>({ isOpen: false, courseId: null, courseTitle: '' });

    const confirmDelete = () => {
        if (deleteDialog.courseId) {
            router.delete(route('admin.courses.destroy', deleteDialog.courseId));
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Courses', href: route('admin.courses.index') },
            ]}
        >
            <Head title="Manage Courses" />

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Daftar Kursus</h1>
                    <Link href={route('admin.courses.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Kursus
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Kursus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Institusi</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.data.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell>{course.institution.name}</TableCell>
                                        <TableCell>{course.category.name}</TableCell>
                                        <TableCell>Rp {course.price.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={course.is_pro ? 'default' : 'secondary'}>
                                                {course.is_pro ? 'Pro' : 'Free'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.courses.edit', course.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('admin.courses.show', course.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => setDeleteDialog({ isOpen: true, courseId: course.id, courseTitle: course.title })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {courses.links && courses.links.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={courses.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, courseId: null, courseTitle: '' })}
                onConfirm={confirmDelete}
                title="Hapus Kursus"
                description="Apakah Anda yakin ingin menghapus kursus"
                itemName={deleteDialog.courseTitle}
            />
        </AdminLayout>
    );
}