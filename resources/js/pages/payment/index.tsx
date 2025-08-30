import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/utils';
import { type Course, type Transaction } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, CreditCard, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

declare global {
    interface Window {
        snap: any;
    }
}

interface PaymentPageProps {
    course: Course;
    transaction?: Transaction;
    snapToken?: string;
    clientKey: string;
    isProduction: boolean;
    isAlreadyEnrolled?: boolean;
}

export default function PaymentPage({ course, transaction: initialTransaction, snapToken: initialSnapToken, clientKey, isProduction, isAlreadyEnrolled = false }: PaymentPageProps) {
    const { auth } = usePage().props as any;
    const [isLoading, setIsLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | undefined>(initialTransaction);
    const [snapToken, setSnapToken] = useState<string | undefined>(initialSnapToken);
    const snapContainerRef = useRef<HTMLDivElement>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>(
        isAlreadyEnrolled ? 'completed' : 'pending'
    );

    // Load Midtrans Snap script (only if not already enrolled)
    useEffect(() => {
        if (isAlreadyEnrolled) return;

        const snapSrcUrl = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        const script = document.createElement('script');
        script.src = snapSrcUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [clientKey, isProduction, isAlreadyEnrolled]);

    // Create transaction if not exists (skip if already enrolled)
    useEffect(() => {
        if (!isAlreadyEnrolled && !transaction && !snapToken && course.is_pro && course.price > 0) {
            createTransaction();
        }
    }, [isAlreadyEnrolled]);

    // Embed Snap payment when token is available
    useEffect(() => {
        if (snapToken && window.snap && snapContainerRef.current) {
            embedSnapPayment();
        }
    }, [snapToken]);

    const createTransaction = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(route('payments.courses.create', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create transaction');
            }

            const data = await response.json();
            setSnapToken(data.snap_token);
            
            // Create a temporary transaction object
            setTransaction({
                id: data.order_id,
                midtrans_order_id: data.order_id,
                status: 'pending',
                amount: course.price,
                user_id: auth.user.id,
                transactionable_id: course.id,
                transactionable_type: 'Course',
                payment_method: null,
                payment_details: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as Transaction);

        } catch (error: any) {
            toast.error(error.message || 'Gagal membuat transaksi');
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    };

    const embedSnapPayment = () => {
        if (!snapToken || !window.snap) return;

        // Clear previous embed if any
        if (snapContainerRef.current) {
            snapContainerRef.current.innerHTML = '';
        }

        window.snap.embed(snapToken, {
            embedId: 'snap-container',
            onSuccess: function(result: any) {
                console.log('Payment success:', result);
                setPaymentStatus('completed');
                toast.success('Pembayaran berhasil!');
                
                // Redirect to course learn page after 2 seconds
                setTimeout(() => {
                    router.visit(route('courses.learn', course.id));
                }, 2000);
            },
            onPending: function(result: any) {
                console.log('Payment pending:', result);
                setPaymentStatus('processing');
                toast.info('Menunggu pembayaran...');
            },
            onError: function(result: any) {
                console.log('Payment error:', result);
                setPaymentStatus('failed');
                toast.error('Pembayaran gagal!');
            },
            onClose: function() {
                console.log('Customer closed the popup without finishing the payment');
                if (paymentStatus === 'pending') {
                    toast.warning('Pembayaran dibatalkan');
                }
            }
        });
    };

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'cancelled':
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
            default:
                return <CreditCard className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStatusMessage = () => {
        if (isAlreadyEnrolled) {
            return 'Anda sudah terdaftar di kursus ini. Pembayaran telah berhasil dilakukan sebelumnya.';
        }
        switch (paymentStatus) {
            case 'completed':
                return 'Pembayaran berhasil! Anda akan diarahkan ke halaman kursus...';
            case 'processing':
                return 'Menunggu konfirmasi pembayaran...';
            case 'failed':
                return 'Pembayaran gagal. Silakan coba lagi.';
            case 'cancelled':
                return 'Pembayaran dibatalkan.';
            default:
                return 'Silakan lakukan pembayaran melalui form di bawah ini.';
        }
    };

    return (
        <>
            <Head title={`Pembayaran - ${course.title}`} />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(route('courses.show', course.id))}
                        className="mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Detail Kursus
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Payment Form Section */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pembayaran Kursus</CardTitle>
                                    <CardDescription>
                                        Lakukan pembayaran untuk mengakses kursus premium
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Status Message */}
                                    <div className="mb-6 p-4 rounded-lg bg-gray-50 flex items-center gap-3">
                                        {getStatusIcon()}
                                        <span className="text-sm">{getStatusMessage()}</span>
                                    </div>

                                    {/* Midtrans Snap Embed Container */}
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="ml-3">Memuat form pembayaran...</span>
                                        </div>
                                    ) : (
                                        <div 
                                            id="snap-container" 
                                            ref={snapContainerRef}
                                            className="w-full min-h-[400px]"
                                        />
                                    )}

                                    {/* Retry button for failed payments */}
                                    {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
                                        <div className="mt-6 text-center">
                                            <Button onClick={createTransaction} disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    'Coba Lagi'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payment Information */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Informasi Pembayaran</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Metode Pembayaran yang Tersedia:</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• Transfer Bank (BCA, BNI, BRI, Mandiri, dll)</li>
                                            <li>• E-Wallet (GoPay, OVO, DANA, ShopeePay)</li>
                                            <li>• Kartu Kredit/Debit</li>
                                            <li>• Virtual Account</li>
                                            <li>• Retail (Indomaret, Alfamart)</li>
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold mb-2">Catatan:</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• Pembayaran diproses secara otomatis</li>
                                            <li>• Akses kursus langsung setelah pembayaran berhasil</li>
                                            <li>• Simpan bukti pembayaran untuk referensi</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary Section */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle>Ringkasan Pesanan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Course Info */}
                                    <div className="space-y-4">
                                        {course.thumbnail_path && (
                                            <img
                                                src={`/storage/${course.thumbnail_path}`}
                                                alt={course.title}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold">{course.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {course.category?.name}
                                            </p>
                                        </div>
                                        <Separator />
                                        
                                        {/* Price Details */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Harga Kursus</span>
                                                <span>{formatRupiah(course.price)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Biaya Admin</span>
                                                <span>Rp 0</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-semibold">
                                                <span>Total</span>
                                                <span className="text-primary">{formatRupiah(course.price)}</span>
                                            </div>
                                        </div>

                                        {/* Transaction Info */}
                                        {transaction && (
                                            <>
                                                <Separator />
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Order ID</span>
                                                        <span className="font-mono">{transaction.midtrans_order_id}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Status</span>
                                                        <span className="capitalize">{paymentStatus}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <div className="w-full text-center text-xs text-gray-500">
                                        Dengan melakukan pembayaran, Anda menyetujui syarat dan ketentuan yang berlaku
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}