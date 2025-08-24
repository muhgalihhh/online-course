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
    CheckCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Welcome() {
    const features = [
        {
            icon: <BookOpen className="h-6 w-6" />,
            title: "Katalog Lembaga",
            description: "Akses ratusan lembaga pendidikan berkualitas dengan rating dan ulasan terpercaya"
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
            title: "Integrasi Tiket.com",
            description: "Booking penginapan langsung melalui platform untuk peserta dari luar kota"
        }
    ];

    const stats = [
        { label: "Lembaga Terdaftar", value: "100+", icon: <GraduationCap className="h-4 w-4" /> },
        { label: "Kursus Tersedia", value: "500+", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Peserta Aktif", value: "10K+", icon: <Users className="h-4 w-4" /> },
        { label: "Rating Rata-rata", value: "4.8", icon: <Star className="h-4 w-4" /> }
    ];

    const topInstitutions = [
        {
            id: 1,
            name: "Lembaga Bahasa Inggris Pare",
            phone: "+62 812-3456-7890",
            email: "info@pareenglish.com",
            address: "Jl. Brawijaya No. 123, Pare, Kediri, Jawa Timur",
            website: "https://pareenglish.com",
            rating: 4.9,
            reviews: 1250,
            students: 2500,
            courses: 15,
            description: "Lembaga bahasa Inggris terpercaya dengan metode pembelajaran yang efektif dan pengajar berpengalaman.",
            category: "Bahasa Inggris",
            location: "Pare, Kediri"
        },
        {
            id: 2,
            name: "Kampung Inggris",
            phone: "+62 812-3456-7891",
            email: "info@kampunginggris.com",
            address: "Jl. Ahmad Yani No. 45, Pare, Kediri, Jawa Timur",
            website: "https://kampunginggris.com",
            rating: 4.8,
            reviews: 2100,
            students: 3000,
            courses: 20,
            description: "Kampung Inggris terkenal dengan metode immersion yang membuat siswa cepat beradaptasi dengan bahasa Inggris.",
            category: "Bahasa Inggris",
            location: "Pare, Kediri"
        },
        {
            id: 3,
            name: "English Village",
            phone: "+62 812-3456-7892",
            email: "info@englishvillage.com",
            address: "Jl. Sudirman No. 67, Pare, Kediri, Jawa Timur",
            website: "https://englishvillage.com",
            rating: 4.7,
            reviews: 980,
            students: 1800,
            courses: 12,
            description: "English Village menawarkan lingkungan belajar yang nyaman dengan fasilitas modern dan pengajar native speaker.",
            category: "Bahasa Inggris",
            location: "Pare, Kediri"
        }
    ];

    const benefits = [
        "Akses ke ratusan lembaga pendidikan berkualitas",
        "Kelas gratis dan premium dengan sertifikasi",
        "Download materi PDF untuk belajar offline",
        "Live chat support 24/7",
        "Widget cuaca real-time",
        "Integrasi booking penginapan"
    ];

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
                                    Platform LMS Terpercaya
                                </Badge>
                                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                                    Belajar Online dengan{' '}
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        Lembaga Terbaik
                                    </span>
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    Platform pembelajaran online yang menghubungkan Anda dengan ratusan lembaga pendidikan berkualitas. 
                                    Akses ribuan kursus dari lembaga terpercaya di seluruh Indonesia.
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="text-base">
                                    <Link href="/register">Mulai Belajar Sekarang</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="text-base">
                                    <Link href="/katalog-lembaga">Lihat Katalog</Link>
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
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Lembaga Bahasa Inggris Pare</h3>
                                                <p className="text-sm text-muted-foreground">Rating: 4.9 ⭐</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Kampung Inggris</h3>
                                                <p className="text-sm text-muted-foreground">Rating: 4.8 ⭐</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg bg-background/80 p-4 backdrop-blur">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">English Village</h3>
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
                                Platform pembelajaran online terdepan yang menghubungkan lembaga pendidikan dengan peserta didik. 
                                Dapatkan akses ke ribuan kursus berkualitas dari lembaga terpercaya.
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

            {/* Top Institutions Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Lembaga Terpopuler</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Temukan lembaga pendidikan terbaik dengan rating tinggi dan ulasan positif
                        </p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {topInstitutions.map((institution) => (
                            <InstitutionCard 
                                key={institution.id} 
                                institution={institution} 
                                showDetails={true}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Siap Memulai Perjalanan Belajar?</h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        Bergabunglah dengan ribuan peserta yang telah merasakan manfaat platform pembelajaran kami
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
