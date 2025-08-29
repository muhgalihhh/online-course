import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
    BookOpen, 
    Star, 
    Users, 
    Clock,
    Award,
    Download,
    PlayCircle,
    FileText,
    CheckCircle,
    Lock,
    ChevronRight,
    Building,
    Calendar,
    BarChart,
    Globe,
    ShoppingCart
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CourseMaterial {
    id: number;
    title: string;
    type: 'video' | 'pdf' | 'quiz' | 'assignment';
    duration?: number;
    file_path?: string;
}

interface Chapter {
    id: number;
    title: string;
    description?: string;
    order: number;
    course_materials: CourseMaterial[];
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        profile_photo_url?: string;
    };
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_pro: boolean;
    status: string;
    thumbnail: string | null;
    created_at: string;
    category: {
        id: number;
        name: string;
    };
    institution: {
        id: number;
        name: string;
        description?: string;
        photo?: string;
    };
    chapters: Chapter[];
    reviews: Review[];
    average_rating: number;
    total_reviews: number;
    total_students: number;
    total_chapters: number;
    total_materials: number;
}

interface RelatedCourse {
    id: number;
    title: string;
    thumbnail: string | null;
    price: number;
    is_pro: boolean;
    average_rating: number;
    total_reviews: number;
    total_students: number;
}

interface PageProps {
    course: Course;
    isEnrolled: boolean;
    relatedCourses: RelatedCourse[];
}

export default function CourseShow() {
    const { course, isEnrolled, relatedCourses } = usePage<PageProps>().props;
    const { isAuthenticated } = useAuth();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleEnroll = () => {
        if (!isAuthenticated) {
            setShowLoginDialog(true);
        } else {
            // For free courses, directly enroll without payment
            if (!course.is_pro && course.price === 0) {
                router.post(`/courses/${course.id}/enroll-free`);
            } else {
                // Navigate to enrollment/payment page for pro courses
                router.visit(`/courses/${course.id}/enroll`);
            }
        }
    };

    const handleLoginRedirect = () => {
        router.visit('/login');
    };

    const getMaterialIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <PlayCircle className="h-4 w-4" />;
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            case 'quiz':
                return <BarChart className="h-4 w-4" />;
            case 'assignment':
                return <Award className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}j ${mins}m`;
        }
        return `${mins} menit`;
    };

    const getRatingStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                    }`}
                />
            );
        }
        return stars;
    };

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-8">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link href="/" className="hover:text-primary">Beranda</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/courses" className="hover:text-primary">Kursus</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href={`/courses?category=${course.category.id}`} className="hover:text-primary">
                            {course.category.name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground">{course.title}</span>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline">{course.category.name}</Badge>
                                    <Badge variant={course.is_pro ? "default" : "secondary"}>
                                        {course.is_pro ? "Kelas Pro" : "Kelas Gratis"}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                                <p className="text-muted-foreground text-lg mb-6">{course.description}</p>
                                
                                {/* Stats */}
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {getRatingStars(Math.round(course.average_rating))}
                                        </div>
                                        <span className="font-semibold">{course.average_rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground">({course.total_reviews} ulasan)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{course.total_students.toLocaleString()} siswa</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>Terakhir diperbarui {new Date(course.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Instructor */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Lembaga Penyelenggara</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={course.institution.photo || undefined} />
                                            <AvatarFallback>
                                                <Building className="h-8 w-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-lg">{course.institution.name}</h3>
                                            {course.institution.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {course.institution.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Course Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-20">
                                <CardHeader className="p-0">
                                    <img 
                                        src={course.thumbnail || 'https://via.placeholder.com/400x225'} 
                                        alt={course.title}
                                        className="w-full aspect-video object-cover rounded-t-lg"
                                    />
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <p className="text-3xl font-bold text-primary">
                                            {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                                        </p>
                                        {course.is_pro && (
                                            <p className="text-sm text-muted-foreground">Harga sudah termasuk pajak</p>
                                        )}
                                    </div>

                                    {isEnrolled ? (
                                        <Button size="lg" className="w-full" asChild>
                                            <Link href={`/user/courses/${course.id}`}>
                                                Lanjutkan Belajar
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button 
                                            size="lg" 
                                            className="w-full gap-2"
                                            onClick={handleEnroll}
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            {course.is_pro ? 'Daftar Sekarang' : 'Ikuti Kursus Gratis'}
                                        </Button>
                                    )}

                                    <Separator />

                                    <div className="space-y-3">
                                        <h4 className="font-semibold">Kursus ini mencakup:</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-primary" />
                                                <span>{course.total_chapters} bab pembelajaran</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <span>{course.total_materials} materi pembelajaran</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Download className="h-4 w-4 text-primary" />
                                                <span>Materi dapat diunduh</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-primary" />
                                                <span>Sertifikat penyelesaian</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-primary" />
                                                <span>Akses seumur hidup</span>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Tabs */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Tabs defaultValue="curriculum" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
                                    <TabsTrigger value="reviews">Ulasan</TabsTrigger>
                                    <TabsTrigger value="about">Tentang</TabsTrigger>
                                </TabsList>

                                <TabsContent value="curriculum" className="mt-6 space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Materi Pembelajaran</CardTitle>
                                            <CardDescription>
                                                {course.total_chapters} bab • {course.total_materials} materi
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {course.chapters.map((chapter) => (
                                                <div key={chapter.id} className="border rounded-lg">
                                                    <div className="p-4 bg-muted/30">
                                                        <h3 className="font-semibold">
                                                            Bab {chapter.order}: {chapter.title}
                                                        </h3>
                                                        {chapter.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {chapter.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="p-4 space-y-2">
                                                        {chapter.course_materials.map((material) => (
                                                            <div 
                                                                key={material.id}
                                                                className="flex items-center justify-between py-2"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {isEnrolled ? (
                                                                        getMaterialIcon(material.type)
                                                                    ) : (
                                                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                    <span className={!isEnrolled ? 'text-muted-foreground' : ''}>
                                                                        {material.title}
                                                                    </span>
                                                                </div>
                                                                {material.duration && (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {formatDuration(material.duration)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="reviews" className="mt-6 space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Ulasan Siswa</CardTitle>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="text-center">
                                                    <p className="text-4xl font-bold">{course.average_rating.toFixed(1)}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {getRatingStars(Math.round(course.average_rating))}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {course.total_reviews} ulasan
                                                    </p>
                                                </div>
                                                <Separator orientation="vertical" className="h-20" />
                                                <div className="flex-1 space-y-2">
                                                    {[5, 4, 3, 2, 1].map((rating) => {
                                                        const count = course.reviews.filter(r => r.rating === rating).length;
                                                        const percentage = course.total_reviews > 0 
                                                            ? (count / course.total_reviews) * 100 
                                                            : 0;
                                                        return (
                                                            <div key={rating} className="flex items-center gap-2">
                                                                <span className="text-sm w-3">{rating}</span>
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <Progress value={percentage} className="flex-1 h-2" />
                                                                <span className="text-sm text-muted-foreground w-10">
                                                                    {count}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {course.reviews.length > 0 ? (
                                                course.reviews.slice(0, 5).map((review) => (
                                                    <div key={review.id} className="border-t pt-4">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={review.user.profile_photo_url} />
                                                                <AvatarFallback>
                                                                    {review.user.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-semibold">{review.user.name}</h4>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(review.created_at).toLocaleDateString('id-ID')}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    {getRatingStars(review.rating)}
                                                                </div>
                                                                <p className="text-sm mt-2">{review.comment}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-muted-foreground py-8">
                                                    Belum ada ulasan untuk kursus ini
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="about" className="mt-6 space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tentang Kursus</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Deskripsi</h3>
                                                <p className="text-muted-foreground">{course.description}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <h3 className="font-semibold mb-2">Yang Akan Anda Pelajari</h3>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                        <span>Memahami konsep dasar dan fundamental</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                        <span>Praktik langsung dengan studi kasus nyata</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                        <span>Mengerjakan proyek untuk portfolio</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                        <span>Mendapatkan sertifikat kelulusan</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Related Courses */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kursus Terkait</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {relatedCourses.map((relatedCourse) => (
                                        <Link 
                                            key={relatedCourse.id}
                                            href={`/courses/${relatedCourse.id}`}
                                            className="block group"
                                        >
                                            <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                <img 
                                                    src={relatedCourse.thumbnail || 'https://via.placeholder.com/100x60'}
                                                    alt={relatedCourse.title}
                                                    className="w-24 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                                                        {relatedCourse.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs">{relatedCourse.average_rating.toFixed(1)}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {relatedCourse.total_students} siswa
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-primary mt-1">
                                                        {relatedCourse.is_pro 
                                                            ? `Rp ${relatedCourse.price.toLocaleString('id-ID')}` 
                                                            : 'Gratis'}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Login Required Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Diperlukan</DialogTitle>
                        <DialogDescription>
                            {course.is_pro ? 
                                'Silakan login atau daftar terlebih dahulu untuk memesan kursus pro ini.' :
                                'Silakan login atau daftar terlebih dahulu untuk mengikuti kursus gratis ini.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleLoginRedirect}>
                            Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </GuestLayout>
    );
}