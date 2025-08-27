// resources/js/pages/admin/chapters/index.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, Clock, FileText, Filter, GraduationCap, Play, Plus, Search, Users } from 'lucide-react';
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
    chapters_count: number;
    course_materials_count: number;
    total_duration: number; // in minutes
    free_chapters_count: number;
    enrollments_count?: number;
}

interface ChaptersProps extends PageProps {
    courses: PaginatedData<Course>;
    categories: Category[];
    institutions: Institution[];
}

export default function Chapters({ courses, categories, institutions }: ChaptersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [institutionFilter, setInstitutionFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const formatDuration = (minutes: number) => {
        if (!minutes) return '0m';
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

    // Filter courses based on search and filters
    const filteredCourses = courses.data.filter((course) => {
        const matchesSearch = searchTerm === '' || 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = categoryFilter === 'all' || 
            (course.category && course.category.id.toString() === categoryFilter);
        
        const matchesInstitution = institutionFilter === 'all' || 
            (course.institution && course.institution.id.toString() === institutionFilter);
        
        const matchesType = typeFilter === 'all' ||
            (typeFilter === 'pro' && course.is_pro) ||
            (typeFilter === 'free' && !course.is_pro);
        
        return matchesSearch && matchesCategory && matchesInstitution && matchesType;
    });

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Chapters" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Chapters</h1>
                    <p className="text-muted-foreground">Pilih kursus untuk mengelola chapter dan materi pembelajaran</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter Kursus
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Kursus</label>
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
                            <label className="text-sm font-medium">Kategori</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Institusi</label>
                            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Institusi</SelectItem>
                                    {institutions.map((institution) => (
                                        <SelectItem key={institution.id} value={institution.id.toString()}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipe Kursus</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="pro">Pro/Premium</SelectItem>
                                    <SelectItem value="free">Gratis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Course Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Course Thumbnail */}
                        {course.thumbnail && (
                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative">
                                <img 
                                    src={course.thumbnail} 
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <Badge variant={course.is_pro ? 'default' : 'secondary'}>
                                        {course.is_pro ? 'PRO' : 'FREE'}
                                    </Badge>
                                </div>
                            </div>
                        )}
                        {!course.thumbnail && (
                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                                <GraduationCap className="h-16 w-16 text-primary/20" />
                                <div className="absolute top-2 right-2">
                                    <Badge variant={course.is_pro ? 'default' : 'secondary'}>
                                        {course.is_pro ? 'PRO' : 'FREE'}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                            </div>
                            {course.description && (
                                <CardDescription className="line-clamp-2">
                                    {course.description}
                                </CardDescription>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Course Meta Info */}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                {course.category && (
                                    <Badge variant="outline">{course.category.name}</Badge>
                                )}
                                {course.institution && (
                                    <Badge variant="outline">{course.institution.name}</Badge>
                                )}
                            </div>

                            {/* Course Statistics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="text-sm">Chapters</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{course.chapters_count || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">Materi</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{course.course_materials_count || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">Durasi</span>
                                    </div>
                                    <p className="text-lg font-semibold">{formatDuration(course.total_duration)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Play className="h-4 w-4" />
                                        <span className="text-sm">Gratis</span>
                                    </div>
                                    <p className="text-lg font-semibold">{course.free_chapters_count || 0}</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{course.enrollments_count || 0} siswa</span>
                                </div>
                                {course.is_pro && (
                                    <div className="text-sm font-semibold">
                                        {formatPrice(course.price)}
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="gap-2">
                            <Link 
                                href={route('admin.chapters.by-course', course.id)}
                                className="flex-1"
                            >
                                <Button className="w-full" variant="default">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Kelola Chapters
                                </Button>
                            </Link>
                            <Link href={route('admin.courses.show', course.id)}>
                                <Button variant="outline" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredCourses.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Tidak ada kursus ditemukan</h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            Tidak ada kursus yang sesuai dengan filter yang Anda pilih.
                        </p>
                        <Link href={route('admin.courses.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Buat Kursus Baru
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Overall Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.data.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Kursus yang tersedia
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {courses.data.reduce((acc, course) => acc + (course.chapters_count || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Chapter di semua kursus</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Materi</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {courses.data.reduce((acc, course) => acc + (course.course_materials_count || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Materi pembelajaran</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Durasi</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDuration(courses.data.reduce((acc, course) => acc + (course.total_duration || 0), 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">Total durasi pembelajaran</p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}