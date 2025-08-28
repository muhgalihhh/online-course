// resources/js/pages/admin/chapters/index.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, ChevronRight, Filter, GraduationCap, Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    status?: 'draft' | 'published';
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

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

    // Pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, institutionFilter, typeFilter]);

    // Generate pagination links
    const paginationLinks = [];
    paginationLinks.push({
        url: currentPage > 1 ? '#' : null,
        label: 'Previous',
        active: false
    });
    for (let i = 1; i <= totalPages; i++) {
        paginationLinks.push({
            url: '#',
            label: i.toString(),
            active: i === currentPage
        });
    }
    paginationLinks.push({
        url: currentPage < totalPages ? '#' : null,
        label: 'Next',
        active: false
    });

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        {/* Simplified Card without thumbnail */}
                        <div className="h-2 bg-gradient-to-r from-primary/20 to-primary/10" />

                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                                <div className="flex gap-1">
                                    <Badge variant={course.is_pro ? 'default' : 'secondary'} className="text-xs">
                                        {course.is_pro ? 'PRO' : 'FREE'}
                                    </Badge>
                                    {course.status && (
                                        <Badge 
                                            variant={course.status === 'published' ? 'success' : 'warning'} 
                                            className="text-xs"
                                        >
                                            {course.status === 'published' ? 'Published' : 'Draft'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {course.description && (
                                <CardDescription className="line-clamp-1 text-xs mt-1">
                                    {course.description}
                                </CardDescription>
                            )}
                        </CardHeader>

                        <CardContent className="py-2">
                            {/* Simplified Meta Info */}
                            <div className="flex flex-wrap gap-1 text-xs">
                                {course.category && (
                                    <Badge variant="outline" className="text-xs py-0">{course.category.name}</Badge>
                                )}
                                {course.institution && (
                                    <Badge variant="outline" className="text-xs py-0">{course.institution.name}</Badge>
                                )}
                            </div>

                            {/* Minimal Statistics */}
                            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                                <span>{course.chapters_count || 0} chapters</span>
                                {course.is_pro && (
                                    <span className="font-medium">{formatPrice(course.price)}</span>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 pb-3">
                            <Link 
                                href={route('admin.chapters.by-course', course.id)}
                                className="flex-1"
                            >
                                <Button className="w-full h-8 text-sm" variant="default">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    Kelola Chapters
                                </Button>
                            </Link>
                            <Link href={route('admin.courses.show', course.id)} className="ml-2">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Card>
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCourses.length)} dari {filteredCourses.length} kursus
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show only certain page numbers
                                    if (
                                        page === 1 || 
                                        page === totalPages || 
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={page === currentPage ? 'default' : 'outline'}
                                                size="sm"
                                                className="w-8 h-8 p-0"
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    } else if (
                                        page === currentPage - 2 || 
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="px-1">...</span>;
                                    }
                                    return null;
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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


        </AdminLayout>
    );
}