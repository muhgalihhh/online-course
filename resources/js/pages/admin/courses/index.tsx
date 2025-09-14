import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, FileX, Image as ImageIcon, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_pro: boolean;
    status: 'draft' | 'published';
    created_at: string;
    thumbnail_path?: string;
    thumbnail?: string;
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
    categories: Array<{ id: number; name: string }>;
    institutions: Array<{ id: number; name: string }>;
    filters: {
        search: string;
        category_id: string;
        institution_id: string;
        is_pro: string;
        status: string;
        price_min: string;
        price_max: string;
        date_from: string;
        date_to: string;
        sort_by: string;
        sort_order: string;
    };
}

export default function CourseIndex({ courses, categories, institutions, filters }: CourseIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; courseId: number | null; courseTitle: string }>({
        isOpen: false,
        courseId: null,
        courseTitle: '',
    });

    const handlePagination = (url: string) => {
        router.get(url, filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const filterConfig: FilterConfig = {
        search: {
            placeholder: 'Search by title or description...',
        },
        select: {
            category_id: {
                label: 'Category',
                options: categories?.map((cat) => ({ value: cat.id.toString(), label: cat.name })) || [],
                placeholder: 'All Categories',
            },
            institution_id: {
                label: 'Institution',
                options: institutions?.map((inst) => ({ value: inst.id.toString(), label: inst.name })) || [],
                placeholder: 'All Institutions',
            },
            is_pro: {
                label: 'Course Type',
                options: [
                    { value: 'true', label: 'Pro Course' },
                    { value: 'false', label: 'Free Course' },
                ],
                placeholder: 'All Types',
            },
            status: {
                label: 'Status',
                options: [
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                ],
                placeholder: 'All Status',
            },
        },
        numberRange: {
            price: {
                label: 'Price Range',
                min: 0,
                step: 1000,
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
                { value: 'title', label: 'Title' },
                { value: 'price', label: 'Price' },
            ],
            defaultSort: 'created_at',
            defaultOrder: 'desc',
        },
    };

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

            <div className="space-y-4">
                <AdminFilter config={filterConfig} filters={filters} route="admin.courses.index" />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Daftar Kursus</h1>
                    <Link href={route('admin.courses.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
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
                                    <TableHead>Thumbnail</TableHead>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Institusi</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.data.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>
                                            <Avatar className="h-12 w-12 rounded-lg">
                                                <AvatarImage
                                                    src={
                                                        course.thumbnail ||
                                                        (course.thumbnail_path ? `/${course.thumbnail_path.replace(/^\/+/, '')}` : '')
                                                    }
                                                    alt={course.title}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{course.title}</p>
                                                <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{course.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{course.institution.name}</TableCell>
                                        <TableCell>{course.category.name}</TableCell>
                                        <TableCell>Rp {course.price.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={course.is_pro ? 'default' : 'secondary'}>{course.is_pro ? 'Pro' : 'Free'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={course.status === 'published' ? 'success' : 'warning'}>
                                                {course.status === 'published' ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.courses.edit', course.id)}>
                                                    <Button variant="outline" size="sm" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('admin.courses.show', course.id)}>
                                                    <Button variant="outline" size="sm" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant={course.status === 'draft' ? 'default' : 'secondary'}
                                                    size="sm"
                                                    onClick={() => router.patch(route('admin.courses.toggle-publish', course.id))}
                                                    title={course.status === 'draft' ? 'Publikasikan' : 'Ubah ke Draft'}
                                                >
                                                    {course.status === 'draft' ? <Send className="h-4 w-4" /> : <FileX className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeleteDialog({ isOpen: true, courseId: course.id, courseTitle: course.title })}
                                                    title="Delete"
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
                                <Pagination links={courses.links} onPageChange={handlePagination} />
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
