import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import WeatherWidget from '@/components/weather-widget';
import LiveChatWidget from '@/components/live-chat-widget';
import InstitutionCard from '@/components/institution-card';
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
    Smartphone
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Welcome() {
    const features = [
        {
            icon: <BookOpen className="h-6 w-6" />,
            title: "Katalog Kursus Lengkap",
            description: "Akses ratusan kursus berkualitas dari dasar hingga advanced dengan sertifikasi resmi"
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
        { label: "Kategori", value: "15+", icon: <GraduationCap className="h-4 w-4" /> },
        { label: "Rating Rata-rata", value: "4.9", icon: <Star className="h-4 w-4" /> }
    ];

    const topCourses = [
        {
            id: 1,
            title: "Full-Stack Laravel & React Mastery",
            category: "Web Development",
            thumbnail: "https://via.placeholder.com/300x180",
            rating: 4.9,
            reviews: 1250,
            students: 2500,
            price: 750000,
            isPro: true,
            description: "Bangun aplikasi web modern dari awal hingga deployment dengan teknologi terkini.",
            instructor: "Ahmad Rizki",
            duration: "40 jam"
        },
        {
            id: 2,
            title: "UI/UX Design for Modern Apps",
            category: "Design",
            thumbnail: "https://via.placeholder.com/300x180",
            rating: 4.8,
            reviews: 2100,
            students: 3000,
            price: 550000,
            isPro: true,
            description: "Pelajari prinsip desain antarmuka yang intuitif dan menarik untuk aplikasi modern.",
            instructor: "Sarah Wijaya",
            duration: "35 jam"
        },
        {
            id: 3,
            title: "Advanced DevOps with Kubernetes",
            category: "DevOps",
            thumbnail: "https://via.placeholder.com/300x180",
            rating: 4.7,
            reviews: 980,
            students: 1800,
            price: 850000,
            isPro: true,
            description: "Orkestrasi dan skalabilitas aplikasi tingkat lanjut dengan teknologi container.",
            instructor: "Budi Santoso",
            duration: "45 jam"
        }
    ];

    const benefits = [
        "Akses ke ratusan kursus berkualitas dari dasar hingga advanced",
        "Kelas gratis dan premium dengan sertifikasi resmi",
        "Download materi PDF untuk belajar offline",
        "Live chat support 24/7",
        "Widget cuaca real-time",
        "Bayar sekali untuk akses semua kelas Pro selamanya"
    ];

    const CourseCard = ({ course }: { course: any }) => (
        <Card className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="p-0">
                <img src={course.thumbnail} alt={course.title} className="aspect-[16/9] w-full object-cover" />
                <div className="absolute top-2 right-2">
                    <Badge variant={course.isPro ? "default" : "secondary"}>
                        {course.isPro ? "Pro" : "Free"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <Badge variant="outline" className="mb-2">{course.category}</Badge>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                        <span>({course.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        <p>Oleh: {course.instructor}</p>
                        <p>{course.duration}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                            {course.isPro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit">
                                    <Star className="mr-1 h-3 w-3" />
                                    Platform Kursus Online Terpercaya
                                </Badge>
                                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                                    Tingkatkan Skill dengan{' '}
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        Pare EduHub
                                    </span>
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    Platform pembelajaran online terdepan yang menyediakan ratusan kursus berkualitas. 
                                    Dari materi dasar hingga advanced, semua tersedia untuk karir digital Anda.
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="text-base">
                                    <Link href="/register">Mulai Belajar Sekarang</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="text-base">
                                    <Link href="/courses">Lihat Katalog Kursus</Link>
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

            {/* Stats Section */}
            <section className="py-16">
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
            <section className="py-16 bg-muted/30">
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

            {/* Benefits Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Mengapa Memilih Pare EduHub?</h2>
                            <p className="text-muted-foreground text-lg">
                                Platform pembelajaran online terdepan yang menyediakan kursus berkualitas untuk semua level. 
                                Dapatkan akses ke ratusan kursus dari dasar hingga advanced.
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
                                <Button size="lg">
                                    <Link href="/register">Bergabung Sekarang</Link>
                                </Button>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <WeatherWidget />
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Courses Section */}
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
                        <Button size="lg" variant="secondary" className="text-base">
                            <Link href="/register">Daftar Sekarang</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                            <Link href="/login">Masuk</Link>
                        </Button>
                    </div>
                </div>
            </section>
            
            {/* Live Chat Widget */}
            <LiveChatWidget />
        </GuestLayout>
    );
}
