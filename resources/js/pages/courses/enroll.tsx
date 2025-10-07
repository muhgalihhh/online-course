import CustomAlert from '@/components/custom-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { router } from '@inertiajs/react';
import { ArrowLeft, Award, BookOpen, CheckCircle, Clock, CreditCard, Shield } from 'lucide-react';
import { useState } from 'react';

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
}

interface PageProps {
    course: Course;
}

export default function EnrollCourse({ course }: PageProps) {
    const [isProcessing, setIsProcessing] = useState(false);
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

    const handleEnrollment = async () => {
        // Free course: call backend enroll-free to create Enrollment properly
        if (!course.is_pro || course.price === 0) {
            try {
                setIsProcessing(true);
                await router.post(
                    `/courses/${course.id}/enroll-free`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => router.visit(`/courses/${course.id}/learn`),
                        onError: (errors) => {
                            setAlertState({
                                open: true,
                                title: 'Gagal Mendaftar',
                                description: 'Terjadi kesalahan saat mendaftar kursus gratis.',
                                type: 'error',
                            });
                        },
                    },
                );
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        try {
            setIsProcessing(true);
            const response = await fetch(route('payments.courses.create', { id: course.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ payment_method: null }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Gagal membuat transaksi.');
            }

            const data = await response.json();

            // Prefer Snap redirect URL, fallback to snap.js
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            // Use Snap.js popup if available
            await ensureSnapJsLoaded(data.client_key, data.is_production);

            const snap: any = (window as any).snap;
            if (!snap) throw new Error('Midtrans Snap tidak tersedia.');

            snap.pay(data.snap_token, {
                onSuccess: async function () {
                    console.log('[Payment] Success callback - verifying and enrolling...');

                    // Call verify and enroll endpoint
                    try {
                        const verifyRes = await fetch(`/payments/${data.order_id}/verify-and-enroll`, {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                            },
                        });

                        if (verifyRes.ok) {
                            const verifyData = await verifyRes.json();
                            console.log('[Payment] Verify response:', verifyData);

                            if (verifyData.enrolled && verifyData.redirect_url) {
                                window.location.href = verifyData.redirect_url;
                                return;
                            }
                        }
                    } catch (err) {
                        console.error('[Payment] Verification failed:', err);
                    }

                    // Fallback
                    router.visit(`/courses/${course.id}/learn`);
                },
                onPending: function () {
                    router.visit(`/courses/${course.id}`);
                },
                onError: function () {
                    setAlertState({
                        open: true,
                        title: 'Pembayaran Gagal',
                        description: 'Terjadi kesalahan saat memproses pembayaran.',
                        type: 'error',
                    });
                },
                onClose: function () {
                    /* user closed popup */
                },
            });
        } catch (error: any) {
            setAlertState({
                open: true,
                title: 'Gagal Memulai Pembayaran',
                description: error?.message || 'Silakan coba lagi.',
                type: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    async function ensureSnapJsLoaded(clientKey: string, isProduction: boolean) {
        const existing = document.querySelector('script[src*="snap.js"]');
        if (existing) return;
        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src =
                (isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js') +
                `?client-key=${clientKey}`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.'));
            document.body.appendChild(script);
        });
    }

    const benefits = [
        'Akses seumur hidup ke semua materi kursus',
        'Sertifikat resmi setelah menyelesaikan kursus',
        'Akses ke forum diskusi dan komunitas',
        'Update materi kursus gratis',
        'Dukungan instruktur melalui Q&A',
        'Download materi dalam format PDF',
    ];

    return (
        <GuestLayout>
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.visit(`/courses/${course.id}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Detail Kursus
                </Button>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <div className="mb-2 flex items-center gap-2">
                                    <Badge variant="outline">{course.category.name}</Badge>
                                    <Badge variant={course.is_pro ? 'default' : 'secondary'}>{course.is_pro ? 'Pro' : 'Free'}</Badge>
                                </div>
                                <CardTitle className="text-2xl">{course.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-lg font-semibold">Yang Akan Anda Dapatkan</h3>
                                        <div className="space-y-3">
                                            {benefits.map((benefit, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                                                    <span className="text-muted-foreground">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="mb-4 text-lg font-semibold">Informasi Kursus</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Durasi</p>
                                                    <p className="font-medium">Akses Seumur Hidup</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Materi</p>
                                                    <p className="font-medium">Video & PDF</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Sertifikat</p>
                                                    <p className="font-medium">Ya, Resmi</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Garansi</p>
                                                    <p className="font-medium">30 Hari</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Enrollment Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Pendaftaran Kursus</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {course.thumbnail && (
                                    <img src={course.thumbnail} alt={course.title} className="aspect-video w-full rounded-lg object-cover" />
                                )}

                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Harga Kursus</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {course.is_pro ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Button className="w-full" size="lg" onClick={handleEnrollment} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                {course.is_pro ? (
                                                    <>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Lanjut ke Pembayaran
                                                    </>
                                                ) : (
                                                    'Daftar Sekarang (Gratis)'
                                                )}
                                            </>
                                        )}
                                    </Button>

                                    {course.is_pro && (
                                        <p className="text-center text-xs text-muted-foreground">Pembayaran aman dengan enkripsi SSL</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Garansi uang kembali 30 hari
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Akses seumur hidup
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Sertifikat resmi
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

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
