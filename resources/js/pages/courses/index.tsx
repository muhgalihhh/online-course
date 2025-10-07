import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import GuestLayout from '@/layouts/guest-layout';
import { type Transaction } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, Clock, Grid, List, Search, Star, Users } from 'lucide-react';
import { useState } from 'react';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    formatted_price: string;
    instructor: string;
    category: { name: string };
    image: string;
    thumbnail?: string;
    status: string;
    average_rating: number;
    enrolled_count: number;
    duration: string;
    total_chapters: number;
    total_reviews?: number;
    total_students?: number;
    level: string;
    is_enrolled?: boolean;
    is_favorite?: boolean;
    is_pro?: boolean;
    payment_status?: string;
    button_text?: string;
    institution?: { name: string };
    transaction?: Transaction;
}

interface PageProps {
    courses: {
        data: Course[];
        links: Array<{ url?: string; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
    };
    categories: Array<{ id: number; name: string }>;
    filters: {
        category?: string;
        type?: string;
        search?: string;
        sort?: string;
    };
    [key: string]: unknown;
}

export default function CoursesIndex() {
    const { courses, categories, filters } = usePage<PageProps>().props;
    const { isAuthenticated, isAdmin } = useAuth();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/courses', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const currentFilters = { ...filters };
        if (value === 'all' || !value) {
            const updatedFilters = Object.fromEntries(Object.entries(currentFilters).filter(([k]) => k !== key));
            router.get('/courses', updatedFilters, { preserveState: true });
        } else {
            router.get('/courses', { ...currentFilters, [key]: value }, { preserveState: true });
        }
    };

    const handleBookCourse = (course: Course) => {
        console.log('handleBookCourse called', {
            courseId: course.id,
            isPro: course.is_pro,
            price: course.price,
            isAuthenticated,
            isAdmin,
            paymentStatus: course.payment_status,
        });

        if (!isAuthenticated) {
            setShowLoginDialog(true);
        } else if (isAdmin) {
            // Prevent admin from enrolling
            alert('Admin tidak dapat mendaftar kelas. Silakan gunakan panel admin untuk mengelola kursus.');
            return;
        } else {
            // Check payment status first
            if (course.payment_status === 'pending_payment' && course.transaction) {
                // Redirect to continue payment using order ID
                router.visit(route('transactions.show', course.transaction.midtrans_order_id));
                return;
            }

            // For free courses, directly enroll without payment
            if (!course.is_pro && course.price === 0) {
                console.log('Enrolling in free course:', course.id);
                router.post(
                    `/courses/${course.id}/enroll-free`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: (page) => {
                            console.log('Enrollment success', page);
                            // Redirect will be handled by the controller
                        },
                        onError: (errors) => {
                            console.error('Enrollment error:', errors);
                        },
                    },
                );
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
        <Card className="flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative">
                    <img
                        src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                        alt={course.title}
                        className="aspect-[16/9] w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant={course.is_pro ? 'default' : 'secondary'}>{course.is_pro ? 'Pro' : 'Free'}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-4">
                <Badge variant="outline" className="mb-2 w-fit">
                    {course.category.name}
                </Badge>
                <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{course.title}</h3>
                <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{course.description}</p>

                <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{(course.average_rating || 0).toFixed(1)}</span>
                            <span>({course.total_reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.total_students?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{course.institution?.name}</p>
                        <p className="text-lg font-bold text-primary">{course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}</p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover-gradient-gray flex-1 transition-all duration-200" asChild>
                            <Link href={`/courses/${course.id}`}>Lihat Detail</Link>
                        </Button>
                        {course.is_enrolled ? (
                            <Button size="sm" className="btn-success-gradient flex-1" asChild>
                                <Link href={`/courses/${course.id}/learn`}>Lanjutkan Belajar</Link>
                            </Button>
                        ) : isAdmin ? (
                            <Button size="sm" className="btn-secondary-gradient flex-1" disabled>
                                Admin
                            </Button>
                        ) : course.payment_status === 'paid_processing' ? (
                            <Button size="sm" className="btn-warning-gradient flex-1" disabled>
                                <Clock className="mr-1 h-3 w-3" />
                                Sedang Diproses
                            </Button>
                        ) : course.payment_status === 'pending_payment' ? (
                            <Button size="sm" className="course-btn-payment flex-1" onClick={() => handleBookCourse(course)}>
                                Lanjutkan Pembayaran
                            </Button>
                        ) : (
                            <Button size="sm" className="course-btn-enroll flex-1" onClick={() => handleBookCourse(course)}>
                                {course.button_text || (course.is_pro ? 'Beli Sekarang' : 'Ikuti Kursus')}
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
                        className="h-32 w-48 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <Badge variant="outline">{course.category.name}</Badge>
                                    <Badge variant={course.is_pro ? 'default' : 'secondary'}>{course.is_pro ? 'Pro' : 'Free'}</Badge>
                                </div>
                                <h3 className="text-lg font-semibold">{course.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{course.institution?.name}</p>
                            </div>
                            <p className="text-xl font-bold text-primary">
                                {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                            </p>
                        </div>

                        <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{(course.average_rating || 0).toFixed(1)}</span>
                                    <span>({course.total_reviews} ulasan)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{course.total_students?.toLocaleString() || 0} siswa</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hover-gradient-gray transition-all duration-200" asChild>
                                    <Link href={`/courses/${course.id}`}>Lihat Detail</Link>
                                </Button>
                                {course.is_enrolled ? (
                                    <Button size="sm" className="btn-success-gradient" asChild>
                                        <Link href={`/courses/${course.id}/learn`}>Lanjutkan Belajar</Link>
                                    </Button>
                                ) : isAdmin ? (
                                    <Button size="sm" className="btn-secondary-gradient" disabled>
                                        Admin
                                    </Button>
                                ) : course.payment_status === 'paid_processing' ? (
                                    <Button size="sm" className="btn-warning-gradient" disabled>
                                        {course.button_text || 'Sedang Diproses'}
                                    </Button>
                                ) : (
                                    <Button size="sm" className="course-btn-enroll" onClick={() => handleBookCourse(course)}>
                                        {course.button_text || (course.is_pro ? 'Pesan Sekarang' : 'Ikuti Kursus')}
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
            <section className="relative overflow-hidden py-16">
                {/* Gradient Background */}
                <div className="course-section-gradient absolute inset-0"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="title-gradient mb-4 text-3xl font-bold">Katalog Kursus</h1>
                        <p className="text-high-contrast mx-auto max-w-2xl">
                            Temukan kursus yang sesuai dengan kebutuhan Anda dari berbagai kategori dan tingkat kesulitan
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="border-b py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-4 lg:flex-row">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="max-w-md flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
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

                            <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="pro">Kelas Pro</SelectItem>
                                    <SelectItem value="free">Kelas Gratis</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.sort || 'latest'} onValueChange={(value) => handleFilterChange('sort', value)}>
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
                            <div className="ml-auto flex gap-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    className={viewMode === 'grid' ? 'btn-primary-gradient' : 'hover-gradient-gray transition-all duration-200'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    className={viewMode === 'list' ? 'btn-primary-gradient' : 'hover-gradient-gray transition-all duration-200'}
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
                                                return (
                                                    <span key={index} className="px-3 py-1">
                                                        ...
                                                    </span>
                                                );
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
                                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">Tidak ada kursus ditemukan</h3>
                                <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda</p>
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
                        <DialogDescription>Silakan login atau daftar terlebih dahulu untuk memesan kursus ini.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleLoginRedirect}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </GuestLayout>
    );
}
