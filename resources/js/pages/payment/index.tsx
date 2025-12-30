import { router, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ensureSnapReady } from '../../lib/midtransSnap';

// Types (align with backend fields)
type TransactionStatus = 'idle' | 'creating' | 'pending' | 'processing' | 'completed' | 'expired' | 'failed' | 'cancelled' | 'error';
type PaymentGateway = 'midtrans' | 'flip';

interface Course {
    id: number;
    title: string;
    price: number;
    is_pro: boolean;
    thumbnail?: string | null;
    category?: { id: number; name: string } | null;
    institution?: { id: number; name: string } | null;
}

interface TransactionDto {
    id: number;
    midtrans_order_id?: string | null;
    flip_bill_id?: string | null;
    payment_gateway?: string;
    status: string;
    payment_method?: string | null;
    payment_details?: Record<string, unknown> | null;
}

interface ServerPageProps {
    course: Course;
    transaction?: TransactionDto | null;
    snapToken?: string | null;
    paymentUrl?: string | null;
    billId?: string | null;
    clientKey?: string | null;
    isProduction: boolean;
    isAlreadyEnrolled?: boolean;
    isAlreadyPaid?: boolean;
    transactionExpired?: boolean;
    expiredMessage?: string;
    error?: string;
    defaultGateway: PaymentGateway;
}

interface CreateTransactionResponse {
    gateway: PaymentGateway;
    order_id?: string;
    bill_id?: string;
    snap_token?: string;
    payment_url?: string;
    redirect_url?: string | null;
    client_key?: string;
    is_production?: boolean;
    existing_transaction: boolean;
}

interface CheckStatusResponse {
    order_id: string;
    status: TransactionStatus | 'completed';
    gateway: PaymentGateway;
    is_expired: boolean;
}

// LocalStorage key builder (scoped per user-course)
const buildStorageKey = (userId: number, courseId: number) => `pay:course:${courseId}:user:${userId}`;

interface PersistedPayment {
    orderId: string;
    snapToken?: string;
    paymentUrl?: string;
    gateway: PaymentGateway;
    createdAt: number;
    courseId: number;
    userId: number;
    status: TransactionStatus;
    heuristicExpiryAt?: number;
}

// Heuristic expiry assignment
function guessExpiry(createdAt: number, paymentMethod?: string | null, gateway?: PaymentGateway): number | undefined {
    const HOURS = 60 * 60 * 1000;
    const MIN = 60 * 1000;

    // Flip default expiry is 24h
    if (gateway === 'flip') {
        return createdAt + 24 * HOURS;
    }

    if (!paymentMethod) return createdAt + 24 * HOURS;
    switch (paymentMethod) {
        case 'gopay':
        case 'shopeepay':
            return createdAt + 15 * MIN;
        case 'qris':
            return createdAt + 30 * MIN;
        case 'indomaret':
        case 'alfamart':
            return createdAt + 48 * HOURS;
        default:
            return createdAt + 24 * HOURS;
    }
}

// Load Midtrans snap script only once
let snapScriptLoading: Promise<void> | null = null;
function ensureSnapScript(clientKey: string, isProduction: boolean): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();

    const w = window as unknown as { snap?: { embed: (...args: unknown[]) => void } };
    if (w.snap) {
        console.log('[ensureSnapScript] Snap already available');
        return Promise.resolve();
    }

    if (snapScriptLoading) {
        console.log('[ensureSnapScript] Script already loading...');
        return snapScriptLoading;
    }

    console.log('[ensureSnapScript] Starting to load script...');

    snapScriptLoading = (async () => {
        try {
            const snap = await ensureSnapReady({
                clientKey,
                isProduction,
                timeoutMs: 15000,
                maxRetries: 4,
                delayBetweenRetriesMs: 2000,
                pollIntervalMs: 500,
                maxWaitMs: 10000,
            });

            if (!snap) {
                throw new Error('Failed to load Midtrans Snap script - snap object not available');
            }

            if (typeof snap.embed !== 'function') {
                throw new Error('Snap object loaded but embed method not available');
            }

            console.info('[ensureSnapScript] Snap script loaded successfully with embed method');
        } catch (error) {
            console.error('[ensureSnapScript] Failed to load Snap script:', error);
            snapScriptLoading = null;
            throw error;
        }
    })();

    return snapScriptLoading;
}

interface UsePaymentArgs {
    userId: number;
    course: Course;
    initialSnapToken?: string | null;
    initialPaymentUrl?: string | null;
    initialTransaction?: TransactionDto | null;
    clientKey?: string | null;
    isProduction: boolean;
    defaultGateway: PaymentGateway;
}

interface UsePaymentReturn {
    status: TransactionStatus;
    orderId?: string;
    snapToken?: string;
    paymentUrl?: string;
    gateway: PaymentGateway;
    error?: string;
    isLoading: boolean;
    isFinal: boolean;
    startOrReuse: () => Promise<void>;
    cancel: () => Promise<void>;
    refreshStatus: () => Promise<void>;
    openFlipPayment: () => void;
    timeRemainingMs?: number;
}

const POLL_INTERVAL_MS = 15_000;
const FAST_POLL_INTERVAL_MS = 5_000;

function usePaymentTransaction(args: UsePaymentArgs): UsePaymentReturn {
    const { userId, course, initialSnapToken, initialPaymentUrl, initialTransaction, clientKey, isProduction, defaultGateway } = args;
    const storageKey = useMemo(() => buildStorageKey(userId, course.id), [userId, course.id]);

    const [gateway, setGateway] = useState<PaymentGateway>(() => {
        return (initialTransaction?.payment_gateway as PaymentGateway) || defaultGateway;
    });

    const [status, setStatus] = useState<TransactionStatus>(() => {
        if (initialTransaction?.status === 'completed') return 'completed';
        if (initialTransaction?.status && ['pending', 'processing'].includes(initialTransaction.status)) return 'pending';
        return 'idle';
    });

    const [orderId, setOrderId] = useState<string | undefined>(() => {
        return initialTransaction?.midtrans_order_id || initialTransaction?.flip_bill_id || undefined;
    });

    const [snapToken, setSnapToken] = useState<string | undefined>(() => initialSnapToken || undefined);
    const [paymentUrl, setPaymentUrl] = useState<string | undefined>(() => initialPaymentUrl || undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [timeRemainingMs, setTimeRemainingMs] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const pollTimerRef = useRef<number | null>(null);

    // Restore persisted payment if still relevant
    useEffect(() => {
        if (status !== 'idle') return;
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const data: PersistedPayment = JSON.parse(raw);
            if (data.courseId !== course.id || data.userId !== userId) return;
            if (Date.now() - data.createdAt > 48 * 3600 * 1000) {
                localStorage.removeItem(storageKey);
                return;
            }
            if (['pending', 'processing'].includes(data.status)) {
                setOrderId(data.orderId);
                setGateway(data.gateway);
                if (data.snapToken) setSnapToken(data.snapToken);
                if (data.paymentUrl) setPaymentUrl(data.paymentUrl);
                setStatus('pending');
                computeRemaining(data.heuristicExpiryAt);
            }
        } catch {
            /* ignore */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist whenever critical fields change
    useEffect(() => {
        if (!orderId) return;
        if (!['pending', 'processing', 'creating'].includes(status)) return;

        const raw = localStorage.getItem(storageKey);
        let prev: PersistedPayment | undefined;
        if (raw) {
            try {
                prev = JSON.parse(raw);
            } catch {
                /* ignore */
            }
        }
        const createdAt = prev?.createdAt ?? Date.now();
        const heuristicExpiryAt = prev?.heuristicExpiryAt ?? guessExpiry(createdAt, initialTransaction?.payment_method, gateway);
        const data: PersistedPayment = {
            orderId,
            snapToken,
            paymentUrl,
            gateway,
            createdAt,
            heuristicExpiryAt,
            courseId: course.id,
            userId,
            status,
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
    }, [orderId, snapToken, paymentUrl, gateway, status, storageKey, course.id, userId, initialTransaction?.payment_method]);

    // Clear persistence when final
    useEffect(() => {
        if (['completed', 'expired', 'failed', 'cancelled', 'error'].includes(status)) {
            const raw = localStorage.getItem(storageKey);
            if (raw) localStorage.removeItem(storageKey);
        }
    }, [status, storageKey]);

    const computeRemaining = (expiryAt?: number) => {
        if (!expiryAt) {
            setTimeRemainingMs(undefined);
            return;
        }
        const rem = expiryAt - Date.now();
        setTimeRemainingMs(rem > 0 ? rem : 0);
    };

    // Countdown effect
    useEffect(() => {
        if (timeRemainingMs == null) return;
        if (timeRemainingMs <= 0) return;
        const id = window.setInterval(() => {
            setTimeRemainingMs((prev) => (prev != null ? Math.max(prev - 1000, 0) : prev));
        }, 1000);
        return () => clearInterval(id);
    }, [timeRemainingMs]);

    const loadSnap = useCallback(async () => {
        if (clientKey) {
            await ensureSnapScript(clientKey, isProduction);
        }
    }, [clientKey, isProduction]);

    const startOrReuse = useCallback(async () => {
        if (status === 'pending' && orderId && (snapToken || paymentUrl)) return;
        setIsLoading(true);
        setError(undefined);
        setStatus('creating');
        try {
            const res = await fetch(`/payments/courses/${course.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify({ gateway: defaultGateway }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.message || 'Gagal membuat transaksi');
            }
            const data: CreateTransactionResponse = await res.json();

            setGateway(data.gateway);
            setOrderId(data.order_id || data.bill_id);

            if (data.gateway === 'flip' && data.payment_url) {
                setPaymentUrl(data.payment_url);
                setSnapToken(undefined);
            } else if (data.snap_token) {
                setSnapToken(data.snap_token);
                setPaymentUrl(undefined);
                await loadSnap();
            }

            setStatus('pending');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [course.id, status, orderId, snapToken, paymentUrl, loadSnap, defaultGateway]);

    const cancel = useCallback(async () => {
        if (!orderId) return;
        setIsLoading(true);
        try {
            await fetch(`/api/transactions/${orderId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            setStatus('cancelled');
            setOrderId(undefined);
            setSnapToken(undefined);
            setPaymentUrl(undefined);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal membatalkan');
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    const refreshStatus = useCallback(async () => {
        if (!orderId) return;
        try {
            const res = await fetch(`/api/transactions/${orderId}/status`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'include',
            });
            if (!res.ok) return;
            const data: CheckStatusResponse = await res.json();
            if (data.status === 'completed') {
                setStatus('completed');

                // Trigger verify and enroll endpoint
                try {
                    const verifyRes = await fetch(`/payments/${orderId}/verify-and-enroll`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN':
                                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.getAttribute('content') || '',
                        },
                        credentials: 'include',
                    });

                    if (verifyRes.ok) {
                        const verifyData = await verifyRes.json();
                        console.log('[Payment] Verification response:', verifyData);

                        if (verifyData.enrolled && verifyData.redirect_url) {
                            setTimeout(() => {
                                window.location.href = verifyData.redirect_url;
                            }, 1000);
                            return;
                        }
                    }
                } catch (verifyError) {
                    console.error('[Payment] Failed to verify and enroll:', verifyError);
                }

                // Fallback: Navigate to learning page after short delay
                setTimeout(() => {
                    router.visit(`/courses/${course.id}/learn`);
                }, 1500);
            } else if (data.is_expired || data.status === 'expired') {
                setStatus('expired');
            } else if (['pending', 'processing'].includes(data.status)) {
                setStatus('pending');
            } else if (data.status === 'failed') {
                setStatus('failed');
            }
        } catch {
            /* ignore polling errors */
        }
    }, [orderId, course.id]);

    const openFlipPayment = useCallback(() => {
        if (paymentUrl) {
            window.open(paymentUrl, '_blank');
        }
    }, [paymentUrl]);

    // Polling logic
    useEffect(() => {
        if (!orderId || !['pending', 'processing'].includes(status)) return;
        let cancelled = false;
        const start = Date.now();
        const tick = async () => {
            if (cancelled) return;
            await refreshStatus();
            if (['pending', 'processing'].includes(status)) {
                const elapsed = Date.now() - start;
                const interval = elapsed < 60_000 ? FAST_POLL_INTERVAL_MS : POLL_INTERVAL_MS;
                pollTimerRef.current = window.setTimeout(tick, interval);
            }
        };
        pollTimerRef.current = window.setTimeout(tick, 3000);
        return () => {
            cancelled = true;
            if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
        };
    }, [orderId, status, refreshStatus]);

    // Load snap automatically if server already gave token (Midtrans only)
    useEffect(() => {
        if (snapToken && clientKey) {
            loadSnap();
        }
    }, [snapToken, clientKey, loadSnap]);

    const isFinal = ['completed', 'expired', 'failed', 'cancelled', 'error'].includes(status);

    return {
        status,
        orderId,
        snapToken,
        paymentUrl,
        gateway,
        error,
        isLoading,
        isFinal,
        startOrReuse,
        cancel,
        refreshStatus,
        openFlipPayment,
        timeRemainingMs,
    };
}

// Midtrans Snap Embed Component
const SnapEmbed: React.FC<{
    token: string;
    onSuccess: () => void;
    onPending: () => void;
    onError: (msg?: string) => void;
    clientKey: string;
    isProduction: boolean;
}> = ({ token, onSuccess, onPending, onError, clientKey, isProduction }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const invokedRef = useRef(false);
    const [isSnapReady, setIsSnapReady] = useState(false);

    useEffect(() => {
        const loadSnap = async () => {
            try {
                console.log('[SnapEmbed] Loading snap script...');
                await ensureSnapScript(clientKey, isProduction);
                console.log('[SnapEmbed] Snap script loaded successfully');
                setIsSnapReady(true);
            } catch (error) {
                console.error('[SnapEmbed] Failed to load Snap script:', error);
                onError('Gagal memuat script pembayaran. Silakan refresh halaman.');
            }
        };

        loadSnap();
    }, [clientKey, isProduction, onError]);

    useEffect(() => {
        if (!token || !isSnapReady) {
            console.log('[SnapEmbed] Not ready yet:', { token: !!token, isSnapReady });
            return;
        }

        console.log('[SnapEmbed] Ready to embed, checking snap object...');

        const w = window as unknown as {
            snap?: {
                embed: (
                    t: string,
                    cfg: {
                        embedId: string;
                        onSuccess: () => void;
                        onPending: () => void;
                        onError: (res: { status_message?: string }) => void;
                        onClose: () => void;
                    },
                ) => void;
            };
        };

        if (!w.snap) {
            console.error('[SnapEmbed] Snap object not available after loading');
            onError('Script pembayaran tidak tersedia. Silakan refresh halaman.');
            return;
        }

        console.log('[SnapEmbed] Snap object available:', !!w.snap.embed);

        if (!containerRef.current) {
            console.error('[SnapEmbed] Container not ready');
            return;
        }

        console.log('[SnapEmbed] Container ready:', containerRef.current.id);

        if (invokedRef.current) {
            console.log('[SnapEmbed] Already invoked, skipping');
            return;
        }

        invokedRef.current = true;

        try {
            console.info('[SnapEmbed] Embedding Snap with token:', token.substring(0, 15) + '...');
            containerRef.current.innerHTML = '';

            w.snap.embed(token, {
                embedId: 'snap-container',
                onSuccess: () => {
                    console.info('[SnapEmbed] Snap payment success callback triggered');
                    onSuccess();
                },
                onPending: () => {
                    console.info('[SnapEmbed] Snap payment pending callback triggered');
                    onPending();
                },
                onError: (res) => {
                    console.error('[SnapEmbed] Snap payment error callback:', res);
                    onError(res?.status_message || 'Snap error');
                },
                onClose: () => {
                    console.info('[SnapEmbed] Snap closed by user');
                },
            });

            console.info('[SnapEmbed] Snap embed called successfully');
        } catch (e) {
            console.error('[SnapEmbed] Error calling snap.embed:', e);
            onError(e instanceof Error ? e.message : 'Snap error');
        }
    }, [token, onSuccess, onPending, onError, isSnapReady]);

    return (
        <div className="w-full">
            {!isSnapReady && (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="mb-2 text-sm text-gray-600">Memuat metode pembayaran...</div>
                        <div className="h-1 w-48 overflow-hidden rounded bg-gray-200">
                            <div className="h-full animate-pulse bg-indigo-500"></div>
                        </div>
                    </div>
                </div>
            )}
            <div id="snap-container" ref={containerRef} className={`w-full ${!isSnapReady ? 'hidden' : ''}`} />
        </div>
    );
};

// Flip Payment Component
const FlipPaymentPanel: React.FC<{
    paymentUrl: string;
    onOpenPayment: () => void;
    onRefresh: () => void;
    isLoading: boolean;
}> = ({ paymentUrl, onOpenPayment, onRefresh, isLoading }) => {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-medium text-blue-800">Pembayaran via Flip</h3>
                <p className="mb-4 text-sm text-blue-700">
                    Klik tombol di bawah untuk membuka halaman pembayaran Flip. Setelah melakukan pembayaran, kembali ke halaman ini dan klik
                    "Cek Status Pembayaran".
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={onOpenPayment}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                        Buka Halaman Pembayaran
                    </button>
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        )}
                        Cek Status Pembayaran
                    </button>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500">
                Halaman pembayaran akan terbuka di tab baru. Pastikan popup tidak diblokir oleh browser Anda.
            </p>
        </div>
    );
};

// Time formatting helper
function formatRemaining(ms?: number) {
    if (ms == null) return '';
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}j ${m}m ${s}d`;
    if (m > 0) return `${m}m ${s}d`;
    return `${s}d`;
}

const PaymentPage: React.FC = () => {
    const page = usePage();
    const props = page.props as unknown as ServerPageProps & { auth: { user: { id: number; name: string } } };
    const {
        course,
        snapToken: initialSnapToken,
        paymentUrl: initialPaymentUrl,
        transaction: initialTransaction,
        clientKey,
        isProduction,
        isAlreadyEnrolled,
        isAlreadyPaid,
        transactionExpired,
        expiredMessage,
        error: initError,
        defaultGateway,
    } = props;
    const userId = props.auth.user.id;

    const payment = usePaymentTransaction({
        userId,
        course,
        initialSnapToken: initialSnapToken || undefined,
        initialPaymentUrl: initialPaymentUrl || undefined,
        initialTransaction: initialTransaction || undefined,
        clientKey: clientKey || undefined,
        isProduction,
        defaultGateway,
    });

    const { status, orderId, snapToken, paymentUrl, gateway, error, isLoading, startOrReuse, cancel, refreshStatus, openFlipPayment, timeRemainingMs } =
        payment;

    // Derived UI flags
    const showMidtransSnap = gateway === 'midtrans' && snapToken && ['pending', 'processing'].includes(status);
    const showFlipPayment = gateway === 'flip' && paymentUrl && ['pending', 'processing'].includes(status);

    const handlePayClick = () => {
        if (['pending', 'processing'].includes(status)) return;
        startOrReuse();
    };

    const statusLabel: Record<TransactionStatus, string> = {
        idle: 'Menunggu inisiasi',
        creating: 'Membuat transaksi...',
        pending: 'Menunggu pembayaran',
        processing: 'Memproses...',
        completed: 'Pembayaran berhasil',
        expired: 'Transaksi kedaluwarsa',
        failed: 'Pembayaran gagal',
        cancelled: 'Dibatalkan',
        error: 'Terjadi kesalahan',
    };

    const gatewayLabel: Record<PaymentGateway, string> = {
        midtrans: 'Midtrans',
        flip: 'Flip',
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Pembayaran Kursus</h1>

            {initError && <div className="rounded bg-red-100 p-3 text-red-700">{initError}</div>}
            {isAlreadyEnrolled && <div className="rounded bg-green-100 p-3 text-green-700">Anda sudah terdaftar.</div>}
            {isAlreadyPaid && <div className="rounded bg-green-100 p-3 text-green-700">Pembayaran sudah selesai.</div>}
            {transactionExpired && (
                <div className="rounded bg-yellow-100 p-3 text-yellow-800">{expiredMessage || 'Transaksi sebelumnya telah kedaluwarsa.'}</div>
            )}

            {/* Course Info Card */}
            <div className="flex gap-4 rounded-lg border p-4 shadow-sm">
                {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="h-20 w-32 rounded object-cover" />}
                <div className="flex-1">
                    <h2 className="text-lg font-medium">{course.title}</h2>
                    <p className="text-sm text-gray-600">Harga: Rp {course.price.toLocaleString('id-ID')}</p>
                    {orderId && <p className="mt-1 text-xs text-gray-500">Order ID: {orderId}</p>}
                    <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm font-medium">Status: {statusLabel[status]}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">via {gatewayLabel[gateway]}</span>
                    </div>
                    {['pending', 'processing'].includes(status) && timeRemainingMs != null && (
                        <p className="text-xs text-gray-500">Sisa waktu estimasi: {formatRemaining(timeRemainingMs)}</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                {status === 'idle' && (
                    <button disabled={isLoading} onClick={handlePayClick} className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
                        Mulai Pembayaran
                    </button>
                )}
                {status === 'creating' && <span className="text-sm text-gray-600">Membuat transaksi...</span>}
                {['pending', 'processing'].includes(status) && (
                    <button onClick={cancel} disabled={isLoading} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50">
                        Batalkan
                    </button>
                )}
                {status === 'expired' && (
                    <button disabled={isLoading} onClick={handlePayClick} className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
                        Buat Transaksi Baru
                    </button>
                )}
                {status === 'failed' && (
                    <button disabled={isLoading} onClick={handlePayClick} className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
                        Coba Lagi
                    </button>
                )}
                {status === 'cancelled' && (
                    <button disabled={isLoading} onClick={handlePayClick} className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
                        Transaksi Baru
                    </button>
                )}
            </div>

            {error && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

            {/* Midtrans Snap Embed */}
            {showMidtransSnap && clientKey && (
                <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-medium">Selesaikan Pembayaran</h3>
                    <SnapEmbed
                        key={snapToken}
                        token={snapToken!}
                        clientKey={clientKey}
                        isProduction={isProduction}
                        onSuccess={() => {
                            /* Will poll -> completed */
                        }}
                        onPending={() => {
                            /* remain pending */
                        }}
                        onError={(msg) => {
                            console.error('Snap error', msg);
                        }}
                    />
                    <p className="mt-2 text-xs text-gray-500">Jangan tutup halaman ini sampai pembayaran selesai.</p>
                </div>
            )}

            {/* Flip Payment Panel */}
            {showFlipPayment && (
                <div className="rounded-lg border p-4">
                    <FlipPaymentPanel paymentUrl={paymentUrl!} onOpenPayment={openFlipPayment} onRefresh={refreshStatus} isLoading={isLoading} />
                </div>
            )}

            {/* Success State */}
            {status === 'completed' && (
                <div className="rounded-lg bg-green-100 p-4 text-green-700">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Pembayaran berhasil! Mengarahkan ke kursus...</span>
                    </div>
                </div>
            )}

            {/* Expired State */}
            {status === 'expired' && (
                <div className="rounded-lg bg-yellow-100 p-4 text-yellow-800">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Transaksi kedaluwarsa. Silakan buat transaksi baru.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
