// resources/js/pages/admin/materials/index.tsx

import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, File, FileIcon, FileText, Image, Plus, Search, Trash2, Video, Youtube } from 'lucide-react';
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
    courses: Array<{ id: number; title: string; status?: 'draft' | 'published' }>;
    filters: {
        search?: string;
        course_id?: string;
        chapter_id?: string;
        type?: string;
    };
}

export default function Materials({ materials, groupedMaterials, chapters, courses, filters }: MaterialsProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    // Check if there's a selected_course in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCourseFromUrl = urlParams.get('selected_course');
    const [selectedCourse, setSelectedCourse] = useState<number | null>(selectedCourseFromUrl ? parseInt(selectedCourseFromUrl) : null);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        materialId: number | null;
        materialTitle: string;
    }>({
        isOpen: false,
        materialId: null,
        materialTitle: '',
    });

    const handlePagination = (url: string) => {
        router.get(url, filters, {
            preserveState: true,
            preserveScroll: true,
        });
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

    // Filter materials based on search and type
    const filterMaterials = (materials: Material[]) => {
        return materials.filter((material) => {
            const matchesSearch = searchTerm === '' || material.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || material.type === typeFilter;
            return matchesSearch && matchesType;
        });
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
                    <p className="text-muted-foreground">Kelola materi pembelajaran dalam setiap chapter</p>
                </div>
                <Link href={route('admin.materials.create')}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Materi
                    </Button>
                </Link>
            </div>

            {/* Search Bar - Only show when a course is selected */}
            {selectedCourse && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari materi dalam course ini..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter Tipe" />
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
                    </CardContent>
                </Card>
            )}

            {/* Materials Content */}
            {!selectedCourse ? (
                // Course Selection View
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Pilih Course untuk Mengelola Materi</CardTitle>
                            <p className="text-sm text-muted-foreground">Pilih course yang ingin Anda kelola materinya</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {courses.map((course) => {
                                    const courseData = groupedMaterials[course.id];
                                    const totalMaterials = courseData
                                        ? Object.values(courseData.chapters).reduce((acc, chapter) => acc + chapter.materials.length, 0)
                                        : 0;
                                    const totalChapters = courseData ? Object.keys(courseData.chapters).length : 0;

                                    return (
                                        <Card
                                            key={course.id}
                                            className="cursor-pointer border-2 transition-shadow hover:border-primary hover:shadow-lg"
                                            onClick={() => setSelectedCourse(course.id)}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="space-y-2">
                                                    <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                                                    {course.status && (
                                                        <Badge variant={course.status === 'published' ? 'success' : 'warning'} className="text-xs">
                                                            {course.status === 'published' ? 'Published' : 'Draft'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Total Chapter:</span>
                                                        <Badge variant="secondary">{totalChapters}</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Total Materi:</span>
                                                        <Badge variant="default">{totalMaterials}</Badge>
                                                    </div>
                                                    <div className="pt-3">
                                                        <Button className="w-full" variant="outline">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Kelola Materi
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                // Selected Course Materials View
                <div className="space-y-6">
                    {/* Course Header with Back Button */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                                        ← Kembali ke Daftar Course
                                    </Button>
                                    <div>
                                        <div className="mb-1 flex items-center gap-2">
                                            <CardTitle className="text-xl">{courses.find((c) => c.id === selectedCourse)?.title}</CardTitle>
                                            {courses.find((c) => c.id === selectedCourse)?.status && (
                                                <Badge
                                                    variant={
                                                        courses.find((c) => c.id === selectedCourse)?.status === 'published' ? 'success' : 'warning'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {courses.find((c) => c.id === selectedCourse)?.status === 'published' ? 'Published' : 'Draft'}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Kelola materi untuk course ini</p>
                                    </div>
                                </div>
                                <Link href={route('admin.materials.create', { course_id: selectedCourse })}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Materi
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Materials by Chapter */}
                    {groupedMaterials[selectedCourse] ? (
                        Object.entries(groupedMaterials[selectedCourse].chapters).map(([chapterId, chapterData]) => (
                            <Card key={chapterId}>
                                <CardHeader className="bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <FileText className="h-5 w-5" />
                                            Chapter: {chapterData.chapter.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{chapterData.materials.length} materi</Badge>
                                            <Link
                                                href={route('admin.materials.create', {
                                                    course_id: selectedCourse,
                                                    chapter_id: chapterId,
                                                })}
                                            >
                                                <Button size="sm" variant="outline">
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    Tambah
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {(() => {
                                        const filteredMaterials = filterMaterials(chapterData.materials);
                                        return filteredMaterials.length > 0 ? (
                                            <div className="space-y-3">
                                                {filteredMaterials
                                                    .sort((a, b) => a.order - b.order)
                                                    .map((material) => (
                                                        <div key={material.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="mb-2 flex items-center gap-3">
                                                                        <Badge variant="outline" className="font-mono">
                                                                            #{material.order}
                                                                        </Badge>
                                                                        <div className="flex items-center gap-2">
                                                                            {getTypeIcon(material.type)}
                                                                            <Badge variant={getTypeBadgeVariant(material.type)}>
                                                                                {getTypeLabel(material.type)}
                                                                            </Badge>
                                                                        </div>
                                                                        {material.is_preview && <Badge variant="default">Preview</Badge>}
                                                                    </div>
                                                                    <h5 className="mb-2 text-base font-semibold">{material.title}</h5>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {material.type === 'video_youtube' ? (
                                                                            <span className="flex items-center gap-1">
                                                                                <Youtube className="h-3 w-3" />
                                                                                {material.youtube_url
                                                                                    ? 'Video YouTube tersedia'
                                                                                    : 'URL tidak tersedia'}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1">
                                                                                <File className="h-3 w-3" />
                                                                                {material.file_path ? 'File tersedia' : 'File tidak tersedia'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4 flex items-center gap-2">
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
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-muted-foreground">
                                                <FileText className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                                <p>
                                                    {searchTerm || typeFilter !== 'all'
                                                        ? 'Tidak ada materi yang sesuai dengan filter'
                                                        : 'Belum ada materi di chapter ini'}
                                                </p>
                                                {!searchTerm && typeFilter === 'all' && (
                                                    <Link
                                                        href={route('admin.materials.create', {
                                                            course_id: selectedCourse,
                                                            chapter_id: chapterId,
                                                        })}
                                                    >
                                                        <Button className="mt-3" variant="outline">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Tambah Materi Pertama
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                                <h3 className="mb-2 text-lg font-semibold">Belum ada materi</h3>
                                <p className="mb-4 text-muted-foreground">Course ini belum memiliki materi pembelajaran</p>
                                <Link href={route('admin.materials.create', { course_id: selectedCourse })}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Materi Pertama
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {materials.links && materials.links.length > 0 && (
                        <div className="mt-6">
                            <Pagination links={materials.links} onPageChange={handlePagination} />
                        </div>
                    )}
                </div>
            )}

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
