import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ensureSnapReady } from '@/lib/midtransSnap';
import { formatRupiah } from '@/lib/utils';
import { type Course, type Transaction } from '@/types';
import type { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, CreditCard, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

declare global {
    interface Window {
        snap: {
            embed: (
                token: string,
                options: {
                    embedId: string;
                    onSuccess: (result: unknown) => void;
                    onPending: (result: unknown) => void;
                    onError: (result: unknown) => void;
                    onClose: () => void;
                },
            ) => void;
        };
    }
}

interface PaymentPageProps extends PageProps {
    course: Course;
    transaction?: Transaction;
    snapToken?: string;
    clientKey: string;
    isProduction: boolean;
    isAlreadyEnrolled?: boolean;
    isAlreadyPaid?: boolean;
    transactionExpired?: boolean;
    expiredMessage?: string;
    error?: string;
    auth: { user: { id: number; name: string; email: string } };
}

export default function PaymentPage({
    course,
    transaction: initialTransaction,
    snapToken: initialSnapToken,
    clientKey,
    isProduction,
    isAlreadyEnrolled = false,
    isAlreadyPaid = false,
    transactionExpired = false,
    expiredMessage,
    error,
}: PaymentPageProps) {
    const { auth } = usePage<PaymentPageProps>().props;
    const [isLoading, setIsLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | undefined>(initialTransaction);
    const [snapToken, setSnapToken] = useState<string | undefined>(initialSnapToken);
    const snapContainerRef = useRef<HTMLDivElement>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired'>(
        isAlreadyEnrolled || isAlreadyPaid ? 'completed' : transactionExpired ? 'expired' : 'pending',
    );
    const [snapEmbedFailed, setSnapEmbedFailed] = useState(false);
    const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
    const [hasAttemptedEmbed, setHasAttemptedEmbed] = useState(false);
    const [isEmbedding, setIsEmbedding] = useState(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [fallbackReady, setFallbackReady] = useState(false);
    const [forceNewLoading, setForceNewLoading] = useState(false);

    // Debug logging
    console.log('[Payment] Component initialized:', {
        hasInitialTransaction: !!initialTransaction,
        hasInitialSnapToken: !!initialSnapToken,
        isAlreadyEnrolled,
        isAlreadyPaid,
        transactionExpired,
        expiredMessage,
        error,
        paymentStatus,
    });

    // Session storage keys for persistence
    const TRANSACTION_STORAGE_KEY = `payment_transaction_${course.id}`;
    const SNAP_TOKEN_STORAGE_KEY = `payment_snap_token_${course.id}`;

    // Save transaction state to session storage
    const saveTransactionToSession = (transactionData: Transaction, snapTokenData: string) => {
        try {
            sessionStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(transactionData));
            sessionStorage.setItem(SNAP_TOKEN_STORAGE_KEY, snapTokenData);
            sessionStorage.setItem(`${TRANSACTION_STORAGE_KEY}_timestamp`, Date.now().toString());
        } catch (error) {
            console.warn('Failed to save transaction to session storage:', error);
        }
    };

    // Clear transaction state from session storage
    const clearTransactionFromSession = () => {
        try {
            sessionStorage.removeItem(TRANSACTION_STORAGE_KEY);
            sessionStorage.removeItem(SNAP_TOKEN_STORAGE_KEY);
            sessionStorage.removeItem(`${TRANSACTION_STORAGE_KEY}_timestamp`);
        } catch (error) {
            console.warn('Failed to clear transaction from session storage:', error);
        }
    };

    // Create new transaction
    const createNewTransaction = async () => {
        if (isCreatingTransaction) return;

        setIsCreatingTransaction(true);
        setSnapEmbedFailed(false);

        try {
            console.log('[Payment] Creating new transaction...');

            const response = await fetch(`/payments/courses/${course.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Transaction created successfully
                console.log('[Payment] Transaction created successfully:', data.order_id);

                const newTransaction: Transaction = {
                    id: Date.now(), // Temporary ID
                    midtrans_order_id: data.order_id,
                    user_id: auth.user.id,
                    transactionable_id: course.id,
                    transactionable_type: 'App\\Models\\Course',
                    amount: course.price,
                    status: 'pending',
                    payment_method: null,
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

                // Save to session storage
                saveTransactionToSession(newTransaction, data.snap_token);

                toast.success(data.existing_transaction ? 'Melanjutkan pembayaran...' : 'Transaksi berhasil dibuat!');
            } else if (response.status === 410) {
                // Previous transaction expired
                toast.warning(data.message || 'Transaksi sebelumnya sudah expired. Membuat transaksi baru...');
                // Retry creating new transaction
                setTimeout(() => createNewTransaction(), 1000);
                return;
            } else if (response.status === 409) {
                // Already enrolled or has completed transaction
                if (data.is_enrolled) {
                    toast.success('Anda sudah terdaftar di kursus ini!');
                    router.visit(`/courses/${course.id}/learn`);
                } else if (data.has_completed_transaction) {
                    toast.success('Pembayaran sudah selesai!');
                    router.visit(`/courses/${course.id}`);
                }
                return;
            } else {
                throw new Error(data.message || 'Gagal membuat transaksi');
            }
        } catch (error) {
            console.error('[Payment] Failed to create transaction:', error);
            toast.error('Gagal membuat transaksi. Silakan coba lagi.');
        } finally {
            setIsCreatingTransaction(false);
        }
    };

    // Handle retry for expired transaction
    const handleExpiredTransaction = () => {
        clearTransactionFromSession();
        setTransaction(undefined);
        setSnapToken(undefined);
        setPaymentStatus('pending');
        createNewTransaction();
    };

    // Check transaction status manually
    const checkTransactionStatus = async () => {
        if (!transaction?.midtrans_order_id) {
            toast.error('Transaksi tidak ditemukan');
            return;
        }

        setIsCheckingStatus(true);
        try {
            const response = await fetch(`/api/transactions/status/${transaction.midtrans_order_id}`, {
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
                    clearTransactionFromSession();

                    // Redirect after success
                    setTimeout(() => {
                        router.visit(`/courses/${course.id}/learn`);
                    }, 2000);
                } else if (['expired', 'failed', 'cancelled'].includes(data.status)) {
                    setPaymentStatus(data.status);
                    toast.error('Transaksi sudah tidak valid');
                    clearTransactionFromSession();
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

    // Refresh snap token by creating new transaction
    const refreshSnapToken = async () => {
        setIsRefreshingToken(true);
        setSnapEmbedFailed(false);

        try {
            // Clear existing transaction data
            clearTransactionFromSession();
            setTransaction(undefined);
            setSnapToken(undefined);

            // Create new transaction
            await createNewTransaction();
        } catch (error) {
            console.error('Failed to refresh snap token:', error);
            toast.error('Gagal memuat ulang form pembayaran');
        } finally {
            setIsRefreshingToken(false);
        }
    };

    // Force new transaction for troubleshooting
    const forceNewTransaction = async () => {
        setForceNewLoading(true);

        try {
            clearTransactionFromSession();
            setTransaction(undefined);
            setSnapToken(undefined);
            setSnapEmbedFailed(false);
            setPaymentStatus('pending');

            await createNewTransaction();
        } catch (error) {
            console.error('Failed to force new transaction:', error);
            toast.error('Gagal membuat transaksi baru');
        } finally {
            setForceNewLoading(false);
        }
    };

    // Alias for backward compatibility
    const createTransaction = () => createNewTransaction();

    // Auto-create transaction if needed
    useEffect(() => {
        // Only create transaction if we have no existing transaction/token and conditions are met
        if (
            !isAlreadyEnrolled &&
            !isAlreadyPaid &&
            !transaction &&
            !snapToken &&
            course.is_pro &&
            course.price > 0 &&
            !isCreatingTransaction &&
            (transactionExpired || (!initialTransaction && !initialSnapToken))
        ) {
            console.log('[Payment] Auto-creating transaction due to missing data');
            createNewTransaction();
        }
    }, [
        isAlreadyEnrolled,
        isAlreadyPaid,
        transaction,
        snapToken,
        course.is_pro,
        course.price,
        transactionExpired,
        initialTransaction,
        initialSnapToken,
        isCreatingTransaction,
    ]);

    // Load Midtrans Snap script and embed when token is available
    useEffect(() => {
        if (isAlreadyEnrolled || isAlreadyPaid || !snapToken) return;

        let cancelled = false;

        const loadAndEmbedSnap = async () => {
            try {
                console.log('[Payment] Loading Snap script and embedding...');

                // Ensure Snap script is loaded
                await ensureSnapReady(clientKey, isProduction);

                if (cancelled) return;

                // Embed Snap payment
                embedSnapPayment();
            } catch (error) {
                console.error('[Payment] Failed to load Snap:', error);
                if (!cancelled) {
                    setSnapEmbedFailed(true);
                    toast.error('Gagal memuat form pembayaran');
                }
            }
        };

        loadAndEmbedSnap();

        return () => {
            cancelled = true;
        };
    }, [snapToken, isAlreadyEnrolled, isAlreadyPaid, clientKey, isProduction]);

    // Embed Snap Payment
    const embedSnapPayment = async () => {
        if (!snapToken || !snapContainerRef.current || isEmbedding || hasAttemptedEmbed) {
            console.log('[Payment] Embed conditions not met:', {
                hasToken: !!snapToken,
                hasContainer: !!snapContainerRef.current,
                isEmbedding,
                hasAttemptedEmbed,
            });
            return;
        }

        setIsEmbedding(true);
        setHasAttemptedEmbed(true);

        try {
            console.log('[Payment] Starting Snap embed...');

            // Clear container first
            if (snapContainerRef.current) {
                snapContainerRef.current.innerHTML = '';
            }

            // Ensure window.snap is available
            if (!window.snap) {
                throw new Error('Midtrans Snap not loaded');
            }

            // Embed with callbacks
            window.snap.embed(snapToken, {
                embedId: 'snap-container',
                onSuccess: function (result) {
                    console.log('[Payment] Payment success:', result);
                    setPaymentStatus('processing');
                    toast.success('Pembayaran berhasil! Menunggu konfirmasi...');

                    // Save success state to session
                    if (transaction) {
                        saveTransactionToSession(transaction, snapToken);
                    }
                },
                onPending: function (result) {
                    console.log('[Payment] Payment pending:', result);
                    setPaymentStatus('processing');
                    toast.info('Pembayaran sedang diproses...');
                },
                onError: function (result) {
                    console.log('[Payment] Payment error:', result);
                    setPaymentStatus('failed');
                    toast.error('Pembayaran gagal!');
                },
                onClose: function () {
                    console.log('[Payment] Payment modal closed');
                    if (paymentStatus === 'pending') {
                        toast.warning('Form pembayaran ditutup');
                    }
                    setFallbackReady(true);
                },
            });

            console.log('[Payment] Snap embed completed successfully');
        } catch (error) {
            console.error('[Payment] Failed to embed Snap payment:', error);
            setSnapEmbedFailed(true);
            toast.error('Gagal memuat form pembayaran');

            // Show fallback redirect if available
            if (transaction?.payment_details?.redirect_url) {
                setFallbackReady(true);
                toast.info('Gunakan link alternatif untuk pembayaran');
            }
        } finally {
            setIsEmbedding(false);
        }
    };

    // Try to restore transaction state from session storage on component mount
    useEffect(() => {
        if (!hasAttemptedRestore && !isAlreadyEnrolled && !isAlreadyPaid && !initialTransaction && !initialSnapToken) {
            const savedState = loadTransactionFromSession();
            if (savedState) {
                // Check if saved token is still valid (less than 2 hours old)
                const ageInHours = savedState.age / (1000 * 60 * 60);
                if (ageInHours < 2) {
                    setTransaction(savedState.transaction);
                    setSnapToken(savedState.snapToken);
                    setPaymentStatus('pending');

                    console.log('Restored transaction from session storage', {
                        order_id: savedState.transaction.midtrans_order_id,
                        age_hours: ageInHours.toFixed(2),
                    });

                    toast.info('Melanjutkan transaksi yang sedang berlangsung...');
                } else {
                    // Token too old, clear and create new
                    console.log('Saved token too old, will create new transaction');
                    clearTransactionFromSession();
                }
            } else {
                console.log('No saved transaction found in session storage');
            }
            setHasAttemptedRestore(true);
        } else if (!hasAttemptedRestore) {
            // If we have initial data, still mark as attempted
            console.log('Initial data provided, marking restore as attempted');
            setHasAttemptedRestore(true);
        }
    }, [hasAttemptedRestore, isAlreadyEnrolled, isAlreadyPaid, initialTransaction, initialSnapToken]);

    // Load Midtrans Snap script (only if not already enrolled or paid)
    useEffect(() => {
        if (isAlreadyEnrolled || isAlreadyPaid) return;
        let cancelled = false;

        const loadAndEmbedSnap = async () => {
            try {
                console.info('[Payment] Starting Snap script loading...');

                // First ensure the script is loaded
                const snap = await ensureSnapReady({
                    clientKey,
                    isProduction,
                    timeoutMs: 20000,
                    maxRetries: 3,
                    maxWaitMs: 10000,
                });

                if (cancelled) return;

                if (!snap) {
                    console.error('[Payment] Snap script failed to load after retries');
                    setSnapEmbedFailed(true);
                    return;
                }

                console.info('[Payment] Snap script loaded successfully');

                // Wait a bit more to ensure everything is ready
                await new Promise((resolve) => setTimeout(resolve, 1000));

                if (cancelled) return;

                // Check if we have a token and container ready
                if (snapToken && snapContainerRef.current && !isEmbedding) {
                    console.info('[Payment] All conditions met, starting embed...');
                    embedSnapPayment();
                } else {
                    console.warn('[Payment] Not ready for embed:', {
                        hasToken: !!snapToken,
                        hasContainer: !!snapContainerRef.current,
                        isEmbedding,
                    });
                }
            } catch (error) {
                console.error('[Payment] Error in loadAndEmbedSnap:', error);
                if (!cancelled) {
                    setSnapEmbedFailed(true);
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

    // Manual function to check transaction status (removed auto-polling)
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
    }, [snapToken, snapEmbedFailed, isEmbedding]); // Function to get CSRF token
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
                    Accept: 'application/json',
                },
            });

            console.log('Response received:', response.status, response.statusText);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Network error' }));
                console.error('API Error:', error);

                // Handle CSRF token mismatch
                if (response.status === 419) {
                    toast.error('Session expired. Refreshing page...');
                    setTimeout(() => window.location.reload(), 1000);
                    return;
                }

                // Handle specific error cases
                if (response.status === 409) {
                    if (error.is_enrolled) {
                        toast.info('Anda sudah terdaftar di kursus ini. Mengarahkan ke halaman kursus...');
                        setTimeout(() => {
                            router.visit(route('courses.learn', course.id));
                        }, 1500);
                        return;
                    } else if (error.has_completed_transaction) {
                        toast.info('Pembayaran sudah selesai. Mengarahkan ke halaman kursus...');
                        setTimeout(() => {
                            router.visit(route('courses.show', course.id));
                        }, 1500);
                        return;
                    }
                }

                throw new Error(error.message || 'Failed to create transaction');
            }

            const data = await response.json();
            console.log('Transaction data received:', data);

            // Validate response data
            if (!data.order_id || !data.snap_token) {
                throw new Error('Invalid response: missing order_id or snap_token');
            }

            // Check if using existing transaction or new one
            if (data.existing_transaction) {
                // Using existing transaction
                toast.info('Menggunakan transaksi yang sudah ada');
                console.log('Using existing transaction:', data.order_id);
            } else {
                // New transaction created
                toast.success('Transaksi baru berhasil dibuat');
                console.log('Created new transaction:', data.order_id);
            }

            // Create a transaction object based on response
            const transactionData = {
                id: data.order_id,
                midtrans_order_id: data.order_id,
                status: 'pending',
                amount: course.price,
                user_id: auth.user.id,
                transactionable_id: course.id,
                transactionable_type: 'Course',
                payment_method: null,
                payment_details: {
                    snap_token: data.snap_token,
                    redirect_url: data.redirect_url,
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as Transaction;

            console.log('Setting transaction state:', transactionData);
            setTransaction(transactionData);
            setSnapToken(data.snap_token);

            // Save to session storage for refresh recovery
            if (data.snap_token) {
                console.log('Saving transaction to session storage');
                saveTransactionToSession(transactionData, data.snap_token);
            }

            // If we got a snap token, payment status is ready for payment
            if (data.snap_token) {
                console.log('Setting payment status to pending');
                setPaymentStatus('pending');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal membuat transaksi';
            console.error('Create transaction error:', error);
            toast.error(`Gagal membuat transaksi: ${errorMessage}`);
            setPaymentStatus('failed');
            setSnapEmbedFailed(true);
        } finally {
            setIsLoading(false);
            console.log('createTransaction function completed');
        }
    };

    const embedSnapPayment = () => {
        console.log('[Payment] embedSnapPayment called', {
            snapToken: !!snapToken,
            windowSnap: !!window.snap,
            container: !!snapContainerRef.current,
            isEmbedding,
        });

        if (!snapToken) {
            console.warn('[Payment] Cannot embed: no snapToken');
            return;
        }

        if (!window.snap) {
            console.warn('[Payment] Cannot embed: window.snap not available');
            return;
        }

        if (!snapContainerRef.current) {
            console.warn('[Payment] Cannot embed: container not available');
            return;
        }

        if (isEmbedding) {
            console.warn('[Payment] Already embedding, skipping...');
            return;
        }

        // Set embedding state immediately
        setIsEmbedding(true);
        console.log('[Payment] Starting embed process...');

        // Clear container first
        if (snapContainerRef.current) {
            snapContainerRef.current.innerHTML = '';
        }

        setSnapEmbedFailed(false);
        setEmbedAttempts((n) => n + 1);

        try {
            console.log('[Payment] Calling window.snap.embed with token:', snapToken.substring(0, 20) + '...');

            // Use a timeout to handle if embed doesn't respond
            const embedTimeout = setTimeout(() => {
                console.error('[Payment] Embed timeout - no response from Midtrans');
                setIsEmbedding(false);
                setSnapEmbedFailed(true);
                toast.error('Form pembayaran tidak dapat dimuat. Silakan coba refresh halaman.');
            }, 30000); // 30 seconds timeout

            window.snap.embed(snapToken, {
                embedId: 'snap-container',
                onSuccess: function (result: unknown) {
                    console.log('[Payment] Payment success:', result);
                    clearTimeout(embedTimeout);
                    setPaymentStatus('completed');
                    setIsEmbedding(false);
                    toast.success('Pembayaran berhasil!');
                    clearTransactionFromSession();
                    checkEnrollmentStatusAndRedirect();
                },
                onPending: function (result: unknown) {
                    console.log('[Payment] Payment pending:', result);
                    clearTimeout(embedTimeout);
                    setPaymentStatus('processing');
                    setIsEmbedding(false);
                    toast.info('Pembayaran sedang diproses...');
                },
                onError: function (result: unknown) {
                    console.log('[Payment] Payment error:', result);
                    clearTimeout(embedTimeout);
                    setPaymentStatus('failed');
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
            setIsEmbedding(false);
            setEmbedAttempts(0);
            setAutoRefreshed(false);
            setFallbackReady(false);
            setRedirectTried(false);
            toast.info('Membuat transaksi baru...');
            // useEffect createTransaction akan jalan otomatis
        } finally {
            setTimeout(() => setForceNewLoading(false), 400);
        }
    };

    // Function to refresh snap token
    const refreshSnapToken = async () => {
        if (!transaction) {
            toast.error('Transaksi tidak ditemukan');
            return;
        }

        setIsRefreshingToken(true);
        setSnapEmbedFailed(false); // Reset failed state

        try {
            const csrfToken = getCSRFToken();
            if (!csrfToken) return; // Page will refresh

            const response = await fetch(route('payments.refresh-token', transaction.midtrans_order_id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Network error' }));

                // Handle CSRF token mismatch
                if (response.status === 419) {
                    toast.error('Session expired. Refreshing page...');
                    setTimeout(() => window.location.reload(), 1000);
                    return;
                }

                // Handle transaction not found
                if (response.status === 404) {
                    toast.error('Transaksi sudah tidak berlaku. Membuat transaksi baru...');
                    clearTransactionFromSession();
                    setTransaction(undefined);
                    setSnapToken(undefined);
                    // Will trigger creation of new transaction via useEffect
                    return;
                }

                throw new Error(error.message || 'Failed to refresh token');
            }

            const data = await response.json();

            if (!data.snap_token || !data.order_id) {
                throw new Error('Invalid response: missing snap_token or order_id');
            }

            setSnapToken(data.snap_token);
            setTransaction(data.transaction);
            setSnapEmbedFailed(false);
            setIsEmbedding(false);

            // Save to session storage for refresh recovery
            if (data.snap_token && data.transaction) {
                saveTransactionToSession(data.transaction, data.snap_token);
            }

            toast.success('Token pembayaran berhasil diperbaharui');
        } catch (error: unknown) {
            console.error('Failed to refresh snap token:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memperbaharui token pembayaran';
            toast.error(`${errorMessage}. Silakan refresh halaman.`);
            setSnapEmbedFailed(true);
        } finally {
            setIsRefreshingToken(false);
        }
    };

    // Function to check enrollment status and redirect to course
    const checkEnrollmentStatusAndRedirect = async () => {
        try {
            const response = await fetch(route('api.user.enrollment.check', course.id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.is_enrolled) {
                    toast.success('Pendaftaran berhasil! Mengarahkan ke halaman kursus...');
                    setTimeout(() => {
                        router.visit(route('courses.learn', course.id));
                    }, 2000);
                } else {
                    toast.info('Pembayaran berhasil, sedang memproses pendaftaran...');
                    // Check again after a short delay
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
            default:
                if (transaction && transaction.id) {
                    // Check if this was restored from session
                    const savedState = loadTransactionFromSession();
                    if (savedState && savedState.transaction.midtrans_order_id === transaction.midtrans_order_id) {
                        return 'Melanjutkan transaksi yang sedang berlangsung. Silakan lakukan pembayaran melalui form di bawah ini.';
                    }
                    return 'Silakan lakukan pembayaran melalui form di bawah ini. Setelah pembayaran selesai, gunakan tombol "Cek Status Pembayaran" untuk memperbarui status.';
                }
                return 'Silakan lakukan pembayaran melalui form di bawah ini.';
        }
    };

    return (
        <>
            <Head title={`Pembayaran - ${course.title}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto max-w-6xl px-4">
                    {/* Back button */}
                    <Button variant="ghost" onClick={() => router.visit(route('courses.show', course.id))} className="mb-6">
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

                                    {/* Midtrans Snap Embed Container or Success Message */}
                                    {/* Midtrans Snap Embed Container or Success Message */}
                                    {isAlreadyEnrolled ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                                            <h3 className="mb-2 text-lg font-semibold">Pembayaran Sudah Berhasil</h3>
                                            <p className="mb-6 text-center text-gray-600">
                                                Anda sudah melakukan pembayaran untuk kursus ini dan sudah terdaftar.
                                            </p>
                                            <Button onClick={() => router.visit(route('courses.learn', course.id))} className="mb-3">
                                                Mulai Belajar
                                            </Button>
                                            <Button variant="outline" onClick={() => router.visit(route('courses.show', course.id))}>
                                                Kembali ke Detail Kursus
                                            </Button>
                                        </div>
                                    ) : isAlreadyPaid ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <CheckCircle className="mb-4 h-16 w-16 text-blue-500" />
                                            <h3 className="mb-2 text-lg font-semibold">Pembayaran Sudah Dibayar</h3>
                                            <p className="mb-6 text-center text-gray-600">
                                                Pembayaran untuk kursus ini sudah berhasil. Sedang diproses untuk mendaftarkan Anda ke kursus.
                                            </p>
                                            <p className="mb-6 text-center text-sm text-orange-600">
                                                Jika dalam 5 menit Anda belum bisa mengakses kursus, silakan hubungi admin.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button onClick={() => window.location.reload()} variant="outline">
                                                    Refresh Halaman
                                                </Button>
                                                <Button variant="outline" onClick={() => router.visit(route('courses.show', course.id))}>
                                                    Kembali ke Detail Kursus
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isLoading || isEmbedding ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="ml-3">{isLoading ? 'Memuat form pembayaran...' : 'Memuat interface pembayaran...'}</span>
                                        </div>
                                    ) : snapEmbedFailed || (transactionExpired && !isLoading) ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <AlertCircle className="mb-4 h-16 w-16 text-orange-500" />
                                            <h3 className="mb-2 text-lg font-semibold">Form Pembayaran Tidak Dapat Dimuat</h3>
                                            <p className="mb-4 text-center text-gray-600">
                                                {transactionExpired
                                                    ? 'Transaksi pembayaran sudah kadaluarsa.'
                                                    : 'Token pembayaran sudah tidak berlaku.'}
                                            </p>
                                            <p className="mb-6 text-center text-sm text-gray-500">
                                                Silakan klik tombol di bawah untuk mendapatkan form pembayaran yang baru.
                                            </p>
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                {transaction ? (
                                                    <Button onClick={refreshSnapToken} disabled={isRefreshingToken}>
                                                        {isRefreshingToken ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Memuat Ulang...
                                                            </>
                                                        ) : (
                                                            'Muat Ulang Form Pembayaran'
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button onClick={createTransaction} disabled={isLoading}>
                                                        {isLoading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Membuat Transaksi...
                                                            </>
                                                        ) : (
                                                            'Buat Transaksi Baru'
                                                        )}
                                                    </Button>
                                                )}
                                                <Button variant="outline" onClick={forceNewTransaction} disabled={forceNewLoading}>
                                                    {forceNewLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Reset...
                                                        </>
                                                    ) : (
                                                        'Paksa Transaksi Baru'
                                                    )}
                                                </Button>
                                                <Button variant="outline" onClick={() => window.location.reload()}>
                                                    Refresh Halaman
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Debug info for development */}
                                            {process.env.NODE_ENV === 'development' && (
                                                <div className="mb-4 rounded bg-gray-100 p-2 text-xs">
                                                    <div>Snap Ready: {window.snap ? '✅' : '❌'}</div>
                                                    <div>Token: {snapToken ? '✅' : '❌'}</div>
                                                    <div>Container: {snapContainerRef.current ? '✅' : '❌'}</div>
                                                    <div>Embedding: {isEmbedding ? '⏳' : '✅'}</div>
                                                </div>
                                            )}

                                            <div id="snap-container" ref={snapContainerRef} className="min-h-[400px] w-full" />

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

                                                    {/* Manual embed trigger for debugging */}
                                                    {process.env.NODE_ENV === 'development' && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                console.log('[Payment] Manual embed trigger');
                                                                setIsEmbedding(false);
                                                                setSnapEmbedFailed(false);
                                                                embedSnapPayment();
                                                            }}
                                                            size="sm"
                                                        >
                                                            Force Embed
                                                        </Button>
                                                    )}
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
                                            <li>• Kartu Kredit/Debit</li>
                                            <li>• Virtual Account</li>
                                            <li>• Retail (Indomaret, Alfamart)</li>
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-2 font-semibold">Catatan:</h4>
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
                                        {(course.thumbnail || course.thumbnail_path) && (
                                            <img
                                                src={course.thumbnail || `/storage/${course.thumbnail_path}`}
                                                alt={course.title}
                                                className="h-32 w-full rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold">{course.title}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{course.category?.name}</p>
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
