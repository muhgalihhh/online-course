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
import { Plus, Edit, Trash2, Eye, FileText, Search, Filter, Video, File, Download, Clock, Youtube, Upload, Image, FileIcon } from 'lucide-react';
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
    type: 'pdf' | 'image' | 'video_local' | 'video_youtube';
    file_path: string | null;
    youtube_url: string | null;
    order: number;
    is_preview: boolean;
    created_at: string;
    chapter: Chapter;
}

interface GroupedMaterial {
    [courseId: number]: {
        course: {
            id: number;
            title: string;
        };
        chapters: {
            [chapterId: number]: {
                chapter: Chapter;
                materials: Material[];
            };
        };
    };
}

interface MaterialsProps extends PageProps {
    materials: PaginatedData<Material>;
    groupedMaterials: GroupedMaterial;
    chapters: Chapter[];
    courses: Array<{id: number; title: string}>;
    filters: {
        search?: string;
        course_id?: string;
        chapter_id?: string;
        type?: string;
    };
}

export default function Materials({ materials, groupedMaterials, chapters, courses, filters }: MaterialsProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [courseFilter, setCourseFilter] = useState(filters.course_id || 'all');
    const [chapterFilter, setChapterFilter] = useState(filters.chapter_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        materialId: number | null;
        materialTitle: string;
    }>({
        isOpen: false,
        materialId: null,
        materialTitle: '',
    });

    // Filter chapters berdasarkan course yang dipilih
    const filteredChapters = chapters.filter(chapter => 
        courseFilter === 'all' || chapter.course.id.toString() === courseFilter
    );

    // Handle perubahan course filter
    const handleCourseChange = (value: string) => {
        setCourseFilter(value);
        // Reset chapter filter ketika course berubah
        setChapterFilter('all');
    };

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

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (courseFilter !== 'all') params.append('course_id', courseFilter);
        if (chapterFilter !== 'all') params.append('chapter_id', chapterFilter);
        if (typeFilter !== 'all') params.append('type', typeFilter);
        
        router.get(route('admin.materials.index'), Object.fromEntries(params.entries()));
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
            case 'video_youtube':
                return <Youtube className="h-4 w-4" />;
            case 'video_local':
                return <Video className="h-4 w-4" />;
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            case 'image':
                return <Image className="h-4 w-4" />;
            default:
                return <FileIcon className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'video_youtube':
                return 'Video YouTube';
            case 'video_local':
                return 'Video Lokal';
            case 'pdf':
                return 'PDF';
            case 'image':
                return 'Gambar';
            default:
                return type;
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'video_youtube':
                return 'destructive';
            case 'video_local':
                return 'default';
            case 'pdf':
                return 'secondary';
            case 'image':
                return 'outline';
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Materi</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan judul..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Course</label>
                            <Select value={courseFilter} onValueChange={handleCourseChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Course</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chapter</label>
                            <Select 
                                value={chapterFilter} 
                                onValueChange={setChapterFilter}
                                disabled={courseFilter === 'all'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        courseFilter === 'all' 
                                            ? "Pilih course terlebih dahulu" 
                                            : "Pilih chapter"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Chapter</SelectItem>
                                    {filteredChapters.map((chapter) => (
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
                                    <SelectItem value="video_youtube">Video YouTube</SelectItem>
                                    <SelectItem value="video_local">Video Lokal</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="image">Gambar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Aksi</label>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} size="sm">
                                    <Search className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'grouped' | 'list')}>
                                    <SelectTrigger className="w-auto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grouped">Group View</SelectItem>
                                        <SelectItem value="list">List View</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Materials Content */}
            {viewMode === 'grouped' ? (
                // Grouped View
                <div className="space-y-6">
                    {Object.entries(groupedMaterials).map(([courseId, courseData]) => (
                        <Card key={courseId}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {courseData.course.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(courseData.chapters).map(([chapterId, chapterData]) => (
                                    <div key={chapterId} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-lg">{chapterData.chapter.title}</h4>
                                            <Badge variant="outline">
                                                {chapterData.materials.length} materi
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {chapterData.materials.map((material) => (
                                                <div key={material.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {getTypeIcon(material.type)}
                                                            <Badge variant={getTypeBadgeVariant(material.type)} className="text-xs">
                                                                {getTypeLabel(material.type)}
                                                            </Badge>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs font-mono">
                                                            #{material.order}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <h5 className="font-medium mb-2 line-clamp-2">{material.title}</h5>
                                                    
                                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                                        <span>
                                                            {material.type === 'video_youtube' ? (
                                                                material.youtube_url ? 'YouTube' : 'No URL'
                                                            ) : (
                                                                material.file_path ? 'File tersedia' : 'No file'
                                                            )}
                                                        </span>
                                                        <Badge variant={material.is_preview ? 'default' : 'secondary'} className="text-xs">
                                                            {material.is_preview ? 'Preview' : 'Full'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        <Link href={route('admin.materials.show', material.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.materials.edit', material.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => handleDelete(material.id, material.title)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                // List View
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
                                    <TableHead>Course / Chapter</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>File/URL</TableHead>
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
                                            <div className="font-medium">{material.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm font-medium">{material.chapter.course.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {material.chapter.title}
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
                                                {material.type === 'video_youtube' ? (
                                                    <>
                                                        <Youtube className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{material.youtube_url ? 'YouTube' : '-'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <File className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{material.file_path ? 'File Tersedia' : '-'}</span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={material.is_preview ? 'default' : 'secondary'}>
                                                {material.is_preview ? 'Preview' : 'Full'}
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
            )}

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
                            {materials.data.filter(material => material.type === 'video_youtube').length}
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
                            {materials.data.filter(material => material.type === 'pdf').length}
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