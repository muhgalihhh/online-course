import { AppStoreIcon, FacebookIcon, GooglePlayIcon, InstagramIcon, TikTokIcon, TwitterIcon } from '@/components/social-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import GuestLayout from '@/layouts/guest-layout';
import { usePage } from '@inertiajs/react';
import { Clock, Globe, GraduationCap, Mail, MapPin, MessageSquare, Phone, Star } from 'lucide-react';
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
    // Social media links
    tiktok_url?: string;
    instagram_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    // Mobile app links
    ios_app_url?: string;
    android_app_url?: string;
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
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(reviewForm),
            });

            if (response.ok) {
                console.log('Review submit success');
                toast({
                    title: 'Review Terkirim',
                    description: 'Review Anda telah berhasil dikirim dan sedang menunggu persetujuan admin.',
                });
                setReviewForm({ rating: 0, comment: '' });
                window.location.reload();
            } else {
                let error: unknown = {};
                try {
                    error = await response.json();
                } catch {
                    // ignore JSON parse error
                }
                console.error('Review submit failed', error, response.status);
                toast({
                    title: 'Error',
                    description: (error as { message?: string })?.message || 'Terjadi kesalahan saat mengirim review.',
                    variant: 'destructive',
                });
            }
        } catch {
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
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-4 w-4 ${
                                                                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                                        }`}
                                                                    />
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

            {/* Call to Action Section with Social Media */}
            <section className="bg-primary/5 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="mb-4 text-3xl font-bold">Mari Terhubung dengan Kami</h2>
                        <p className="mb-8 text-xl text-muted-foreground">
                            Ikuti media sosial kami untuk mendapatkan update terbaru tentang kursus dan tips pembelajaran
                        </p>

                        {/* Social Media Links */}
                        <div className="mb-8 flex flex-wrap justify-center gap-4">
                            {institution?.facebook_url && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                >
                                    <a href={institution.facebook_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                        <FacebookIcon className="h-5 w-5 transition-colors group-hover:text-blue-600" />
                                        Facebook
                                    </a>
                                </Button>
                            )}
                            {institution?.instagram_url && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                >
                                    <a href={institution.instagram_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                        <InstagramIcon className="h-5 w-5 transition-colors group-hover:text-pink-600" />
                                        Instagram
                                    </a>
                                </Button>
                            )}
                            {institution?.twitter_url && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                >
                                    <a href={institution.twitter_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                        <TwitterIcon className="h-5 w-5 transition-colors group-hover:text-blue-400" />
                                        Twitter
                                    </a>
                                </Button>
                            )}
                            {institution?.tiktok_url && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                >
                                    <a href={institution.tiktok_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                        <TikTokIcon className="h-5 w-5 transition-colors group-hover:text-black" />
                                        TikTok
                                    </a>
                                </Button>
                            )}
                            {institution?.website && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                >
                                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                                        <Globe className="h-5 w-5 transition-colors group-hover:text-primary" />
                                        Website
                                    </a>
                                </Button>
                            )}
                        </div>

                        {/* Mobile App Links */}
                        {(institution?.ios_app_url || institution?.android_app_url) && (
                            <div className="mb-8">
                                <h3 className="mb-4 text-lg font-semibold">Download Aplikasi Mobile</h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {institution?.ios_app_url && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            asChild
                                            className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                        >
                                            <a href={institution.ios_app_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                                <AppStoreIcon className="h-5 w-5" />
                                                App Store
                                            </a>
                                        </Button>
                                    )}
                                    {institution?.android_app_url && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            asChild
                                            className="group hover-gradient-gray transition-all duration-200 hover:scale-105"
                                        >
                                            <a href={institution.android_app_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                                <GooglePlayIcon className="h-5 w-5" />
                                                Google Play
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Main CTA */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" className="gap-2" asChild>
                                <a href="/kelas-pro">
                                    <GraduationCap className="h-5 w-5" />
                                    Lihat Kelas Pro
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="btn-outline-gradient gap-2" asChild>
                                <a href="/kelas-free">
                                    <GraduationCap className="h-5 w-5" />
                                    Mulai Kelas Gratis
                                </a>
                            </Button>
                        </div>
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

                        {/* Map (Dynamic based on institution address) */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Lokasi Kami</CardTitle>
                                <CardDescription>Temukan kami di peta berdasarkan alamat yang tersimpan di database</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {institution?.address && institution.address.trim() !== '' ? (
                                    <>
                                        <div className="aspect-video overflow-hidden rounded-lg">
                                            {(() => {
                                                const mapAddress = institution.address!.trim();
                                                const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;
                                                return (
                                                    <iframe
                                                        src={mapSrc}
                                                        width="100%"
                                                        height="100%"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        className="border-0"
                                                        title={`Lokasi ${mapAddress}`}
                                                    ></iframe>
                                                );
                                            })()}
                                        </div>
                                        <p className="mt-2 text-xs break-words text-muted-foreground">Alamat sumber: {institution.address}</p>
                                    </>
                                ) : (
                                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        <p className="mb-2 font-medium">Alamat belum tersedia</p>
                                        <p className="mb-4">Alamat institusi belum ditambahkan di database sehingga peta tidak dapat ditampilkan.</p>
                                        {auth?.user?.role === 'admin' && (
                                            <Button asChild size="sm" variant="outline" className="btn-outline-gradient">
                                                <a href="/admin/institutions">Tambahkan Alamat Sekarang</a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
