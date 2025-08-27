// resources/js/pages/admin/chapters/by-course.tsx

import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Clock, Edit, Eye, FileText, Filter, GraduationCap, Play, Plus, PlusSquare, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Institution {
    id: number;
    name: string;
}

interface Course {
    id: number;
    title: string;
    description?: string;
    price: number;
    is_pro: boolean;
    thumbnail?: string;
    created_at: string;
    category?: Category;
    institution?: Institution;
}

interface CourseMaterial {
    id: number;
    title: string;
    type: string;
    order: number;
}

interface Chapter {
    id: number;
    title: string;
    description?: string;
    order: number;
    duration?: number; // in minutes
    is_free?: boolean;
    created_at: string;
    course_materials?: CourseMaterial[];
}

interface ChaptersByCourseProps extends PageProps {
    course: Course;
    chapters: Chapter[];
}

export default function ChaptersByCourse({ course, chapters }: ChaptersByCourseProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        chapterId: number | null;
        chapterTitle: string;
    }>({
        isOpen: false,
        chapterId: null,
        chapterTitle: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: route('admin.dashboard'),
        },
        {
            title: 'Chapters',
            href: route('admin.chapters.index'),
        },
        {
            title: course.title,
            href: route('admin.chapters.by-course', course.id),
        },
    ];

    const handleDelete = (chapterId: number, chapterTitle: string) => {
        setDeleteDialog({
            isOpen: true,
            chapterId,
            chapterTitle,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.chapterId) {
            router.delete(route('admin.chapters.destroy', deleteDialog.chapterId), {
                onSuccess: () => {
                    setDeleteDialog({ isOpen: false, chapterId: null, chapterTitle: '' });
                },
            });
        }
    };

    const formatDuration = (minutes: number) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Filter chapters based on search and status
    const filteredChapters = chapters.filter((chapter) => {
        const matchesSearch = searchTerm === '' || 
            chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (chapter.description && chapter.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'free' && chapter.is_free) ||
            (statusFilter === 'premium' && !chapter.is_free);
        
        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const totalDuration = chapters.reduce((acc, chapter) => acc + (chapter.duration || 0), 0);
    const totalMaterials = chapters.reduce((acc, chapter) => acc + (chapter.course_materials?.length || 0), 0);
    const freeChapters = chapters.filter(chapter => chapter.is_free).length;
    const premiumChapters = chapters.filter(chapter => !chapter.is_free).length;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chapters - ${course.title}`} />

            {/* Header with Course Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.chapters.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Chapters</h1>
                        <p className="text-muted-foreground">Kelola bab-bab untuk kursus: {course.title}</p>
                    </div>
                    <Link href={route('admin.chapters.create', { course_id: course.id })} className="ml-auto">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Chapter
                        </Button>
                    </Link>
                </div>

                {/* Course Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle>{course.title}</CardTitle>
                                {course.description && (
                                    <CardDescription>{course.description}</CardDescription>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Badge variant={course.is_pro ? 'default' : 'secondary'}>
                                    {course.is_pro ? 'PRO' : 'FREE'}
                                </Badge>
                                {course.category && (
                                    <Badge variant="outline">{course.category.name}</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Chapters</p>
                                <p className="text-2xl font-semibold">{chapters.length}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Materi</p>
                                <p className="text-2xl font-semibold">{totalMaterials}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Durasi</p>
                                <p className="text-2xl font-semibold">{formatDuration(totalDuration)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Harga</p>
                                <p className="text-2xl font-semibold">
                                    {course.is_pro ? formatPrice(course.price) : 'Gratis'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Chapter</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan judul atau deskripsi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
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
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Daftar Chapters ({filteredChapters.length})
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="default">{freeChapters} Gratis</Badge>
                            <Badge variant="secondary">{premiumChapters} Premium</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredChapters.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Order</TableHead>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Durasi</TableHead>
                                    <TableHead>Materi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredChapters.map((chapter) => (
                                    <TableRow key={chapter.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {chapter.order}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{chapter.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            {chapter.description ? (
                                                <div className="max-w-[300px] line-clamp-2 text-sm text-muted-foreground">
                                                    {chapter.description}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{formatDuration(chapter.duration)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <Badge variant="secondary" className="text-xs">
                                                    {chapter.course_materials?.length || 0} materi
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={chapter.is_free ? 'default' : 'secondary'}>
                                                {chapter.is_free ? 'Gratis' : 'Premium'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(chapter.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('admin.materials.by-chapter', chapter.id)}>
                                                    <Button variant="outline" size="sm" title="Kelola Materi">
                                                        <PlusSquare className="h-4 w-4" />
                                                        <span className="ml-1">Materi</span>
                                                    </Button>
                                                </Link>
                                                <Link href={route('admin.chapters.show', chapter.id)}>
                                                    <Button variant="outline" size="sm" title="Lihat Detail">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('admin.chapters.edit', chapter.id)}>
                                                    <Button variant="outline" size="sm" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(chapter.id, chapter.title)}
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Belum ada chapter</h3>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                Kursus ini belum memiliki chapter. Mulai dengan menambahkan chapter pertama.
                            </p>
                            <Link href={route('admin.chapters.create', { course_id: course.id })}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Chapter Pertama
                                </Button>
                            </Link>
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
                        <div className="text-2xl font-bold">{chapters.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Chapter dalam kursus ini
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
                        <p className="text-xs text-muted-foreground">Total durasi pembelajaran</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Free Chapters</CardTitle>
                        <Play className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{freeChapters}</div>
                        <p className="text-xs text-muted-foreground">Chapter yang dapat diakses gratis</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Materi</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMaterials}</div>
                        <p className="text-xs text-muted-foreground">Materi pembelajaran</p>
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