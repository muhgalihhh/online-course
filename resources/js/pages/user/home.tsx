import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import UserLayout from '@/layouts/user-layout'; // Asumsikan Anda memiliki layout ini
import { ArrowRight, Award, BookOpen, CloudSun, LifeBuoy, MessageSquare, PlayCircle, ShoppingCart, Star, Users, Zap } from 'lucide-react';
import React from 'react';

// --- Tipe Data (sesuai migrasi) ---
interface Course {
    id: number;
    title: string;
    category: string;
    thumbnail: string;
    rating: number;
    students: number;
    price: number;
    isPro: boolean;
    description: string;
}

interface Review {
    id: number;
    name: string;
    role: string;
    avatar: string;
    comment: string;
    rating: number;
}

const Home: React.FC = () => {
    // --- Data Statis (Contoh) ---
    const NAMA_LEMBAGA = 'Akademi Koding Pro'; // Ganti dengan nama lembaga Anda

    const proCourses: Course[] = [
        {
            id: 1,
            title: 'Full-Stack Laravel & React Mastery',
            category: 'Web Development',
            thumbnail: 'https://via.placeholder.com/300x180',
            rating: 4.9,
            students: 1342,
            price: 750000,
            isPro: true,
            description: 'Bangun aplikasi web modern dari awal hingga deployment.',
        },
        {
            id: 2,
            title: 'UI/UX Design for Modern Apps',
            category: 'Design',
            thumbnail: 'https://via.placeholder.com/300x180',
            rating: 4.8,
            students: 876,
            price: 550000,
            isPro: true,
            description: 'Pelajari prinsip desain antarmuka yang intuitif dan menarik.',
        },
        {
            id: 5,
            title: 'Advanced DevOps with Kubernetes',
            category: 'DevOps',
            thumbnail: 'https://via.placeholder.com/300x180',
            rating: 4.9,
            students: 950,
            price: 850000,
            isPro: true,
            description: 'Orkestrasi dan skalabilitas aplikasi tingkat lanjut.',
        },
    ];

    const freeCourses: Course[] = [
        {
            id: 3,
            title: 'Dasar-Dasar HTML & CSS',
            category: 'Web Development',
            thumbnail: 'https://via.placeholder.com/300x180',
            rating: 4.7,
            students: 12503,
            price: 0,
            isPro: false,
            description: 'Pengenalan fundamental untuk memulai karir web development.',
        },
        {
            id: 4,
            title: 'Pengenalan Copywriting',
            category: 'Marketing',
            thumbnail: 'https://via.placeholder.com/300x180',
            rating: 4.6,
            students: 9870,
            price: 0,
            isPro: false,
            description: 'Pelajari cara menulis teks iklan yang menjual dan efektif.',
        },
        {
            id: 6,
            title: 'Fundamental Git & GitHub',
            category: 'Tools',
            thumbnail: 'https://via.placeholder.com/300x180',
            rating: 4.8,
            students: 15000,
            price: 0,
            isPro: false,
            description: 'Manajemen versi kode yang wajib dikuasai setiap developer.',
        },
    ];

    const testimonials: Review[] = [
        {
            id: 1,
            name: 'Budi Santoso',
            role: 'Full-Stack Developer',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            comment: `Materi di ${NAMA_LEMBAGA} sangat terstruktur dan mudah diikuti. Saya berhasil mendapatkan pekerjaan impian saya setelah lulus dari sini!`,
            rating: 5,
        },
        {
            id: 2,
            name: 'Citra Lestari',
            role: 'UI/UX Designer',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            comment: 'Kurikulumnya sangat relevan dengan industri saat ini. Mentornya juga sangat membantu dan responsif. Sangat direkomendasikan!',
            rating: 5,
        },
        {
            id: 3,
            name: 'Doni Firmansyah',
            role: 'Mahasiswa IT',
            avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
            comment: 'Kelas gratisnya saja sudah sangat bermanfaat, apalagi kelas Pro-nya. Investasi terbaik untuk belajar skill digital.',
            rating: 5,
        },
    ];

    const faqs = [
        {
            q: 'Apa yang saya dapatkan jika membeli kelas Pro?',
            a: 'Dengan sekali bayar, Anda mendapatkan akses seumur hidup ke SEMUA kelas Pro yang ada saat ini dan yang akan datang, materi PDF, studi kasus, grup komunitas eksklusif, dan sertifikat kelulusan.',
        },
        {
            q: 'Apakah ada jaminan uang kembali?',
            a: 'Tentu. Kami memberikan jaminan kepuasan 100% uang kembali dalam 7 hari pertama jika Anda merasa materi kami tidak sesuai dengan ekspektasi Anda.',
        },
        {
            q: 'Bagaimana metode pembayarannya?',
            a: 'Kami menerima pembayaran melalui QRIS yang didukung oleh Midtrans, sehingga Anda bisa membayar dengan mudah melalui berbagai e-wallet dan mobile banking.',
        },
        {
            q: 'Apakah saya akan mendapat sertifikat?',
            a: 'Ya, setiap siswa yang berhasil menyelesaikan kelas (baik Pro maupun Gratis) akan mendapatkan e-sertifikat yang bisa dilampirkan di profil LinkedIn atau CV Anda.',
        },
    ];

    const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
        <Card className="flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="p-0">
                <img src={course.thumbnail} alt={course.title} className="aspect-[16/9] w-full object-cover" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2 p-4">
                <Badge variant={course.isPro ? 'default' : 'secondary'}>{course.category}</Badge>
                <h3 className="line-clamp-2 text-lg leading-tight font-bold">{course.title}</h3>
                <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-xs text-muted-foreground">({course.students.toLocaleString()} siswa)</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4">
                <p className="text-xl font-bold text-primary">{course.isPro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}</p>
                {course.isPro ? (
                    <Button size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Beli Kelas
                    </Button>
                ) : (
                    <Button size="sm" variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" /> Daftar Gratis
                    </Button>
                )}
            </CardFooter>
        </Card>
    );

    return (
        <UserLayout>
            {/* Hero Section */}
            <section className="bg-slate-50 py-20 dark:bg-slate-900/50">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 px-3 py-1">
                        <Award className="mr-2 h-4 w-4 text-yellow-500" />
                        Platform Kursus Online Eksklusif dari {NAMA_LEMBAGA}
                    </Badge>
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">Tingkatkan Skill, Raih Karir Impian Anda</h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                        Akses ratusan kursus berkualitas dari kami, bayar sekali untuk akses semua materi Pro selamanya.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" className="px-8 py-6 text-lg">
                            Lihat Katalog Kelas <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                            <PlayCircle className="mr-2 h-5 w-5" /> Coba Kelas Gratis
                        </Button>
                    </div>
                </div>
            </section>

            <section className="container mx-auto -mt-8 px-4">
                <Card className="border-2 border-primary/10 bg-card/80 shadow-lg backdrop-blur">
                    <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
                        <div className="flex items-center gap-3">
                            <CloudSun className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-lg font-bold">Cuaca Jakarta</p>
                                <p className="text-sm text-muted-foreground">Cerah Berawan, 30°C</p>
                            </div>
                        </div>
                        <div className="hidden h-10 w-px bg-border md:block" />
                        <div className="flex items-center gap-3">
                            <LifeBuoy className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="text-lg font-bold">Butuh Bantuan?</p>
                                <p className="text-sm text-muted-foreground">Hubungi kami jika butuh bantuan cepat.</p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => window.open('https://wa.me/6281234567890?text=Halo,%20saya%20butuh%20bantuan.', '_blank')}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" /> Hubungi via WhatsApp
                        </Button>
                    </div>
                </Card>
            </section>

            {/* Kelas Pro */}
            <section id="kelas-pro" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-2 text-center text-3xl font-bold">Kelas Profesional Unggulan</h2>
                    <p className="mx-auto mb-8 max-w-xl text-center text-muted-foreground">
                        Investasi terbaik untuk karir Anda. Dapatkan akses ke semua kelas Pro dengan sekali bayar.
                    </p>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {proCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Mengapa Memilih Kami */}
            <section id="why-us" className="bg-slate-50 py-20 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold">Mengapa Belajar di {NAMA_LEMBAGA}?</h2>
                    <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Kurikulum Standar Industri</h3>
                            <p className="text-muted-foreground">
                                Materi disusun oleh para ahli dan selalu diperbarui sesuai kebutuhan industri terkini.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Mentor Berpengalaman</h3>
                            <p className="text-muted-foreground">
                                Dapatkan bimbingan langsung dari praktisi yang telah bertahun-tahun berkarir di bidangnya.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Zap className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Akses Seumur Hidup</h3>
                            <p className="text-muted-foreground">
                                Cukup bayar sekali untuk menikmati semua kelas Pro, termasuk update dan kelas baru di masa depan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kelas Gratis */}
            <section id="kelas-gratis" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-2 text-center text-3xl font-bold">Mulai Belajar dengan Kelas Gratis</h2>
                    <p className="mx-auto mb-8 max-w-xl text-center text-muted-foreground">
                        Cicipi materi dasar dari berbagai bidang tanpa biaya. Cukup daftar dan langsung bisa akses.
                    </p>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {freeCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimoni */}
            <section id="testimonials" className="bg-slate-50 py-20 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <h2 className="mb-2 text-center text-3xl font-bold">Apa Kata Alumni Kami?</h2>
                    <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
                        Kami bangga telah membantu ribuan siswa mencapai tujuan karir mereka.
                    </p>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((item) => (
                            <Card key={item.id} className="flex flex-col p-6">
                                <div className="flex-grow">
                                    <div className="mb-4 flex items-center">
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground">"{item.comment}"</p>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <Avatar>
                                        <AvatarImage src={item.avatar} alt={item.name} />
                                        <AvatarFallback>{item.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                        <p className="font-bold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.role}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20">
                <div className="container mx-auto max-w-3xl px-4">
                    <h2 className="mb-8 text-center text-3xl font-bold">Pertanyaan yang Sering Diajukan</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index + 1}`} key={index}>
                                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>
        </UserLayout>
    );
};

export default Home;
