import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import GuestLayout from '@/layouts/guest-layout';
import { usePage } from '@inertiajs/react';
import { Clock, GraduationCap, Mail, MapPin, MessageSquare, Phone, Star } from 'lucide-react';
import { useState } from 'react';

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

interface PageProps {
    institution?: Institution;
    reviews?: Review[];
    stats?: {
        total_students: number;
        total_courses: number;
        satisfaction_rate: number;
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

export default function Tentang() {
    const { institution, reviews = [], stats, auth } = usePage<PageProps>().props;
    const { toast } = useToast();
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        comment: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.user) {
            toast({
                title: 'Login Required',
                description: 'Silakan login terlebih dahulu untuk memberikan review.',
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

        setIsSubmitting(true);
        try {
            const response = await fetch('/reviews/institution', {
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
            setIsSubmitting(false);
        }
    };

    const achievements = [
        { number: `${(stats?.total_students || 0).toLocaleString()}+`, label: 'Siswa Aktif' },
        { number: `${stats?.total_courses || 0}+`, label: 'Kursus Tersedia' },
        { number: `${stats?.satisfaction_rate || 98}%`, label: 'Tingkat Kepuasan' },
        { number: `${stats?.average_rating || 0}/5`, label: 'Rating Platform' },
    ];

    const contactInfo = [
        {
            icon: <MapPin className="h-5 w-5" />,
            title: 'Alamat',
            content: institution?.address || 'Jl. Brawijaya No. 123, Pare, Kediri, Jawa Timur 64212',
        },
        {
            icon: <Phone className="h-5 w-5" />,
            title: 'Telepon',
            content: institution?.phone || '+62 812-3456-7890',
        },
        {
            icon: <Mail className="h-5 w-5" />,
            title: 'Email',
            content: institution?.email || 'info@pareeduhub.com',
        },
        {
            icon: <Clock className="h-5 w-5" />,
            title: 'Jam Operasional',
            content: 'Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 12:00',
        },
    ];

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-4">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Tentang Kami
                        </Badge>
                        <h1 className="mb-4 text-4xl font-bold">{institution?.name || 'Pare EduHub'}</h1>
                        <p className="text-xl text-muted-foreground">
                            {institution?.description ||
                                'Platform pembelajaran online personal yang menyediakan kursus berkualitas tinggi untuk pengembangan karir digital Anda.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold">Pencapaian Kami</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Angka-angka yang menunjukkan dampak positif kami dalam dunia pendidikan
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="text-center">
                                <div className="mb-2 text-4xl font-bold text-primary">{achievement.number}</div>
                                <p className="text-muted-foreground">{achievement.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-muted/30 py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold">Review Institusi</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">Apa kata mereka tentang pengalaman belajar di platform kami</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Review Form */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Berikan Review Anda</CardTitle>
                                <CardDescription>
                                    {auth?.user
                                        ? 'Bagikan pengalaman Anda dengan institusi kami'
                                        : 'Silakan login terlebih dahulu untuk memberikan review'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {auth?.user ? (
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="rating">Rating</Label>
                                            <div className="mt-2 flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                                                        aria-label={`Beri rating ${star} bintang`}
                                                        className={`transition-colors hover:scale-110 ${
                                                            star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                                                        }`}
                                                    >
                                                        <Star
                                                            className={`h-6 w-6 ${
                                                                star <= reviewForm.rating ? 'fill-yellow-400' : 'fill-transparent'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {reviewForm.rating > 0 ? `${reviewForm.rating} dari 5 bintang` : 'Pilih rating Anda'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="comment">Komentar</Label>
                                            <Textarea
                                                id="comment"
                                                placeholder="Tulis review Anda..."
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                                required
                                                className="mt-2"
                                                rows={4}
                                            />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                            {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="mb-4 text-muted-foreground">Silakan login untuk memberikan review</p>
                                        <Button asChild>
                                            <a href="/login">Login</a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reviews List */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Review Terbaru</CardTitle>
                                <CardDescription>Review dari pengguna yang telah bergabung dengan kami</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-96 space-y-4 overflow-y-auto">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="border-b pb-4 last:border-b-0">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                            <span className="text-sm font-medium text-primary">
                                                                {review.user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <span className="font-medium">{review.user.name}</span>
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                    >
                                                                        ⭐
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="mb-1 text-sm text-muted-foreground">{review.comment}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(review.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center">
                                            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">Belum ada review untuk institusi ini</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact and Map Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Contact Info */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Hubungi Kami</CardTitle>
                                <CardDescription>Informasi kontak dan alamat institusi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{info.title}</h4>
                                            <p className="text-sm whitespace-pre-line text-muted-foreground">{info.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Lokasi Kami</CardTitle>
                                <CardDescription>Temukan kami di peta</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video overflow-hidden rounded-lg">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.8661536284646!2d112.17619751477365!3d-7.805389794357686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78575e8b2b3c9d%3A0x5c6c21f5f5b6b6b6!2sPare%2C%20Kediri%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1634567890123!5m2!1sen!2sid"
                                        width="100%"
                                        height="100%"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="border-0"
                                        title="Google Maps"
                                    ></iframe>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
