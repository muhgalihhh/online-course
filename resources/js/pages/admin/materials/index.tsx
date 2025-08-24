// resources/js/pages/admin/materials/index.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, FileText, Search, Filter, Video, File, Download, Clock } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Materials',
        href: route('admin.materials.index'),
    },
];

interface Chapter {
    id: number;
    title: string;
    course: {
        id: number;
        title: string;
    };
}

interface Material {
    id: number;
    title: string;
    description: string;
    type: 'video' | 'document' | 'quiz' | 'assignment';
    file_path: string;
    file_size: number;
    duration: number; // in minutes
    order: number;
    is_free: boolean;
    created_at: string;
    chapter: Chapter;
}

interface MaterialsProps extends PageProps {
    materials: PaginatedData<Material>;
    chapters: Chapter[];
}

export default function Materials({ materials, chapters }: MaterialsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [chapterFilter, setChapterFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        materialId: number | null;
        materialTitle: string;
    }>({
        isOpen: false,
        materialId: null,
        materialTitle: '',
    });

    const handleDelete = (materialId: number, materialTitle: string) => {
        setDeleteDialog({
            isOpen: true,
            materialId,
            materialTitle,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.materialId) {
            router.delete(route('admin.materials.destroy', deleteDialog.materialId));
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="h-4 w-4" />;
            case 'document':
                return <File className="h-4 w-4" />;
            case 'quiz':
                return <FileText className="h-4 w-4" />;
            case 'assignment':
                return <FileText className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'video':
                return 'Video';
            case 'document':
                return 'Dokumen';
            case 'quiz':
                return 'Quiz';
            case 'assignment':
                return 'Tugas';
            default:
                return type;
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'video':
                return 'default';
            case 'document':
                return 'secondary';
            case 'quiz':
                return 'outline';
            case 'assignment':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Materials" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Materi</h1>
                    <p className="text-muted-foreground">
                        Kelola materi pembelajaran dalam setiap chapter
                    </p>
                </div>
                <Link href={route('admin.materials.create')}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Materi
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Materi</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan judul..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chapter</label>
                            <Select value={chapterFilter} onValueChange={setChapterFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Chapter</SelectItem>
                                    {chapters.map((chapter) => (
                                        <SelectItem key={chapter.id} value={chapter.id.toString()}>
                                            {chapter.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipe Materi</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="document">Dokumen</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="assignment">Tugas</SelectItem>
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

            {/* Materials Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Daftar Materi ({materials.data.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Judul</TableHead>
                                <TableHead>Chapter</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Ukuran/Durasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal Dibuat</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.data.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {material.order}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{material.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                {material.description}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-sm font-medium">{material.chapter.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {material.chapter.course.title}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(material.type)}
                                            <Badge variant={getTypeBadgeVariant(material.type)}>
                                                {getTypeLabel(material.type)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {material.type === 'video' ? (
                                                <>
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{formatDuration(material.duration)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <File className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{formatFileSize(material.file_size)}</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={material.is_free ? 'default' : 'secondary'}>
                                            {material.is_free ? 'Gratis' : 'Premium'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(material.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={route('admin.materials.show', material.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.materials.edit', material.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDelete(material.id, material.title)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {materials.links && materials.links.length > 0 && (
                        <div className="mt-4">
                            <Pagination links={materials.links} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Material Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Materi</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{materials.data.length}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Video Materi</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {materials.data.filter(material => material.type === 'video').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Materi video pembelajaran
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dokumen</CardTitle>
                        <File className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {materials.data.filter(material => material.type === 'document').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Materi dokumen dan file
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ukuran</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatFileSize(materials.data.reduce((acc, material) => acc + material.file_size, 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total ukuran semua materi
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, materialId: null, materialTitle: '' })}
                onConfirm={confirmDelete}
                title="Hapus Materi"
                description="Apakah Anda yakin ingin menghapus materi"
                itemName={deleteDialog.materialTitle}
            />
        </AdminLayout>
    );
}