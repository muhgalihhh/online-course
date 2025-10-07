import { AnimatedCard, ScrollAnimation } from '@/components/animations';
import { fadeIn, scaleVariants, slideInLeft, slideInRight } from '@/components/animations/variants';
import CustomAlert from '@/components/custom-alert';
import { AppStoreIcon, GooglePlayIcon } from '@/components/social-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import WeatherCard from '@/components/weather-card';
import { useAuth } from '@/hooks/use-auth';
import GuestLayout from '@/layouts/guest-layout';
import { Course } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BookMarked,
    BookOpen,
    CheckCircle,
    ChevronDown,
    Clock,
    CloudRain,
    Code,
    Database,
    Download,
    Globe,
    GraduationCap,
    HelpCircle,
    Layers,
    MessageCircle,
    Palette,
    Shield,
    Smartphone,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    courses_count?: number;
}

interface GalleryItem {
    id: number;
    title: string;
    description: string;
    file_type: 'image' | 'video';
    file_url?: string;
    youtube_thumbnail?: string;
    youtube_embed_url?: string;
    is_youtube_video: boolean;
    is_image: boolean;
    is_video: boolean;
}

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    category: string;
    category_name: string;
}

interface Institution {
    id: number;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    photo_path?: string;
    // Social media links
    tiktok_url?: string;
    instagram_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    whatsapp_url?: string;
    telegram_url?: string;
    linkedin_url?: string;
    // Mobile app links
    ios_app_url?: string;
    android_app_url?: string;
}

interface PageProps {
    topCourses?: Course[];
    galleryItems?: GalleryItem[];
    faqItems?: FaqItem[];
    institution?: Institution;
    categories?: Category[];
    stats?: {
        total_courses: number;
        total_students: number;
        average_rating: number;
    };
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    [key: string]: unknown;
}

export default function Welcome() {
    const { topCourses, galleryItems, faqItems, institution, categories, auth, stats } = usePage<PageProps>().props;
    const { isAuthenticated } = useAuth();
    const [alertState, setAlertState] = useState<{
        open: boolean;
        title: string;
        description: string;
        type: 'info' | 'warning' | 'error' | 'success';
        onAction?: () => void;
    }>({
        open: false,
        title: '',
        description: '',
        type: 'info',
    });
    const [openFaqIds, setOpenFaqIds] = useState<number[]>([]);

    // Array gambar hero untuk rotasi background
    const heroImages = ['/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg'];
    const [currentHeroImage, setCurrentHeroImage] = useState(heroImages[0]);

    // Ganti gambar hero setiap 10 detik
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroImage((prev) => {
                const currentIndex = heroImages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % heroImages.length;
                return heroImages[nextIndex];
            });
        }, 10000); // 10 detik

        return () => clearInterval(interval);
    }, [heroImages]);

    // Function untuk toggle FAQ
    const toggleFaq = (faqId: number) => {
        setOpenFaqIds((prev) => (prev.includes(faqId) ? prev.filter((id) => id !== faqId) : [...prev, faqId]));
    };

    const features = [
        {
            icon: <BookOpen className="h-6 w-6" />,
            title: 'Kursus Berkualitas Tinggi',
            description: 'Akses kursus berkualitas yang dirancang khusus dari dasar hingga advanced dengan materi terlengkap',
        },
        {
            icon: <GraduationCap className="h-6 w-6" />,
            title: 'Kelas Pro & Free',
            description: 'Pilih kelas sesuai kebutuhan, dari materi dasar hingga premium dengan kualitas terjamin',
        },
        {
            icon: <Download className="h-6 w-6" />,
            title: 'Download Materi PDF',
            description: 'Download materi pembelajaran dalam format PDF untuk belajar offline kapan saja',
        },
        {
            icon: <MessageCircle className="h-6 w-6" />,
            title: 'Live Chat Support',
            description: 'Dapatkan bantuan langsung melalui live chat 24/7 untuk semua pertanyaan Anda',
        },
        {
            icon: <CloudRain className="h-6 w-6" />,
            title: 'Widget Cuaca',
            description: 'Informasi cuaca real-time untuk perencanaan kegiatan belajar yang optimal',
        },
        {
            icon: <Globe className="h-6 w-6" />,
            title: 'Akses Seumur Hidup',
            description: 'Bayar sekali untuk akses semua kelas Pro selamanya tanpa biaya tambahan',
        },
    ];

    const statsData = [
        { label: 'Kursus Tersedia', value: `${stats?.total_courses || 0}+`, icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Siswa Aktif', value: `${(stats?.total_students || 0).toLocaleString()}+`, icon: <Users className="h-4 w-4" /> },
        { label: 'Kategori', value: `${categories?.length || 0}+`, icon: <GraduationCap className="h-4 w-4" /> },
        { label: 'Rating Rata-rata', value: `${stats?.average_rating || 0}`, icon: <Star className="h-4 w-4" /> },
    ];

    const handleEnrollCourse = (course: Course) => {
        // Check if user is logged in
        if (!isAuthenticated) {
            setAlertState({
                open: true,
                title: 'Login Diperlukan',
                description: 'Silakan login atau daftar terlebih dahulu untuk mendaftar kursus ini.',
                type: 'warning',
                onAction: () => {
                    router.visit('/login');
                },
            });
            return;
        }

        // Check if user is admin
        if (auth?.user?.role === 'admin') {
            setAlertState({
                open: true,
                title: 'Akses Terbatas',
                description: 'Admin tidak dapat mendaftar kursus. Silakan gunakan akun user untuk mendaftar kursus.',
                type: 'error',
            });
            return;
        }

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
    };

    const benefits = [
        'Akses Seumur Hidup ke semua kursus yang telah dibeli',
        'Download materi PDF untuk belajar offline',
        'Live chat support 24/7 untuk bantuan pembelajaran',
        'Widget cuaca real-time untuk perencanaan belajar',
        'Kelas gratis dan premium berkualitas tinggi',
        'Platform pembelajaran yang mudah digunakan',
    ];

    const getCategoryIcon = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('web') || name.includes('development')) return <Code className="h-5 w-5" />;
        if (name.includes('design') || name.includes('ui')) return <Palette className="h-5 w-5" />;
        if (name.includes('data') || name.includes('database')) return <Database className="h-5 w-5" />;
        if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return <Smartphone className="h-5 w-5" />;
        if (name.includes('devops') || name.includes('cloud')) return <Layers className="h-5 w-5" />;
        if (name.includes('business') || name.includes('marketing')) return <TrendingUp className="h-5 w-5" />;
        return <BookMarked className="h-5 w-5" />;
    };

    const CourseCard = ({ course }: { course: Course }) => (
        <AnimatedCard className="flex h-full flex-col overflow-hidden">
            <Card className="transition-all">
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
                    <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{(course.average_rating || 0).toFixed(1)}</span>
                            <span>({course.total_reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.total_students.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-end">
                            <p className="text-lg font-bold text-primary">
                                {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="hover-gradient-gray flex-1 transition-all duration-200 hover:!text-slate-900 dark:hover:!text-slate-100"
                                asChild
                            >
                                <Link href={`/courses/${course.id}`}>Detail</Link>
                            </Button>
                            {course.is_enrolled ? (
                                <Button size="sm" className="btn-success-gradient flex-1" asChild>
                                    <Link href={`/courses/${course.id}/learn`}>Lanjutkan Belajar</Link>
                                </Button>
                            ) : course.payment_status === 'paid_processing' ? (
                                <Button size="sm" className="btn-warning-gradient flex-1" variant="secondary" disabled>
                                    <Clock className="mr-1 h-3 w-3" />
                                    Sedang Diproses
                                </Button>
                            ) : course.payment_status === 'pending_payment' ? (
                                <Button
                                    size="sm"
                                    className="course-btn-payment flex-1 !text-white hover:!text-white"
                                    variant="outline"
                                    onClick={() => handleEnrollCourse(course)}
                                >
                                    Lanjutkan Pembayaran
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className="course-btn-enroll flex-1 !text-white hover:!text-white"
                                    onClick={() => handleEnrollCourse(course)}
                                >
                                    {course.is_pro ? 'Beli Sekarang' : 'Ikuti Kursus'}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AnimatedCard>
    );

    return (
        <GuestLayout>
            {/* Hero Section with Weather Widget */}
            <section className="relative overflow-hidden py-20">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                    style={{
                        backgroundImage: `url(${currentHeroImage})`,
                    }}
                >
                    {/* Overlay untuk memberikan efek gelap agar teks tetap terbaca */}
                    <div className="gallery-overlay-gradient absolute inset-0"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="grid items-start gap-12 lg:grid-cols-3">
                        {/* Main Hero Content */}
                        <ScrollAnimation variants={slideInLeft} className="space-y-8 lg:col-span-2">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit border-white/30 bg-white/20 text-white">
                                    <Star className="mr-1 h-3 w-3" />
                                    Platform Kursus Online Personal
                                </Badge>
                                {/* Institution Logo */}
                                {(institution?.photo_path || institution?.name) && (
                                    <ScrollAnimation variants={scaleVariants} delay={0.2}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={'/logo.png'}
                                                    alt={`Logo ${institution?.name || 'Platform'}`}
                                                    className="h-24 w-auto rounded-xl bg-white/10 object-contain p-4 shadow-lg ring-1 ring-white/20 backdrop-blur-sm md:h-32"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </ScrollAnimation>
                                )}
                                <ScrollAnimation variants={fadeIn} delay={0.3}>
                                    <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
                                        Tingkatkan Skill dengan <span className="gallery-title-gradient">{institution?.name || 'Pare EduHub'}</span>
                                    </h1>
                                </ScrollAnimation>
                                <ScrollAnimation variants={fadeIn} delay={0.4}>
                                    <p className="text-xl text-gray-100">
                                        Platform pembelajaran online personal yang menyediakan kursus berkualitas tinggi. Dari materi dasar hingga
                                        advanced, semua dirancang khusus untuk pengembangan karir digital Anda.
                                    </p>
                                </ScrollAnimation>
                            </div>

                            <ScrollAnimation variants={slideInLeft} delay={0.5}>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="btn-primary-gradient transform text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105"
                                        asChild
                                    >
                                        <Link href="/register">Mulai Belajar Sekarang</Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="transform border-white/30 bg-white/10 text-base text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20 hover:text-slate-800"
                                        asChild
                                    >
                                        <Link href="/courses">Lihat Semua Kursus</Link>
                                    </Button>
                                </div>
                            </ScrollAnimation>

                            {/* Mobile App Download Buttons */}
                            {(institution?.ios_app_url || institution?.android_app_url) && (
                                <ScrollAnimation variants={fadeIn} delay={0.6}>
                                    <div className="space-y-4">
                                        <p className="text-base font-medium text-gray-200">Download Aplikasi Mobile:</p>
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            {institution?.ios_app_url && (
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="min-w-[140px] border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-slate-800"
                                                    asChild
                                                >
                                                    <a href={institution.ios_app_url} target="_blank" rel="noopener noreferrer">
                                                        <AppStoreIcon className="mr-2 h-5 w-5" />
                                                        App Store
                                                    </a>
                                                </Button>
                                            )}
                                            {institution?.android_app_url && (
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="min-w-[140px] border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-slate-800"
                                                    asChild
                                                >
                                                    <a href={institution.android_app_url} target="_blank" rel="noopener noreferrer">
                                                        <GooglePlayIcon className="mr-2 h-5 w-5" />
                                                        Google Play
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </ScrollAnimation>
                            )}

                            <ScrollAnimation variants={fadeIn} delay={0.7}>
                                <div className="flex items-center gap-8 text-sm text-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <span>100% Terpercaya</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        <span>Akses Cepat</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        <span>Materi PDF</span>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </ScrollAnimation>

                        {/* Weather Widget in Hero */}
                        <ScrollAnimation variants={slideInRight} className="lg:col-span-1">
                            <WeatherCard defaultLocation={institution?.address || 'Pare, Kediri'} />
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            {categories && categories.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold">Kategori Kursus</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Jelajahi berbagai kategori kursus yang tersedia di platform kami
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {categories.slice(0, 8).map((category) => (
                                <Link key={category.id} href={`/courses?category=${category.id}`} className="group">
                                    <Card className="border-0 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                                        <CardContent className="p-6">
                                            <div className="mb-2 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    {getCategoryIcon(category.name)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{category.name}</h3>
                                                    {category.courses_count !== undefined && (
                                                        <p className="text-sm text-muted-foreground">{category.courses_count} Kursus</p>
                                                    )}
                                                </div>
                                            </div>
                                            {category.description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {categories.length > 8 && (
                            <div className="mt-8 text-center">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="hover-gradient-gray transition-all duration-200 hover:!text-slate-900 dark:hover:!text-slate-100"
                                    asChild
                                >
                                    <Link href="/courses">Lihat Semua Kategori</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="relative overflow-hidden py-16">
                {/* Gradient Background */}
                <div className="stats-gradient absolute inset-0"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {statsData.map((stat, index) => (
                            <Card key={index} className="stats-card-gradient transition-all duration-300 hover:scale-105">
                                <CardContent className="p-6 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="stats-icon-gradient flex h-12 w-12 items-center justify-center rounded-lg text-white">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="stats-text-primary text-2xl font-bold">{stat.value}</div>
                                    <div className="stats-text-secondary text-sm">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="title-gradient mb-4 text-3xl font-bold">Fitur Unggulan Platform</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Nikmati berbagai fitur canggih yang dirancang untuk memberikan pengalaman belajar terbaik
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="features-card-gradient border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <CardHeader>
                                    <div className="features-icon-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="title-gradient text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Courses Section */}
            {topCourses && topCourses.length > 0 && (
                <section className="relative overflow-hidden py-16">
                    {/* Subtle gradient background */}
                    <div className="course-section-gradient absolute inset-0"></div>

                    <div className="relative z-10 container mx-auto px-4">
                        <ScrollAnimation variants={fadeIn} className="mb-12 text-center">
                            <h2 className="title-gradient mb-4 text-3xl font-bold">Kursus Terpopuler</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Temukan kursus terbaik dengan rating tinggi dan ulasan positif dari ribuan siswa
                            </p>
                        </ScrollAnimation>

                        <ScrollAnimation variants={fadeIn} delay={0.2}>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {topCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation variants={fadeIn} delay={0.3} className="mt-8 text-center">
                            <Button
                                size="lg"
                                className="btn-secondary-gradient transform font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105"
                                asChild
                            >
                                <Link href="/courses">Lihat Semua Kursus</Link>
                            </Button>
                        </ScrollAnimation>
                    </div>
                </section>
            )}

            {/* Gallery Section */}
            {galleryItems && galleryItems.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <ScrollAnimation variants={fadeIn} className="mb-12 text-center">
                            <h2 className="title-gradient mb-4 text-3xl font-bold">Galeri Kami</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Lihat momen berharga dan aktivitas pembelajaran di {institution?.name || 'Pare EduHub'}
                            </p>
                        </ScrollAnimation>

                        <ScrollAnimation variants={fadeIn} delay={0.2}>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {galleryItems.map((item) => (
                                    <Card key={item.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                                        <div className="relative aspect-video overflow-hidden">
                                            {item.is_image && item.file_url && (
                                                <img
                                                    src={item.file_url}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            )}
                                            {item.is_youtube_video && item.youtube_thumbnail && (
                                                <div className="relative h-full w-full">
                                                    <img
                                                        src={item.youtube_thumbnail}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all duration-300 group-hover:bg-black/20">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 transition-transform duration-300 group-hover:scale-110">
                                                            <div className="ml-1 h-0 w-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-red-600"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {item.is_video && !item.is_youtube_video && item.file_url && (
                                                <div className="relative h-full w-full bg-gray-100">
                                                    <video className="h-full w-full object-cover" preload="metadata">
                                                        <source src={item.file_url} />
                                                    </video>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                                                            <div className="ml-1 h-0 w-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-700"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Type badge */}
                                            <div className="absolute top-3 right-3">
                                                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                                                    {item.is_image ? (
                                                        <>
                                                            <Palette className="mr-1 h-3 w-3" />
                                                            Foto
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="mr-1 flex h-3 w-3 items-center justify-center">
                                                                <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-current"></div>
                                                            </div>
                                                            Video
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardContent className="p-6">
                                            <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                                                {item.title}
                                            </h3>
                                            <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation variants={fadeIn} delay={0.3} className="mt-8 text-center">
                            <Button
                                variant="outline"
                                size="lg"
                                className="hover-gradient-gray transition-all duration-200 hover:!text-slate-900 dark:hover:!text-slate-100"
                                asChild
                            >
                                <Link href="/galeri">Lihat Semua Galeri</Link>
                            </Button>
                        </ScrollAnimation>
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {faqItems && faqItems.length > 0 && (
                <section className="bg-muted/30 py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="title-gradient mb-4 text-3xl font-bold">Pertanyaan yang Sering Diajukan</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Temukan jawaban untuk pertanyaan umum seputar pembelajaran di {institution?.name || 'Pare EduHub'}
                            </p>
                        </div>

                        <div className="mx-auto max-w-3xl space-y-4">
                            {faqItems.map((faq) => (
                                <Collapsible key={faq.id} open={openFaqIds.includes(faq.id)} onOpenChange={() => toggleFaq(faq.id)}>
                                    <CollapsibleTrigger asChild>
                                        <Card className="cursor-pointer transition-all duration-300 hover:shadow-md">
                                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                        <HelpCircle className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-left text-base font-semibold text-foreground">{faq.question}</h3>
                                                        <Badge variant="outline" className="mt-1 text-xs">
                                                            {faq.category_name}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                                                        openFaqIds.includes(faq.id) ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </CardHeader>
                                        </Card>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Card className="mt-2 border-l-4 border-l-primary">
                                            <CardContent className="pt-4">
                                                <div
                                                    className="prose prose-sm max-w-none text-muted-foreground"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                            </CardContent>
                                        </Card>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <Button
                                variant="outline"
                                size="lg"
                                className="hover-gradient-gray transition-all duration-200 hover:!text-slate-900 dark:hover:!text-slate-100"
                                asChild
                            >
                                <Link href="/faq">Lihat Semua FAQ</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Benefits Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Mengapa Memilih {institution?.name || 'Pare EduHub'}?</h2>
                            <div className="space-y-4">
                                {institution?.description && <p className="text-lg text-muted-foreground">{institution.description}</p>}

                                <div className="grid gap-3">
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">Total Kursus Tersedia</h3>
                                        <p className="text-2xl font-bold">{stats?.total_courses || 0} Kursus</p>
                                        <p className="text-sm text-muted-foreground">Dari berbagai kategori pembelajaran</p>
                                    </div>

                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">Siswa Aktif</h3>
                                        <p className="text-2xl font-bold">{(stats?.total_students || 0).toLocaleString()} Siswa</p>
                                        <p className="text-sm text-muted-foreground">Bergabung dalam komunitas belajar</p>
                                    </div>

                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">Rating Platform</h3>
                                        <p className="text-2xl font-bold">{stats?.average_rating || 0} ⭐</p>
                                        <p className="text-sm text-muted-foreground">Dari ulasan siswa</p>
                                    </div>
                                </div>

                                {institution?.phone && (
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <h4 className="mb-2 font-semibold">Kontak Kami</h4>
                                        <p className="text-sm text-muted-foreground">📞 {institution.phone}</p>
                                        {institution.email && <p className="text-sm text-muted-foreground">✉️ {institution.email}</p>}
                                        {institution.address && <p className="text-sm text-muted-foreground">📍 {institution.address}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Keunggulan Platform Kami:</h3>
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-muted-foreground">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Button size="lg" asChild>
                                    <Link href="/register">Bergabung Sekarang</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <Card className="faq-card-gradient border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h3 className="title-gradient mb-4 text-center text-xl font-bold">Kategori Kursus Populer</h3>
                                    <div className="space-y-4">
                                        {categories &&
                                            categories.slice(0, 3).map((category) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur"
                                                >
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                        {getCategoryIcon(category.name)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{category.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{category.courses_count || 0} Kursus Tersedia</p>
                                                        {category.description && (
                                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{category.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                        {(!categories || categories.length === 0) && (
                                            <>
                                                <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                        <Code className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">Web Development</h4>
                                                        <p className="text-sm text-muted-foreground">Kursus Populer</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                        <Palette className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">UI/UX Design</h4>
                                                        <p className="text-sm text-muted-foreground">Kursus Populer</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                        <Database className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">Data Science</h4>
                                                        <p className="text-sm text-muted-foreground">Kursus Populer</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-16">
                {/* Gradient Background */}
                <div className="cta-gradient absolute inset-0"></div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-white drop-shadow-lg">Siap Memulai Perjalanan Belajar?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-white drop-shadow-md">
                        Bergabunglah dengan ribuan siswa yang telah merasakan manfaat platform pembelajaran kami
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="btn-primary-gradient transform border-0 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105"
                            asChild
                        >
                            <Link href="/register">Daftar Sekarang</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="transform border-white/80 bg-white/10 text-base text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:text-slate-800"
                            asChild
                        >
                            <Link href="/login">Masuk</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Custom Alert Dialog */}
            <CustomAlert
                open={alertState.open}
                onClose={() => setAlertState({ ...alertState, open: false })}
                title={alertState.title}
                description={alertState.description}
                type={alertState.type}
                onAction={alertState.onAction}
            />
        </GuestLayout>
    );
}
