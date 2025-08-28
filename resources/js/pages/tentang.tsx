import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    GraduationCap, 
    Target, 
    Users, 
    Award,
    BookOpen,
    Zap,
    Shield,
    Heart,
    CheckCircle
} from 'lucide-react';

export default function Tentang() {
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
        { number: "100+", label: "Lembaga Partner" },
        { number: "4.9/5", label: "Rating Kepuasan" }
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
                            Memberdayakan Pembelajaran Digital di Indonesia
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Pare EduHub adalah platform pembelajaran online terdepan yang menghubungkan 
                            lembaga pendidikan berkualitas dengan peserta didik di seluruh Indonesia.
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
                                    untuk semua orang di Indonesia, dengan fokus pada:
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
                                    Menjadi platform pembelajaran online terkemuka di Asia Tenggara yang mengubah 
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
                                Pare EduHub lahir dari visi sederhana namun kuat: membuat pendidikan berkualitas 
                                dapat diakses oleh semua orang, di mana pun mereka berada. Didirikan pada tahun 2020, 
                                kami memulai perjalanan dengan misi untuk mendemokratisasi pembelajaran di Indonesia.
                            </p>
                            <p>
                                Berawal dari Pare, Kediri - yang dikenal sebagai Kampung Inggris - kami terinspirasi 
                                oleh semangat belajar yang tinggi di kota ini. Kami melihat potensi besar untuk 
                                membawa pengalaman pembelajaran Pare ke seluruh Indonesia melalui platform digital.
                            </p>
                            <p>
                                Hari ini, Pare EduHub telah berkembang menjadi platform pembelajaran online terpercaya 
                                dengan lebih dari 50,000 siswa aktif, 500+ kursus berkualitas, dan kemitraan dengan 
                                100+ lembaga pendidikan terkemuka. Kami terus berinovasi dan berkembang, namun komitmen 
                                kami tetap sama: menyediakan pendidikan berkualitas untuk semua.
                            </p>
                            <p>
                                Bergabunglah dengan kami dalam perjalanan mengubah masa depan pendidikan Indonesia, 
                                satu pembelajaran pada satu waktu.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </GuestLayout>
    );
}