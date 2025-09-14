import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ensureSnapReady } from '@/lib/midtrans';
import { formatRupiah } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, CreditCard, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';

interface Transaction {
    id: number;
    user_id: number;
    transactionable_id: number;
    transactionable_type: string;
    midtrans_order_id: string;
    amount: number;
    payment_method?: string;
    status: string;
    payment_details?: {
        snap_token?: string;
        redirect_url?: string;
    };
    created_at: string;
    updated_at: string;
}

interface Course {
    id: number;
    title: string;
    price: number;
    thumbnail?: string;
    is_pro: boolean;
    category: {
        name: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    auth: {
        user: User;
    };
    course: Course;
    clientKey: string;
    isProduction: boolean;
    transaction?: Transaction;
    error?: string;
    isAlreadyEnrolled: boolean;
    isAlreadyPaid: boolean;
    transactionExpired: boolean;
    expiredMessage?: string;
}

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';

declare global {
    interface Window {
        snap: {
            embed: (token: string, options: any) => void;
            pay: (token: string, options?: any) => void;
        };
    }
}

const TRANSACTION_STORAGE_KEY = 'payment_transaction_data';

export default function PaymentIndex({
    auth,
    course,
    clientKey,
    isProduction,
    transaction: initialTransaction,
    error: initialError,
    isAlreadyEnrolled,
    isAlreadyPaid,
    transactionExpired,
    expiredMessage,
}: Props) {
    // State management
    const [transaction, setTransaction] = useState<Transaction | undefined>(initialTransaction);
    const [snapToken, setSnapToken] = useState<string | undefined>(initialTransaction?.payment_details?.snap_token);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmbedding, setIsEmbedding] = useState(false);
    const [snapEmbedFailed, setSnapEmbedFailed] = useState(false);
    const [fallbackReady, setFallbackReady] = useState(false);
    const [hasAttemptedEmbed, setHasAttemptedEmbed] = useState(false);
    const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
    const [error, setError] = useState<string | undefined>(initialError);
    const [redirectTried, setRedirectTried] = useState(false);
    const [autoRefreshed, setAutoRefreshed] = useState(false);
    const [embedAttempts, setEmbedAttempts] = useState(0);
    const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [forceNewLoading, setForceNewLoading] = useState(false);

    // Refs
    const snapContainerRef = useRef<HTMLDivElement>(null);

    // Session storage functions
    const saveTransactionToSession = (trans: Transaction, token: string) => {
        try {
            const data = {
                transaction: trans,
                snapToken: token,
                courseId: course.id,
                timestamp: Date.now(),
            };
            sessionStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save transaction to session storage:', error);
        }
    };

    const loadTransactionFromSession = (): { transaction: Transaction; snapToken: string } | null => {
        try {
            const stored = sessionStorage.getItem(TRANSACTION_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Check if it's for the same course and not too old (30 minutes)
                if (data.courseId === course.id && Date.now() - data.timestamp < 30 * 60 * 1000) {
                    return { transaction: data.transaction, snapToken: data.snapToken };
                }
            }
        } catch (error) {
            console.warn('Failed to load transaction from session storage:', error);
        }
        return null;
    };

    const clearTransactionFromSession = () => {
        try {
            sessionStorage.removeItem(TRANSACTION_STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear transaction from session storage:', error);
        }
    };

    // Restore transaction from session on mount
    useEffect(() => {
        if (isAlreadyEnrolled || isAlreadyPaid) {
            setHasAttemptedRestore(true);
            clearTransactionFromSession();
            return;
        }

        // Try to restore transaction from session storage if no initial transaction
        if (!transaction && !snapToken) {
            const sessionData = loadTransactionFromSession();
            if (sessionData) {
                console.log('[Payment] Restored transaction from session:', sessionData);
                setTransaction(sessionData.transaction);
                setSnapToken(sessionData.snapToken);
                setPaymentStatus('pending');
                toast.info('Melanjutkan transaksi sebelumnya...');
            }
        }

        setHasAttemptedRestore(true);
    }, []);

    // Helper functions
    const createNewTransaction = () => {
        setIsCreatingTransaction(true);
        clearTransactionFromSession();
        setTransaction(undefined);
        setSnapToken(undefined);
        setSnapEmbedFailed(false);
        setHasAttemptedEmbed(false);
        setIsEmbedding(false);
        setPaymentStatus('pending');
        setError(undefined);
        setTimeout(() => {
            createTransaction();
            setIsCreatingTransaction(false);
        }, 1000);
    };

    const handleExpiredTransaction = () => {
        setIsCreatingTransaction(true);
        clearTransactionFromSession();
        setTransaction(undefined);
        setSnapToken(undefined);
        setSnapEmbedFailed(false);
        setHasAttemptedEmbed(false);
        setIsEmbedding(false);
        setPaymentStatus('pending');
        setError(undefined);
        setTimeout(() => {
            createTransaction();
            setIsCreatingTransaction(false);
        }, 1000);
    };

    // Manual function to check transaction status
    const checkTransactionStatus = async () => {
        if (!transaction?.id) {
            toast.error('Transaksi tidak ditemukan');
            return;
        }

        setIsCheckingStatus(true);
        try {
            const response = await fetch(route('api.transactions.status', transaction.midtrans_order_id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Transaction status check:', data);

                if (data.status === 'completed') {
                    setPaymentStatus('completed');
                    toast.success('Pembayaran berhasil dikonfirmasi!');

                    // Redirect after success
                    setTimeout(() => {
                        window.location.reload(); // This will trigger redirect to course or enrollment page
                    }, 2000);
                } else if (data.is_expired) {
                    setPaymentStatus('failed');
                    toast.error('Transaksi sudah kadaluarsa');
                } else {
                    toast.info('Status pembayaran masih dalam proses. Silakan coba lagi dalam beberapa saat.');
                }
            } else {
                throw new Error('Gagal mengecek status transaksi');
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
            toast.error('Gagal mengecek status pembayaran. Silakan coba lagi.');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // Function to get CSRF token
    const getCSRFToken = (): string => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.warn('CSRF token not found, refreshing page...');
            window.location.reload();
            return '';
        }
        return token;
    };

    const createTransaction = async () => {
        console.log('createTransaction function called');
        setIsLoading(true);
        setSnapEmbedFailed(false); // Reset failed state when creating new transaction

        try {
            console.log('Making API request to create transaction for course:', course.id);

            const csrfToken = getCSRFToken();
            if (!csrfToken) return; // Page will refresh

            const response = await fetch(route('payments.courses.create', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            console.log('API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);

                const newTransaction: Transaction = {
                    id: Date.now(), // Temporary ID for React state
                    user_id: auth.user.id,
                    transactionable_id: course.id,
                    transactionable_type: 'App\\Models\\Course',
                    midtrans_order_id: data.order_id,
                    amount: course.price,
                    payment_method: null,
                    status: 'pending',
                    payment_details: {
                        snap_token: data.snap_token,
                        redirect_url: data.redirect_url,
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                setTransaction(newTransaction);
                setSnapToken(data.snap_token);
                setPaymentStatus('pending');

                // Save to session storage for persistence on refresh
                saveTransactionToSession(newTransaction, data.snap_token);

                console.log('Transaction created successfully:', newTransaction);

                if (data.existing_transaction) {
                    toast.success('Melanjutkan dengan transaksi yang sudah ada.');
                } else {
                    toast.success('Transaksi berhasil dibuat! Silakan lakukan pembayaran.');
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Network error' }));
                console.error('API Error:', errorData);

                if (response.status === 409) {
                    if (errorData.is_enrolled) {
                        toast.success('Anda sudah terdaftar di kursus ini!');
                        router.visit(route('courses.learn', course.id));
                        return;
                    } else if (errorData.has_completed_transaction) {
                        toast.success('Pembayaran sudah selesai! Mengarahkan ke halaman kursus...');
                        router.visit(route('courses.show', course.id));
                        return;
                    }
                } else if (response.status === 422 && errorData.is_free) {
                    toast.info('Kursus ini gratis dan tidak memerlukan pembayaran.');
                    router.visit(route('courses.show', course.id));
                    return;
                }

                throw new Error(errorData.message || 'Gagal membuat transaksi');
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
            toast.error('Gagal membuat transaksi. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // Check payment status periodically for successful payments
    const checkEnrollmentStatusAndRedirect = async () => {
        try {
            // First check if user is now enrolled (payment was successful)
            const enrollmentResponse = await fetch(route('api.user.enrollment.check', course.id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCSRFToken(),
                },
            });

            if (enrollmentResponse.ok) {
                const enrollmentData = await enrollmentResponse.json();
                if (enrollmentData.is_enrolled) {
                    clearTransactionFromSession();
                    toast.success('Pendaftaran berhasil! Mengarahkan ke halaman kursus...');
                    router.visit(route('courses.learn', course.id));
                } else {
                    // Still not enrolled, check again in 3 seconds
                    setTimeout(() => {
                        checkEnrollmentStatusAndRedirect();
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error checking enrollment:', error);
            // Fallback: redirect to course show page
            setTimeout(() => {
                router.visit(route('courses.show', course.id));
            }, 3000);
        }
    };

    const embedSnapPayment = () => {
        console.log('[Payment] embedSnapPayment called', {
            snapToken: !!snapToken,
            container: !!snapContainerRef.current,
            windowSnap: !!window.snap,
            isEmbedding,
            hasAttemptedEmbed,
        });

        if (!snapToken || !snapContainerRef.current || isEmbedding || hasAttemptedEmbed) {
            console.warn('[Payment] Embed conditions not met');
            return;
        }

        setIsEmbedding(true);
        setHasAttemptedEmbed(true);

        // Clear container first
        snapContainerRef.current.innerHTML = '';

        console.log('[Payment] Starting Snap embed with token:', snapToken.substring(0, 20) + '...');

        // Set timeout to detect embed failure
        const embedTimeout = setTimeout(() => {
            console.warn('[Payment] Embed timeout - assuming failure');
            if (isEmbedding) {
                setIsEmbedding(false);
                setSnapEmbedFailed(true);
                if (transaction?.payment_details?.redirect_url) {
                    setFallbackReady(true);
                    toast.info('Form pembayaran gagal dimuat. Gunakan link alternatif.');
                }
            }
        }, 15000); // 15 seconds timeout

        try {
            // IMPORTANT: Ensure window.snap exists before calling embed
            if (!window.snap) {
                throw new Error('window.snap is not available');
            }

            window.snap.embed(snapToken, {
                embedId: 'snap-container',
                onSuccess: function (result) {
                    console.log('[Payment] Payment success:', result);
                    clearTimeout(embedTimeout);
                    setIsEmbedding(false);
                    setPaymentStatus('processing');

                    // Save success state and redirect
                    if (transaction) {
                        saveTransactionToSession(transaction, snapToken);
                    }

                    toast.success('Pembayaran berhasil! Memproses pendaftaran...');

                    // Start checking enrollment status
                    checkEnrollmentStatusAndRedirect();
                },
                onPending: function (result) {
                    console.log('[Payment] Payment pending:', result);
                    clearTimeout(embedTimeout);
                    setIsEmbedding(false);
                    setPaymentStatus('processing');
                    toast.info('Pembayaran sedang diproses. Mohon menunggu konfirmasi.');
                    setFallbackReady(true);
                },
                onError: function (result) {
                    console.log('[Payment] Payment error:', result);
                    clearTimeout(embedTimeout);
                    setIsEmbedding(false);
                    toast.error('Pembayaran gagal!');
                    setFallbackReady(true);
                },
                onClose: function () {
                    console.log('[Payment] Payment modal closed');
                    clearTimeout(embedTimeout);
                    setIsEmbedding(false);
                    if (paymentStatus === 'pending') {
                        toast.warning('Form pembayaran ditutup');
                    }
                    setFallbackReady(true);
                },
            });

            console.log('[Payment] Snap embed function called successfully');

            // Check if content was embedded after a delay
            setTimeout(() => {
                const container = snapContainerRef.current;
                if (container && container.children.length > 0) {
                    console.log('[Payment] Embed content detected successfully');
                    clearTimeout(embedTimeout);
                    setIsEmbedding(false);
                } else {
                    console.warn('[Payment] No content found in snap container after 10 seconds');
                    // Don't fail immediately, give it more time
                }
            }, 10000); // Check after 10 seconds
        } catch (error) {
            console.error('[Payment] Failed to embed snap payment:', error);
            setIsEmbedding(false);
            setSnapEmbedFailed(true);

            if (transaction?.payment_details?.redirect_url && !redirectTried) {
                console.warn('[Payment] Opening fallback redirect...');
                setRedirectTried(true);
                toast.info('Membuka halaman pembayaran di tab baru...');
                window.open(transaction.payment_details.redirect_url, '_blank');
            }

            toast.error('Gagal memuat form pembayaran. Silakan gunakan link alternatif atau refresh halaman.');
        }
    };

    // Force new transaction: clear session + reset state then trigger creation
    const forceNewTransaction = () => {
        if (forceNewLoading) return;
        setForceNewLoading(true);
        try {
            clearTransactionFromSession();
            setTransaction(undefined);
            setSnapToken(undefined);
            setSnapEmbedFailed(false);
            setHasAttemptedEmbed(false);
            setIsEmbedding(false);
            setPaymentStatus('pending');
            setAutoRefreshed(false);
            setEmbedAttempts(0);
            setTimeout(() => createTransaction(), 1000);
        } finally {
            setForceNewLoading(false);
        }
    };

    // Function to refresh snap token
    const refreshSnapToken = async () => {
        if (!transaction) {
            toast.error('Transaksi tidak ditemukan');
            return;
        }

        setIsRefreshingToken(true);
        try {
            // First clear the current embed state
            setSnapEmbedFailed(false);
            setHasAttemptedEmbed(false);
            setIsEmbedding(false);
            if (snapContainerRef.current) {
                snapContainerRef.current.innerHTML = '';
            }

            // Wait a moment then try to re-embed
            setTimeout(() => {
                if (snapToken) {
                    console.log('[Payment] Re-attempting embed with existing token');
                    embedSnapPayment();
                } else {
                    console.log('[Payment] No existing token, creating new transaction');
                    createTransaction();
                }
            }, 1000);

            toast.info('Memuat ulang form pembayaran...');
        } catch (error) {
            console.error('Error refreshing snap token:', error);
            toast.error('Gagal memuat ulang form pembayaran');
        } finally {
            setTimeout(() => setIsRefreshingToken(false), 2000);
        }
    };

    // Create transaction if not exists (skip if already enrolled or paid)
    useEffect(() => {
        // Only create transaction if:
        // 1. User is not already enrolled or paid
        // 2. No existing transaction
        // 3. No snap token
        // 4. Course is pro and has price
        // 5. Previous transaction expired (if transactionExpired is true)
        // 6. Has attempted to restore from session storage
        const shouldCreateTransaction =
            hasAttemptedRestore && !isAlreadyEnrolled && !isAlreadyPaid && !transaction && !snapToken && course.is_pro && course.price > 0;

        console.log('[Payment] useEffect createTransaction check:', {
            hasAttemptedRestore,
            isAlreadyEnrolled,
            isAlreadyPaid,
            hasTransaction: !!transaction,
            hasSnapToken: !!snapToken,
            isPro: course.is_pro,
            price: course.price,
            shouldCreateTransaction,
            transactionExpired,
        });

        if (shouldCreateTransaction || transactionExpired) {
            console.log('[Payment] Creating transaction...', { shouldCreateTransaction, transactionExpired });
            createTransaction();
        }
    }, [hasAttemptedRestore, isAlreadyEnrolled, isAlreadyPaid, transaction, snapToken, transactionExpired]);

    // Reset embedding state when snapToken changes
    useEffect(() => {
        setIsEmbedding(false);
    }, [snapToken]);

    // Handle embedding when snapToken becomes available
    useEffect(() => {
        const handleTokenChange = async () => {
            if (snapToken && snapContainerRef.current && !snapEmbedFailed && !isEmbedding) {
                console.log('[Payment] SnapToken available, checking if ready to embed...');

                // Double-check that window.snap is available
                let retryCount = 0;
                const maxRetries = 20; // 10 seconds total

                const checkSnapReady = () => {
                    if (window.snap && snapContainerRef.current) {
                        console.log('[Payment] Snap is ready, embedding...');
                        embedSnapPayment();
                        return true;
                    }

                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`[Payment] Snap not ready, retry ${retryCount}/${maxRetries}`);
                        setTimeout(checkSnapReady, 500);
                        return false;
                    } else {
                        console.error('[Payment] Snap still not ready after retries');
                        setSnapEmbedFailed(true);
                        return false;
                    }
                };

                checkSnapReady();
            }
        };

        handleTokenChange();
    }, [snapToken, snapEmbedFailed, isEmbedding]);

    // Auto-detect successful payments and redirect
    useEffect(() => {
        if (paymentStatus === 'completed' && !isAlreadyEnrolled && !isAlreadyPaid) {
            console.log('[Payment] Payment completed, checking enrollment...');
            checkEnrollmentStatusAndRedirect();
        }
    }, [paymentStatus, isAlreadyEnrolled, isAlreadyPaid]);

    // Load Midtrans Snap script (only if not already enrolled or paid)
    useEffect(() => {
        if (isAlreadyEnrolled || isAlreadyPaid) return;
        let cancelled = false;

        const loadAndEmbedSnap = async () => {
            try {
                console.info('[Payment] Starting Snap script loading...');

                // First ensure the script is loaded
                await ensureSnapReady(clientKey, isProduction);
                console.info('[Payment] Snap script loaded successfully');

                if (cancelled) return;

                // Try embedding after script is ready if we have a token
                if (snapToken && !snapEmbedFailed && !hasAttemptedEmbed) {
                    console.info('[Payment] Script ready and token available, attempting embed...');
                    embedSnapPayment();
                }
            } catch (error) {
                console.error('[Payment] Failed to load Snap script:', error);
                if (!cancelled) {
                    setSnapEmbedFailed(true);
                    toast.error('Gagal memuat script pembayaran. Silakan refresh halaman.');
                }
            }
        };

        loadAndEmbedSnap();

        return () => {
            cancelled = true;
        };
    }, [clientKey, isProduction, isAlreadyEnrolled, isAlreadyPaid]);

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
            case 'expired':
                return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default:
                return <CreditCard className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStatusMessage = () => {
        if (isAlreadyEnrolled) {
            return 'Anda sudah terdaftar di kursus ini. Pembayaran telah berhasil dilakukan sebelumnya.';
        }
        if (isAlreadyPaid) {
            return 'Pembayaran telah berhasil! Anda sedang diproses untuk didaftarkan ke kursus ini.';
        }

        switch (paymentStatus) {
            case 'completed':
                return 'Pembayaran berhasil dikonfirmasi! Sedang memproses pendaftaran...';
            case 'processing':
                return 'Menunggu konfirmasi pembayaran dari bank/payment gateway...';
            case 'failed':
                return 'Pembayaran gagal atau transaksi sudah kadaluarsa. Silakan coba lagi.';
            case 'cancelled':
                return 'Pembayaran dibatalkan.';
            case 'expired':
                return 'Transaksi sudah expired. Silakan buat transaksi baru.';
            default:
                if (transaction && snapToken) {
                    return 'Silakan lakukan pembayaran melalui form di bawah ini. Setelah pembayaran selesai, gunakan tombol "Cek Status Pembayaran" untuk memperbarui status.';
                }
                return 'Siap untuk melakukan pembayaran kursus ini.';
        }
    };

    return (
        <>
            <Head title={`Pembayaran - ${course.title}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto max-w-6xl px-4">
                    {/* Back button */}
                    <Button variant="ghost" onClick={() => router.visit(`/courses/${course.id}`)} className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Detail Kursus
                    </Button>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Payment Form Section */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pembayaran Kursus</CardTitle>
                                    <CardDescription>Lakukan pembayaran untuk mengakses kursus premium</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Status Message */}
                                    <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                                        {getStatusIcon()}
                                        <div className="flex-1">
                                            <span className="text-sm">{getStatusMessage()}</span>
                                            {transactionExpired && expiredMessage && <p className="mt-1 text-xs text-orange-600">{expiredMessage}</p>}
                                            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                                            {transaction && paymentStatus === 'pending' && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                                                    <Clock className="h-3 w-3" />
                                                    Setelah melakukan pembayaran, klik "Cek Status Pembayaran" untuk memperbarui status
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Transaction Expired - Show Create New Button */}
                                    {(transactionExpired || paymentStatus === 'expired') && !snapToken && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <AlertCircle className="mb-4 h-16 w-16 text-orange-500" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Transaksi Expired</h3>
                                            <p className="mb-6 max-w-md text-center text-gray-600">
                                                Transaksi sebelumnya sudah tidak valid. Silakan buat transaksi baru untuk melanjutkan pembayaran.
                                            </p>
                                            <Button onClick={handleExpiredTransaction} disabled={isCreatingTransaction} size="lg">
                                                {isCreatingTransaction ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Membuat Transaksi...
                                                    </>
                                                ) : (
                                                    'Buat Transaksi Baru'
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Error State - Show Create New Button */}
                                    {error && !snapToken && !transactionExpired && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <XCircle className="mb-4 h-16 w-16 text-red-500" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Terjadi Kesalahan</h3>
                                            <p className="mb-6 max-w-md text-center text-gray-600">{error}</p>
                                            <Button onClick={createNewTransaction} disabled={isCreatingTransaction} size="lg">
                                                {isCreatingTransaction ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Mencoba Lagi...
                                                    </>
                                                ) : (
                                                    'Coba Lagi'
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* No Transaction - Show Create Button */}
                                    {!snapToken && !transaction && !transactionExpired && !error && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <CreditCard className="mb-4 h-16 w-16 text-blue-500" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Siap untuk Membayar?</h3>
                                            <p className="mb-6 max-w-md text-center text-gray-600">
                                                Klik tombol di bawah untuk membuat transaksi pembayaran.
                                            </p>
                                            <Button onClick={createNewTransaction} disabled={isCreatingTransaction} size="lg">
                                                {isCreatingTransaction ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Membuat Transaksi...
                                                    </>
                                                ) : (
                                                    'Buat Transaksi Pembayaran'
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Midtrans Snap Embed Container */}
                                    {isAlreadyEnrolled ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Sudah Terdaftar</h3>
                                            <p className="mb-6 text-center text-gray-600">
                                                Anda sudah terdaftar di kursus ini dan dapat mengaksesnya sekarang.
                                            </p>
                                            <Button onClick={() => router.visit(`/courses/${course.id}/learn`)}>Mulai Belajar</Button>
                                        </div>
                                    ) : isAlreadyPaid ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Clock className="mb-4 h-16 w-16 text-yellow-500" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Pembayaran Berhasil</h3>
                                            <p className="mb-6 text-center text-gray-600">
                                                Pembayaran Anda telah berhasil! Proses pendaftaran sedang berlangsung.
                                            </p>
                                            <Button onClick={() => router.visit(`/courses/${course.id}`)} variant="outline">
                                                Kembali ke Kursus
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Snap Container */}
                                            {snapToken && <div id="snap-container" ref={snapContainerRef} className="min-h-[400px] w-full" />}

                                            {/* Loading State */}
                                            {isLoading && !snapToken && (
                                                <div className="flex flex-col items-center justify-center py-12">
                                                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
                                                    <p className="text-gray-600">Memproses pembayaran...</p>
                                                </div>
                                            )}

                                            {/* Manual status check and refresh buttons */}
                                            {snapToken && transaction && (
                                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                                    {/* Check status button for pending transactions */}
                                                    {paymentStatus === 'pending' && (
                                                        <Button
                                                            onClick={checkTransactionStatus}
                                                            disabled={isCheckingStatus}
                                                            variant="default"
                                                            size="sm"
                                                        >
                                                            {isCheckingStatus ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Mengecek Status...
                                                                </>
                                                            ) : (
                                                                'Cek Status Pembayaran'
                                                            )}
                                                        </Button>
                                                    )}

                                                    {/* Refresh form button */}
                                                    <Button variant="outline" onClick={refreshSnapToken} disabled={isRefreshingToken} size="sm">
                                                        {isRefreshingToken ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Memuat Ulang...
                                                            </>
                                                        ) : (
                                                            'Muat Ulang Form'
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Help text */}
                                            {snapToken && transaction && paymentStatus === 'pending' && (
                                                <div className="mt-3 text-center">
                                                    <p className="text-xs text-gray-500">Tidak melihat form pembayaran? Klik "Muat Ulang Form"</p>
                                                    <p className="text-xs text-gray-500">
                                                        Sudah bayar tapi status belum berubah? Klik "Cek Status Pembayaran"
                                                    </p>
                                                    {fallbackReady && transaction.payment_details?.redirect_url && (
                                                        <p className="mt-2 text-xs text-orange-600">
                                                            Fallback tersedia:{' '}
                                                            <a
                                                                className="underline"
                                                                href={transaction.payment_details.redirect_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Buka halaman Midtrans langsung
                                                            </a>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
                                        <h4 className="mb-2 font-semibold">Metode Pembayaran yang Tersedia:</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• Transfer Bank (BCA, BNI, BRI, Mandiri, dll)</li>
                                            <li>• E-Wallet (GoPay, OVO, DANA, ShopeePay)</li>
                                            <li>• QRIS</li>
                                            <li>• Kartu Kredit/Debit</li>
                                            <li>• Indomaret/Alfamart</li>
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-2 font-semibold">Catatan Penting:</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• Pembayaran akan dikonfirmasi otomatis dalam 1-5 menit</li>
                                            <li>• Jika pembayaran tidak terkonfirmasi, klik "Cek Status Pembayaran"</li>
                                            <li>• Akses kursus akan diberikan setelah pembayaran berhasil</li>
                                            <li>• Hubungi support jika mengalami kendala</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Course Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle>Ringkasan Pesanan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <img
                                            src={course.thumbnail || '/placeholder-course.jpg'}
                                            alt={course.title}
                                            className="aspect-video w-full rounded-lg object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{course.title}</h3>
                                        <p className="text-sm text-gray-600">{course.category.name}</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Harga Kursus</span>
                                            <span>{formatRupiah(course.price)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Biaya Admin</span>
                                            <span>Gratis</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Bayar</span>
                                            <span className="text-lg">{formatRupiah(course.price)}</span>
                                        </div>
                                    </div>
                                    {transaction && (
                                        <div className="mt-4">
                                            <p className="text-xs text-gray-500">
                                                Order ID: <span className="font-mono">{transaction.midtrans_order_id}</span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
