import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    GraduationCap, 
    Target, 
    Users, 
    Award,
    BookOpen,
    Zap,
    Shield,
    Heart,
    CheckCircle,
    MapPin, 
    Phone, 
    Mail, 
    Clock,
    MessageSquare,
    Send,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin
} from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';

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
    institution?: Institution;
}

export default function Tentang() {
    const { institution } = usePage<PageProps>().props;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        alert('Terima kasih! Pesan Anda telah diterima. Kami akan segera menghubungi Anda.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const values = [
        {
            icon: <Heart className="h-6 w-6" />,
            title: "Komitmen pada Kualitas",
            description: "Kami berkomitmen untuk menyediakan konten pembelajaran berkualitas tinggi yang relevan dengan kebutuhan industri."
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Pembelajaran Kolaboratif",
            description: "Memfasilitasi lingkungan belajar yang mendukung kolaborasi dan pertukaran pengetahuan antar peserta."
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "Inovasi Berkelanjutan",
            description: "Terus berinovasi dalam metode pembelajaran dan teknologi untuk memberikan pengalaman terbaik."
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Kepercayaan & Transparansi",
            description: "Membangun kepercayaan melalui transparansi dalam setiap aspek layanan kami."
        }
    ];

    const achievements = [
        { number: "50,000+", label: "Siswa Aktif" },
        { number: "500+", label: "Kursus Tersedia" },
        { number: "98%", label: "Tingkat Kepuasan" },
        { number: "4.9/5", label: "Rating Platform" }
    ];

    const contactInfo = [
        {
            icon: <MapPin className="h-5 w-5" />,
            title: "Alamat",
            content: institution?.address || "Jl. Brawijaya No. 123, Pare, Kediri, Jawa Timur 64212"
        },
        {
            icon: <Phone className="h-5 w-5" />,
            title: "Telepon",
            content: institution?.phone || "+62 812-3456-7890"
        },
        {
            icon: <Mail className="h-5 w-5" />,
            title: "Email",
            content: institution?.email || "info@pareeduhub.com"
        },
        {
            icon: <Clock className="h-5 w-5" />,
            title: "Jam Operasional",
            content: "Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 12:00"
        }
    ];

    const socialMedia = [
        { icon: <Facebook className="h-5 w-5" />, name: "Facebook", url: "#" },
        { icon: <Twitter className="h-5 w-5" />, name: "Twitter", url: "#" },
        { icon: <Instagram className="h-5 w-5" />, name: "Instagram", url: "#" },
        { icon: <Youtube className="h-5 w-5" />, name: "Youtube", url: "#" },
        { icon: <Linkedin className="h-5 w-5" />, name: "LinkedIn", url: "#" }
    ];

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <Badge variant="secondary" className="mb-4">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Tentang Kami
                        </Badge>
                        <h1 className="text-4xl font-bold mb-4">
                            {institution?.name || 'Pare EduHub'} - Platform Pembelajaran Digital Terpercaya
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            {institution?.description || 'Platform pembelajaran online personal yang menyediakan kursus berkualitas tinggi untuk pengembangan karir digital Anda.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                    <Target className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-2xl">Misi Kami</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Menyediakan akses pendidikan berkualitas tinggi yang terjangkau dan mudah diakses 
                                    untuk semua orang, dengan fokus pada:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <span>Demokratisasi pendidikan melalui teknologi</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <span>Pengembangan keterampilan yang relevan dengan industri</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <span>Mendukung pembelajaran sepanjang hayat</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                    <Award className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-2xl">Visi Kami</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Menjadi platform pembelajaran online terkemuka yang mengubah 
                                    cara orang belajar dan berkembang, dengan:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <span>Menciptakan ekosistem pembelajaran yang komprehensif</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <span>Membangun komunitas pembelajar yang aktif dan saling mendukung</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <span>Menjadi mitra terpercaya untuk pengembangan karir</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Nilai-nilai yang menjadi fondasi dalam setiap langkah kami
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                        {value.icon}
                                    </div>
                                    <CardTitle className="text-lg">{value.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{value.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Pencapaian Kami</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Angka-angka yang menunjukkan dampak positif kami dalam dunia pendidikan
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {achievement.number}
                                </div>
                                <p className="text-muted-foreground">{achievement.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <Card className="border-0 shadow-lg max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl">Cerita Kami</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                {institution?.name || 'Pare EduHub'} lahir dari visi sederhana namun kuat: membuat pendidikan berkualitas 
                                dapat diakses oleh semua orang, di mana pun mereka berada. Platform kami dirancang khusus 
                                untuk menyediakan pembelajaran personal yang sesuai dengan kebutuhan setiap individu.
                            </p>
                            <p>
                                Berawal dari Pare, Kediri - yang dikenal sebagai Kampung Inggris - kami terinspirasi 
                                oleh semangat belajar yang tinggi di kota ini. Kami melihat potensi besar untuk 
                                membawa pengalaman pembelajaran berkualitas melalui platform digital yang modern.
                            </p>
                            <p>
                                Sebagai platform pembelajaran online personal, kami fokus pada kualitas daripada kuantitas. 
                                Setiap kursus dirancang dengan cermat, setiap materi dipilih dengan teliti, dan setiap 
                                siswa mendapatkan perhatian yang mereka butuhkan untuk berkembang.
                            </p>
                            <p>
                                Bergabunglah dengan kami dalam perjalanan mengubah masa depan pendidikan, 
                                satu pembelajaran pada satu waktu.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Hubungi Kami
                        </Badge>
                        <h2 className="text-3xl font-bold mb-4">
                            Kami Siap Membantu Anda
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Punya pertanyaan atau butuh bantuan? Tim kami siap melayani Anda dengan senang hati.
                        </p>
                    </div>
                    
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Kirim Pesan</CardTitle>
                                    <CardDescription>
                                        Isi formulir di bawah ini dan kami akan merespons secepat mungkin
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nama Lengkap</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Masukkan nama Anda"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subjek</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Tentang apa pesan Anda?"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Pesan</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Tulis pesan Anda di sini..."
                                                rows={6}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" size="lg" className="w-full gap-2">
                                            <Send className="h-4 w-4" />
                                            Kirim Pesan
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Informasi Kontak</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {contactInfo.map((info, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{info.title}</p>
                                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                    {info.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Ikuti Kami</CardTitle>
                                    <CardDescription>
                                        Tetap terhubung melalui media sosial kami
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {socialMedia.map((social, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="icon"
                                                asChild
                                            >
                                                <a
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={social.name}
                                                >
                                                    {social.icon}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">Lokasi Kami</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Kunjungi kantor kami untuk konsultasi langsung
                        </p>
                    </div>
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="aspect-[16/9] md:aspect-[21/9] bg-muted">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31602.45974395!2d112.1909!3d-7.7584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785c39c5d0e0c7%3A0x3027a76e352bd20!2sPare%2C%20Kediri%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`${institution?.name || 'Pare EduHub'} Location`}
                            />
                        </div>
                    </Card>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">Pertanyaan Umum</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Berikut beberapa pertanyaan yang sering diajukan
                        </p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Bagaimana cara mendaftar kursus?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Anda dapat mendaftar dengan membuat akun terlebih dahulu, kemudian pilih kursus 
                                    yang diinginkan dan ikuti proses pembayaran untuk kursus berbayar.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Apakah ada garansi uang kembali?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Ya, kami menyediakan garansi uang kembali 30 hari untuk semua kursus berbayar 
                                    jika Anda tidak puas dengan konten pembelajaran.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Apakah sertifikat yang diberikan resmi?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Sertifikat yang kami berikan telah diakui sebagai bukti kompetensi 
                                    dan dapat digunakan untuk pengembangan karir Anda.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Bagaimana sistem pembelajaran di platform ini?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Pembelajaran dilakukan secara online dengan materi video, PDF, dan 
                                    quiz interaktif. Anda dapat belajar sesuai dengan kecepatan Anda sendiri.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}