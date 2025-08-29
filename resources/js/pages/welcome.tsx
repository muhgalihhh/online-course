import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import WeatherWidget from '@/components/weather-widget';
import LiveChatWidget from '@/components/live-chat-widget';
import CustomAlert from '@/components/custom-alert';
import { 
    BookOpen, 
    GraduationCap, 
    Star, 
    Users, 
    Download, 
    MessageCircle, 
    CloudRain,
    Award,
    Shield,
    Zap,
    Globe,
    MapPin,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    PlayCircle,
    Code,
    Palette,
    Database,
    Smartphone,
    Layers,
    TrendingUp,
    BookMarked
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    courses_count?: number;
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_pro: boolean;
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
}

interface PageProps {
    topCourses?: Course[];
    institution?: Institution;
    categories?: Category[];
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function Welcome() {
    const { topCourses, institution, categories, auth } = usePage<PageProps>().props;
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
        type: 'info'
    });

    const features = [
        {
            icon: <BookOpen className="h-6 w-6" />,
            title: "Kursus Berkualitas Tinggi",
            description: "Akses kursus berkualitas yang dirancang khusus dari dasar hingga advanced dengan sertifikasi resmi"
        },
        {
            icon: <GraduationCap className="h-6 w-6" />,
            title: "Kelas Pro & Free",
            description: "Pilih kelas sesuai kebutuhan, dari materi dasar hingga premium dengan sertifikasi"
        },
        {
            icon: <Download className="h-6 w-6" />,
            title: "Download Materi PDF",
            description: "Download materi pembelajaran dalam format PDF untuk belajar offline"
        },
        {
            icon: <MessageCircle className="h-6 w-6" />,
            title: "Live Chat Support",
            description: "Dapatkan bantuan langsung melalui live chat 24/7"
        },
        {
            icon: <CloudRain className="h-6 w-6" />,
            title: "Widget Cuaca",
            description: "Informasi cuaca real-time untuk perencanaan kegiatan belajar"
        },
        {
            icon: <Globe className="h-6 w-6" />,
            title: "Akses Seumur Hidup",
            description: "Bayar sekali untuk akses semua kelas Pro selamanya"
        }
    ];

    const stats = [
        { label: "Kursus Tersedia", value: "500+", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Siswa Aktif", value: "50K+", icon: <Users className="h-4 w-4" /> },
        { label: "Kategori", value: `${categories?.length || 15}+`, icon: <GraduationCap className="h-4 w-4" /> },
        { label: "Rating Rata-rata", value: "4.9", icon: <Star className="h-4 w-4" /> }
    ];

    const handleEnrollCourse = (courseId: number, isPro: boolean) => {
        // Check if user is logged in
        if (!isAuthenticated) {
            setAlertState({
                open: true,
                title: 'Login Diperlukan',
                description: 'Silakan login atau daftar terlebih dahulu untuk mendaftar kursus ini.',
                type: 'warning',
                onAction: () => {
                    router.visit('/login');
                }
            });
            return;
        }

        // Check if user is admin
        if (auth?.user?.role === 'admin') {
            setAlertState({
                open: true,
                title: 'Akses Terbatas',
                description: 'Admin tidak dapat mendaftar kursus. Silakan gunakan akun user untuk mendaftar kursus.',
                type: 'error'
            });
            return;
        }

        // Navigate to enrollment/payment page
        router.visit(`/courses/${courseId}/enroll`);
    };

    const benefits = [
        "Akses ke kursus berkualitas tinggi yang dirancang khusus",
        "Kelas gratis dan premium dengan sertifikasi resmi",
        "Download materi PDF untuk belajar offline",
        "Live chat support 24/7",
        "Widget cuaca real-time",
        "Bayar sekali untuk akses semua kelas Pro selamanya"
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
                            className="flex-1"
                            asChild
                        >
                            <Link href={`/courses/${course.id}`}>
                                Detail
                            </Link>
                        </Button>
                        <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEnrollCourse(course.id, course.is_pro)}
                        >
                            {course.is_pro ? 'Pesan' : 'Ikuti'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <GuestLayout>
            {/* Hero Section with Weather Widget */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-start gap-12 lg:grid-cols-3">
                        {/* Main Hero Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit">
                                    <Star className="mr-1 h-3 w-3" />
                                    Platform Kursus Online Personal
                                </Badge>
                                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                                    Tingkatkan Skill dengan{' '}
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        {institution?.name || 'Pare EduHub'}
                                    </span>
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    Platform pembelajaran online personal yang menyediakan kursus berkualitas tinggi. 
                                    Dari materi dasar hingga advanced, semua dirancang khusus untuk pengembangan karir digital Anda.
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="text-base" asChild>
                                    <Link href="/register">Mulai Belajar Sekarang</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="text-base" asChild>
                                    <Link href="/courses">Lihat Semua Kursus</Link>
                                </Button>
                            </div>

                            <div className="flex items-center gap-8 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span>100% Terpercaya</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    <span>Akses Cepat</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    <span>Sertifikasi</span>
                                </div>
                            </div>
                        </div>

                        {/* Weather Widget in Hero */}
                        <div className="lg:col-span-1">
                            <WeatherWidget />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            {categories && categories.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Kategori Kursus</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Jelajahi berbagai kategori kursus yang tersedia di platform kami
                            </p>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {categories.slice(0, 8).map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/courses?category=${category.id}`}
                                    className="group"
                                >
                                    <Card className="border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    {getCategoryIcon(category.name)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{category.name}</h3>
                                                    {category.courses_count !== undefined && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {category.courses_count} Kursus
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                                    {category.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        
                        {categories.length > 8 && (
                            <div className="text-center mt-8">
                                <Button variant="outline" size="lg" asChild>
                                    <Link href="/courses">
                                        Lihat Semua Kategori
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="border-0 shadow-sm">
                                <CardContent className="p-6 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Fitur Unggulan Platform</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Nikmati berbagai fitur canggih yang dirancang untuk memberikan pengalaman belajar terbaik
                        </p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Courses Section */}
            {topCourses && topCourses.length > 0 && (
                <section className="py-16 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Kursus Terpopuler</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Temukan kursus terbaik dengan rating tinggi dan ulasan positif dari ribuan siswa
                            </p>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {topCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                        
                        <div className="text-center mt-8">
                            <Button size="lg" asChild>
                                <Link href="/courses">
                                    Lihat Semua Kursus
                                </Link>
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
                            <p className="text-muted-foreground text-lg">
                                Platform pembelajaran online personal yang menyediakan kursus berkualitas tinggi untuk semua level. 
                                Dapatkan akses ke kursus-kursus pilihan dari dasar hingga advanced.
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-primary" />
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
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/20 to-primary/5">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <Code className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Full-Stack Development</h3>
                                                <p className="text-sm text-muted-foreground">Rating: 4.9 ⭐</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <Palette className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">UI/UX Design</h3>
                                                <p className="text-sm text-muted-foreground">Rating: 4.8 ⭐</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <Database className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">DevOps & Cloud</h3>
                                                <p className="text-sm text-muted-foreground">Rating: 4.7 ⭐</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Siap Memulai Perjalanan Belajar?</h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        Bergabunglah dengan ribuan siswa yang telah merasakan manfaat platform pembelajaran kami
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row justify-center">
                        <Button size="lg" variant="secondary" className="text-base" asChild>
                            <Link href="/register">Daftar Sekarang</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
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
            
            {/* Live Chat Widget */}
            <LiveChatWidget />
        </GuestLayout>
    );
}