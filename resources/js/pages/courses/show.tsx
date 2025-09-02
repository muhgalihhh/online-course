import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import GuestLayout from '@/layouts/guest-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart,
    BookOpen,
    Building,
    ChevronRight,
    Clock,
    Download,
    FileText,
    Globe,
    Lock,
    PlayCircle,
    ShoppingCart,
    Star,
    Users,
} from 'lucide-react';
import { useState } from 'react';

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
    [key: string]: unknown;
}

export default function CourseShow() {
    const { course, isEnrolled, relatedCourses } = usePage<PageProps>().props;
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        comment: '',
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleEnroll = () => {
        if (!isAuthenticated) {
            setShowLoginDialog(true);
        } else {
            // For free courses, directly enroll without payment
            if (!course.is_pro && course.price === 0) {
                router.post(
                    `/courses/${course.id}/enroll-free`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => {
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

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !isEnrolled) {
            toast({
                title: 'Akses Ditolak',
                description: 'Silakan login dan daftar kursus terlebih dahulu untuk memberikan review.',
                variant: 'destructive',
            });
            return;
        }

        if (reviewForm.rating === 0) {
            toast({
                title: 'Rating Diperlukan',
                description: 'Silakan pilih rating sebelum mengirim review.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmittingReview(true);
        try {
            const response = await fetch(`/reviews/course/${course.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(reviewForm),
            });

            if (response.ok) {
                toast({
                    title: 'Review Terkirim',
                    description: 'Review Anda telah berhasil dikirim dan sedang menunggu persetujuan admin.',
                });
                setReviewForm({ rating: 0, comment: '' });
                window.location.reload();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Terjadi kesalahan saat mengirim review.',
                    variant: 'destructive',
                });
            }
        } catch (_error) {
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat mengirim review.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmittingReview(false);
        }
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
            stars.push(<Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />);
        }
        return stars;
    };

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-8">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-primary">
                            Beranda
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/courses" className="hover:text-primary">
                            Kursus
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href={`/courses?category=${course.category.id}`} className="hover:text-primary">
                            {course.category.name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground">{course.title}</span>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Badge variant="outline">{course.category.name}</Badge>
                                    <Badge variant={course.is_pro ? 'default' : 'secondary'}>{course.is_pro ? 'Kelas Pro' : 'Kelas Gratis'}</Badge>
                                </div>
                                <h1 className="mb-4 text-3xl font-bold">{course.title}</h1>
                                <p className="mb-6 text-lg text-muted-foreground">{course.description}</p>

                                {/* Stats */}
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">{getRatingStars(Math.round(course.average_rating || 0))}</div>
                                        <span className="font-semibold">{(course.average_rating || 0).toFixed(1)}</span>
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
                                            <h3 className="text-lg font-semibold">{course.institution.name}</h3>
                                            {course.institution.description && (
                                                <p className="mt-1 text-sm text-muted-foreground">{course.institution.description}</p>
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
                                        className="aspect-video w-full rounded-t-lg object-cover"
                                    />
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div>
                                        <p className="text-3xl font-bold text-primary">
                                            {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                                        </p>
                                        {course.is_pro && <p className="text-sm text-muted-foreground">Harga sudah termasuk pajak</p>}
                                        {isEnrolled && <p className="mt-2 text-sm text-green-600">Anda sudah terdaftar di kursus ini</p>}
                                    </div>

                                    {isEnrolled ? (
                                        <Button size="lg" className="w-full" asChild>
                                            <Link href={`/courses/${course.id}/learn`}>Lanjutkan Belajar</Link>
                                        </Button>
                                    ) : (
                                        <Button size="lg" className="w-full gap-2" onClick={handleEnroll}>
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
                                                <div key={chapter.id} className="rounded-lg border">
                                                    <div className="bg-muted/30 p-4">
                                                        <h3 className="font-semibold">
                                                            Bab {chapter.order}: {chapter.title}
                                                        </h3>
                                                        {chapter.description && (
                                                            <p className="mt-1 text-sm text-muted-foreground">{chapter.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 p-4">
                                                        {chapter.course_materials.map((material) => (
                                                            <div key={material.id} className="flex items-center justify-between py-2">
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
                                            <div className="mt-4 flex items-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-4xl font-bold">{(course.average_rating || 0).toFixed(1)}</p>
                                                    <div className="mt-1 flex items-center gap-1">
                                                        {getRatingStars(Math.round(course.average_rating || 0))}
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">{course.total_reviews} ulasan</p>
                                                </div>
                                                <Separator orientation="vertical" className="h-20" />
                                                <div className="flex-1 space-y-2">
                                                    {[5, 4, 3, 2, 1].map((rating) => {
                                                        const count = course.reviews.filter((r) => r.rating === rating).length;
                                                        const percentage = course.total_reviews > 0 ? (count / course.total_reviews) * 100 : 0;
                                                        return (
                                                            <div key={rating} className="flex items-center gap-2">
                                                                <span className="w-3 text-sm">{rating}</span>
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <Progress value={percentage} className="h-2 flex-1" />
                                                                <span className="w-10 text-sm text-muted-foreground">{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Review Form for Enrolled Users */}
                                            {isAuthenticated && isEnrolled && (
                                                <Card className="bg-muted/30">
                                                    <CardHeader>
                                                        <CardTitle className="text-lg">Berikan Review Anda</CardTitle>
                                                        <CardDescription>Bagikan pengalaman Anda dengan kursus ini</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="rating">Rating</Label>
                                                                <div className="mt-2 flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <button
                                                                            key={star}
                                                                            type="button"
                                                                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                                                                            onMouseEnter={() => setHoverRating(star)}
                                                                            onMouseLeave={() => setHoverRating(0)}
                                                                            className="rounded-sm transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                                                        >
                                                                            <Star
                                                                                className={`h-8 w-8 transition-colors duration-200 ${
                                                                                    star <= (hoverRating || reviewForm.rating)
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-gray-300 hover:text-yellow-200'
                                                                                }`}
                                                                            />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <p className="mt-1 text-sm text-gray-600">
                                                                    {reviewForm.rating > 0
                                                                        ? `Rating: ${reviewForm.rating} dari 5 bintang`
                                                                        : 'Pilih rating Anda'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="comment">Komentar</Label>
                                                                <Textarea
                                                                    id="comment"
                                                                    placeholder="Tulis review Anda tentang kursus ini..."
                                                                    value={reviewForm.comment}
                                                                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                                                    required
                                                                    className="mt-2"
                                                                    rows={4}
                                                                />
                                                            </div>
                                                            <Button type="submit" disabled={isSubmittingReview} className="w-full">
                                                                {isSubmittingReview ? 'Mengirim...' : 'Kirim Review'}
                                                            </Button>
                                                        </form>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Existing Reviews */}
                                            {course.reviews.length > 0 ? (
                                                course.reviews.slice(0, 5).map((review) => (
                                                    <div key={review.id} className="border-t pt-4">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={review.user.profile_photo_url} />
                                                                <AvatarFallback>{review.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-semibold">{review.user.name}</h4>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(review.created_at).toLocaleDateString('id-ID')}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-1">{getRatingStars(review.rating)}</div>
                                                                <p className="mt-2 text-sm">{review.comment}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="py-8 text-center text-muted-foreground">Belum ada ulasan untuk kursus ini</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="about" className="mt-6 space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tentang Kursus</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h3 className="mb-2 font-semibold">Deskripsi</h3>
                                                <p className="text-muted-foreground">{course.description}</p>
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
                                        <Link key={relatedCourse.id} href={`/courses/${relatedCourse.id}`} className="group block">
                                            <div className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                                                <img
                                                    src={relatedCourse.thumbnail || 'https://via.placeholder.com/100x60'}
                                                    alt={relatedCourse.title}
                                                    className="h-16 w-24 rounded object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                                                        {relatedCourse.title}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs">{(relatedCourse.average_rating || 0).toFixed(1)}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{relatedCourse.total_students} siswa</span>
                                                    </div>
                                                    <p className="mt-1 text-sm font-semibold text-primary">
                                                        {relatedCourse.is_pro ? `Rp ${relatedCourse.price.toLocaleString('id-ID')}` : 'Gratis'}
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
                            {course.is_pro
                                ? 'Silakan login atau daftar terlebih dahulu untuk memesan kursus pro ini.'
                                : 'Silakan login atau daftar terlebih dahulu untuk mengikuti kursus gratis ini.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleLoginRedirect}>Login</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </GuestLayout>
    );
}
