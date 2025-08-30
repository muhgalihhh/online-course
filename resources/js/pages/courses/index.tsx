import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
    BookOpen, 
    Star, 
    Users, 
    Search,
    Filter,
    Grid,
    List,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_pro: boolean;
    status: string;
    thumbnail: string | null;
    category: {
        id: number;
        name: string;
    };
    institution: {
        id: number;
        name: string;
    };
    average_rating: number;
    total_reviews: number;
    total_students: number;
    is_enrolled?: boolean;
}

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface PageProps {
    courses: {
        data: Course[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: Category[];
    filters: {
        category?: string;
        type?: string;
        search?: string;
        sort?: string;
    };
}

export default function CoursesIndex() {
    const { courses, categories, filters } = usePage<PageProps>().props;
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/courses', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all' || !value) {
            delete newFilters[key];
        }
        router.get('/courses', newFilters, { preserveState: true });
    };

    const handleBookCourse = (course: Course) => {
        console.log('handleBookCourse called', { 
            courseId: course.id, 
            isPro: course.is_pro, 
            price: course.price,
            isAuthenticated 
        });
        
        if (!isAuthenticated) {
            setShowLoginDialog(true);
        } else {
            // For free courses, directly enroll without payment
            if (!course.is_pro && course.price === 0) {
                console.log('Enrolling in free course:', course.id);
                router.post(`/courses/${course.id}/enroll-free`, {}, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log('Enrollment success', page);
                        // Redirect will be handled by the controller
                    },
                    onError: (errors) => {
                        console.error('Enrollment error:', errors);
                    }
                });
            } else {
                // Navigate to enrollment/payment page for pro courses
                router.visit(`/courses/${course.id}/enroll`);
            }
        }
    };

    const handleLoginRedirect = () => {
        router.visit('/login');
    };

    const CourseCard = ({ course }: { course: Course }) => (
        <Card className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg h-full flex flex-col">
            <CardHeader className="p-0">
                <div className="relative">
                    <img 
                        src={course.thumbnail || 'https://via.placeholder.com/400x225'} 
                        alt={course.title} 
                        className="aspect-[16/9] w-full object-cover" 
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant={course.is_pro ? "default" : "secondary"}>
                            {course.is_pro ? "Pro" : "Free"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
                <Badge variant="outline" className="mb-2 w-fit">{course.category.name}</Badge>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{course.description}</p>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{course.average_rating.toFixed(1)}</span>
                            <span>({course.total_reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.total_students.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {course.institution.name}
                        </p>
                        <p className="text-lg font-bold text-primary">
                            {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            asChild
                        >
                            <Link href={`/courses/${course.id}`}>
                                Lihat Detail
                            </Link>
                        </Button>
                        {course.is_enrolled ? (
                            <Button size="sm" className="flex-1" asChild>
                                <Link href={`/courses/${course.id}/learn`}>
                                    Lanjutkan Belajar
                                </Link>
                            </Button>
                        ) : (
                            <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleBookCourse(course)}
                            >
                                {course.is_pro ? 'Pesan' : 'Ikuti'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const CourseListItem = ({ course }: { course: Course }) => (
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <img 
                        src={course.thumbnail || 'https://via.placeholder.com/200x150'} 
                        alt={course.title} 
                        className="w-48 h-32 object-cover rounded-lg" 
                    />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{course.category.name}</Badge>
                                    <Badge variant={course.is_pro ? "default" : "secondary"}>
                                        {course.is_pro ? "Pro" : "Free"}
                                    </Badge>
                                </div>
                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{course.institution.name}</p>
                            </div>
                            <p className="text-xl font-bold text-primary">
                                {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                            </p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{course.average_rating.toFixed(1)}</span>
                                    <span>({course.total_reviews} ulasan)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{course.total_students.toLocaleString()} siswa</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    asChild
                                >
                                    <Link href={`/courses/${course.id}`}>
                                        Lihat Detail
                                    </Link>
                                </Button>
                                {course.is_enrolled ? (
                                    <Button size="sm" asChild>
                                        <Link href={`/courses/${course.id}/learn`}>
                                            Lanjutkan Belajar
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button 
                                        size="sm"
                                        onClick={() => handleBookCourse(course)}
                                    >
                                        {course.is_pro ? 'Pesan Sekarang' : 'Ikuti Kursus'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <GuestLayout>
            {/* Header Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Katalog Kursus</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Temukan kursus yang sesuai dengan kebutuhan Anda dari berbagai kategori dan tingkat kesulitan
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="py-6 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari kursus..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={filters.category || 'all'}
                                onValueChange={(value) => handleFilterChange('category', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Kategori" />
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

                            <Select
                                value={filters.type || 'all'}
                                onValueChange={(value) => handleFilterChange('type', value)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="pro">Kelas Pro</SelectItem>
                                    <SelectItem value="free">Kelas Gratis</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.sort || 'latest'}
                                onValueChange={(value) => handleFilterChange('sort', value)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Urutkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Terbaru</SelectItem>
                                    <SelectItem value="popular">Terpopuler</SelectItem>
                                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                                    <SelectItem value="price_low">Harga Terendah</SelectItem>
                                    <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* View Mode Toggle */}
                            <div className="flex gap-1 ml-auto">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid/List */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {/* Results Info */}
                    <div className="mb-6 text-sm text-muted-foreground">
                        Menampilkan {courses.from || 0} - {courses.to || 0} dari {courses.total} kursus
                    </div>

                    {/* Courses */}
                    {courses.data.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {courses.data.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {courses.data.map((course) => (
                                        <CourseListItem key={course.id} course={course} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {courses.last_page > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex gap-1">
                                        {courses.links.map((link, index) => {
                                            if (link.label === '&laquo; Previous') {
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.url ? 'outline' : 'ghost'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                );
                                            }
                                            if (link.label === 'Next &raquo;') {
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.url ? 'outline' : 'ghost'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                );
                                            }
                                            if (link.label === '...') {
                                                return <span key={index} className="px-3 py-1">...</span>;
                                            }
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    {link.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card className="p-12">
                            <CardContent className="text-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Tidak ada kursus ditemukan</h3>
                                <p className="text-muted-foreground">
                                    Coba ubah filter atau kata kunci pencarian Anda
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>

            {/* Login Required Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Diperlukan</DialogTitle>
                        <DialogDescription>
                            Silakan login atau daftar terlebih dahulu untuk memesan kursus ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleLoginRedirect}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </GuestLayout>
    );
}