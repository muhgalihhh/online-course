// resources/js/pages/admin/chapters/index.tsx

import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Clock, Edit, Eye, FileText, Filter, Play, Plus, PlusSquare, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Chapters',
        href: route('admin.chapters.index'),
    },
];

interface Course {
    id: number;
    title: string;
}

interface Chapter {
    id: number;
    title: string;
    description?: string;
    order: number;
    duration?: number; // in minutes
    is_free?: boolean;
    created_at: string;
    course: Course;
    course_materials_count: number;
}

interface ChaptersProps extends PageProps {
    chapters: PaginatedData<Chapter>;
    courses: Course[];
}

export default function Chapters({ chapters, courses }: ChaptersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        chapterId: number | null;
        chapterTitle: string;
    }>({
        isOpen: false,
        chapterId: null,
        chapterTitle: '',
    });

    const handleDelete = (chapterId: number, chapterTitle: string) => {
        setDeleteDialog({
            isOpen: true,
            chapterId,
            chapterTitle,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.chapterId) {
            router.delete(route('admin.chapters.destroy', deleteDialog.chapterId));
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Chapters" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Chapters</h1>
                    <p className="text-muted-foreground">Kelola bab-bab dalam kursus dan materi pembelajaran</p>
                </div>
                <Link href={route('admin.chapters.create')}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Chapter
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter & Pencarian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Chapter</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan judul..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kursus</label>
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kursus</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="free">Gratis</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chapters Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Daftar Chapters ({chapters.data.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Judul</TableHead>
                                <TableHead>Kursus</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Materi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal Dibuat</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {chapters.data.map((chapter) => (
                                <TableRow key={chapter.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {chapter.order}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{chapter.title}</div>
                                            {chapter.description && (
                                                <div className="line-clamp-1 text-sm text-muted-foreground">{chapter.description}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{chapter.course.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{chapter.duration ? formatDuration(chapter.duration) : '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary" className="text-xs">
                                                {chapter.course_materials_count} materi
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={chapter.is_free ? 'default' : 'secondary'}>{chapter.is_free ? 'Gratis' : 'Premium'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(chapter.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* Add Materials */}
                                            <Link href={route('admin.materials.index')}>
                                                <Button variant="outline" size="sm">
                                                    <PlusSquare className="h-4 w-4" />
                                                    <span className="text-md ml-1">Materi Course</span>
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.chapters.show', chapter.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.chapters.edit', chapter.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(chapter.id, chapter.title)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {chapters.links && chapters.links.length > 0 && (
                        <div className="mt-4">
                            <Pagination links={chapters.links} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Chapter Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chapters.data.length}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+8%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDuration(chapters.data.reduce((acc, chapter) => acc + (chapter.duration || 0), 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">Total durasi semua chapter</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Free Chapters</CardTitle>
                        <Play className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chapters.data.filter((chapter) => chapter.is_free).length}</div>
                        <p className="text-xs text-muted-foreground">Chapter yang dapat diakses gratis</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Premium Chapters</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chapters.data.filter((chapter) => !chapter.is_free).length}</div>
                        <p className="text-xs text-muted-foreground">Chapter premium berbayar</p>
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, chapterId: null, chapterTitle: '' })}
                onConfirm={confirmDelete}
                title="Hapus Chapter"
                description="Apakah Anda yakin ingin menghapus chapter"
                itemName={deleteDialog.chapterTitle}
            />
        </AdminLayout>
    );
}
