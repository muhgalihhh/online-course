import { router, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types (align with backend fields)
type TransactionStatus = 'idle' | 'creating' | 'pending' | 'processing' | 'completed' | 'expired' | 'failed' | 'cancelled' | 'error';

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
    midtrans_order_id: string;
    status: string;
    payment_method?: string | null;
    payment_details?: Record<string, unknown> | null;
}

interface ServerPageProps {
    course: Course;
    transaction?: TransactionDto | null; // Raw transaction object from backend if provided
    snapToken?: string | null;
    clientKey: string;
    isProduction: boolean;
    isAlreadyEnrolled?: boolean;
    isAlreadyPaid?: boolean;
    transactionExpired?: boolean;
    expiredMessage?: string;
    error?: string;
}

interface CreateTransactionResponse {
    order_id: string;
    snap_token: string;
    redirect_url?: string | null;
    client_key: string;
    is_production: boolean;
    existing_transaction: boolean;
}

interface CheckStatusResponse {
    order_id: string;
    status: TransactionStatus | 'completed';
    midtrans_status: string;
    is_expired: boolean;
}

// LocalStorage key builder (scoped per user-course)
const buildStorageKey = (userId: number, courseId: number) => `pay:course:${courseId}:user:${userId}`;

interface PersistedPayment {
    orderId: string;
    snapToken: string;
    createdAt: number; // epoch ms
    courseId: number;
    userId: number;
    status: TransactionStatus;
    // Optional expiry timestamp if we can infer (Midtrans varies; use 24h fallback for VA, 30m for QR/ewallet heuristics?)
    heuristicExpiryAt?: number;
}

// Heuristic expiry assignment based on possible payment method (if known later could update)
function guessExpiry(createdAt: number, paymentMethod?: string | null): number | undefined {
    const HOURS = 60 * 60 * 1000;
    const MIN = 60 * 1000;
    if (!paymentMethod) return createdAt + 24 * HOURS; // fallback 24h
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
    if (w.snap) return Promise.resolve();
    if (snapScriptLoading) return snapScriptLoading;
    snapScriptLoading = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.async = true;
        script.dataset.clientKey = clientKey;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Midtrans Snap script'));
        document.head.appendChild(script);
    });
    return snapScriptLoading;
}

interface UsePaymentArgs {
    userId: number;
    course: Course;
    initialSnapToken?: string | null;
    initialTransaction?: TransactionDto | null;
    clientKey: string;
    isProduction: boolean;
}

interface UsePaymentReturn {
    status: TransactionStatus;
    orderId?: string;
    snapToken?: string;
    error?: string;
    isLoading: boolean;
    isFinal: boolean;
    startOrReuse: () => Promise<void>;
    cancel: () => Promise<void>;
    refreshStatus: () => Promise<void>;
    timeRemainingMs?: number;
}

const POLL_INTERVAL_MS = 15_000; // 15 seconds
const FAST_POLL_INTERVAL_MS = 5_000; // When user stays on page first minute

function usePaymentTransaction(args: UsePaymentArgs): UsePaymentReturn {
    const { userId, course, initialSnapToken, initialTransaction, clientKey, isProduction } = args;
    const storageKey = useMemo(() => buildStorageKey(userId, course.id), [userId, course.id]);

    const [status, setStatus] = useState<TransactionStatus>(() => {
        if (initialTransaction?.status === 'completed') return 'completed';
        if (initialTransaction?.status && ['pending', 'processing'].includes(initialTransaction.status)) return 'pending';
        return 'idle';
    });
    const [orderId, setOrderId] = useState<string | undefined>(() => initialTransaction?.midtrans_order_id);
    const [snapToken, setSnapToken] = useState<string | undefined>(() => initialSnapToken || undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [timeRemainingMs, setTimeRemainingMs] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const pollTimerRef = useRef<number | null>(null);

    // Restore persisted payment if still relevant
    useEffect(() => {
        if (status !== 'idle') return; // only on first mount when idle
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const data: PersistedPayment = JSON.parse(raw);
            if (data.courseId !== course.id || data.userId !== userId) return;
            // Heuristic validity: if older than 48h treat invalid
            if (Date.now() - data.createdAt > 48 * 3600 * 1000) {
                localStorage.removeItem(storageKey);
                return;
            }
            if (['pending', 'processing'].includes(data.status) && data.snapToken) {
                setOrderId(data.orderId);
                setSnapToken(data.snapToken);
                setStatus('pending');
                computeRemaining(data.heuristicExpiryAt);
            }
        } catch {
            /* ignore */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist whenever critical fields change (only for active states)
    useEffect(() => {
        if (!orderId || !snapToken) return;
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
        const heuristicExpiryAt = prev?.heuristicExpiryAt ?? guessExpiry(createdAt, initialTransaction?.payment_method);
        const data: PersistedPayment = {
            orderId,
            snapToken,
            createdAt,
            heuristicExpiryAt,
            courseId: course.id,
            userId,
            status,
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
    }, [orderId, snapToken, status, storageKey, course.id, userId, initialTransaction?.payment_method]);

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
        await ensureSnapScript(clientKey, isProduction);
    }, [clientKey, isProduction]);

    const startOrReuse = useCallback(async () => {
        if (status === 'pending' && orderId && snapToken) return; // reuse existing
        setIsLoading(true);
        setError(undefined);
        setStatus('creating');
        try {
            // Call backend create
            const res = await fetch(`/payments/courses/${course.id}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({}),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.message || 'Gagal membuat transaksi');
            }
            const data: CreateTransactionResponse = await res.json();
            setOrderId(data.order_id);
            setSnapToken(data.snap_token);
            setStatus('pending');
            await loadSnap();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [course.id, status, orderId, snapToken, loadSnap]);

    const cancel = useCallback(async () => {
        if (!orderId) return;
        setIsLoading(true);
        try {
            await fetch(`/payments/transactions/${orderId}/cancel`, { method: 'DELETE', headers: { Accept: 'application/json' } });
            setStatus('cancelled');
            setOrderId(undefined);
            setSnapToken(undefined);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal membatalkan');
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    const refreshStatus = useCallback(async () => {
        if (!orderId) return;
        try {
            const res = await fetch(`/payments/transactions/${orderId}/status`, { headers: { Accept: 'application/json' } });
            if (!res.ok) return;
            const data: CheckStatusResponse = await res.json();
            if (data.status === 'completed') {
                setStatus('completed');
                // Navigate to learning page after short delay
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
        pollTimerRef.current = window.setTimeout(tick, 3000); // first poll after 3s
        return () => {
            cancelled = true;
            if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
        };
    }, [orderId, status, refreshStatus]);

    // Load snap automatically if server already gave token
    useEffect(() => {
        if (snapToken) {
            loadSnap();
        }
    }, [snapToken, loadSnap]);

    const isFinal = ['completed', 'expired', 'failed', 'cancelled', 'error'].includes(status);

    return { status, orderId, snapToken, error, isLoading, isFinal, startOrReuse, cancel, refreshStatus, timeRemainingMs };
}

// Component to embed snap (use snap embed option)
const SnapEmbed: React.FC<{ token: string; onSuccess: () => void; onPending: () => void; onError: (msg?: string) => void }> = ({
    token,
    onSuccess,
    onPending,
    onError,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const invokedRef = useRef(false);

    useEffect(() => {
        if (!token) return;
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
        if (!w.snap) return;
        if (!containerRef.current) return;
        if (invokedRef.current) return; // idempotent
        invokedRef.current = true;
        try {
            w.snap.embed(token, {
                embedId: 'snap-container',
                onSuccess: () => onSuccess(),
                onPending: () => onPending(),
                onError: (res) => onError(res?.status_message || 'Snap error'),
                onClose: () => {
                    /* user closed */
                },
            });
        } catch (e) {
            onError(e instanceof Error ? e.message : 'Snap error');
        }
    }, [token, onSuccess, onPending, onError]);

    return <div id="snap-container" ref={containerRef} className="w-full" />;
};

// Time formatting helper
function formatRemaining(ms?: number) {
    if (ms == null) return '';
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}j ${m}m ${s}d`; // Indonesian shorthand
    if (m > 0) return `${m}m ${s}d`;
    return `${s}d`;
}

const PaymentPage: React.FC = () => {
    const page = usePage();
    const props = page.props as unknown as ServerPageProps & { auth: { user: { id: number; name: string } } };
    const {
        course,
        snapToken: initialSnapToken,
        transaction: initialTransaction,
        clientKey,
        isProduction,
        isAlreadyEnrolled,
        isAlreadyPaid,
        transactionExpired,
        expiredMessage,
        error: initError,
    } = props;
    const userId = props.auth.user.id;

    const payment = usePaymentTransaction({
        userId,
        course,
        initialSnapToken: initialSnapToken || undefined,
        initialTransaction: initialTransaction || undefined,
        clientKey,
        isProduction,
    });

    const { status, orderId, snapToken, error, isLoading, startOrReuse, cancel, timeRemainingMs } = payment;

    // Derived UI flags
    const showSnap = snapToken && ['pending', 'processing'].includes(status);

    // Auto start if server already provided token (existing transaction). If none, wait for user action.
    useEffect(() => {
        if (initialSnapToken && status === 'pending') {
            // already ready
            return;
        }
    }, [initialSnapToken, status]);

    const handlePayClick = () => {
        if (['pending', 'processing'].includes(status)) return; // already have token
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

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Pembayaran Kursus</h1>
            {initError && <div className="rounded bg-red-100 p-3 text-red-700">{initError}</div>}
            {isAlreadyEnrolled && <div className="rounded bg-green-100 p-3 text-green-700">Anda sudah terdaftar.</div>}
            {isAlreadyPaid && <div className="rounded bg-green-100 p-3 text-green-700">Pembayaran sudah selesai.</div>}
            {transactionExpired && (
                <div className="rounded bg-yellow-100 p-3 text-yellow-800">{expiredMessage || 'Transaksi sebelumnya telah kedaluwarsa.'}</div>
            )}
            <div className="flex gap-4 rounded border p-4">
                {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="h-20 w-32 rounded object-cover" />}
                <div className="flex-1">
                    <h2 className="text-lg font-medium">{course.title}</h2>
                    <p className="text-sm text-gray-600">Harga: Rp {course.price.toLocaleString('id-ID')}</p>
                    {orderId && <p className="mt-1 text-xs text-gray-500">Order ID: {orderId}</p>}
                    <p className="mt-2 text-sm font-medium">Status: {statusLabel[status]}</p>
                    {['pending', 'processing'].includes(status) && timeRemainingMs != null && (
                        <p className="text-xs text-gray-500">Sisa waktu estimasi: {formatRemaining(timeRemainingMs)}</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
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

            {/* Snap Embed */}
            {showSnap && (
                <div className="rounded border p-4">
                    <h3 className="mb-2 font-medium">Selesaikan Pembayaran</h3>
                    <SnapEmbed
                        token={snapToken!}
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

            {status === 'completed' && <div className="rounded bg-green-100 p-4 text-green-700">Pembayaran berhasil! Mengarahkan ke kursus...</div>}
            {status === 'expired' && (
                <div className="rounded bg-yellow-100 p-4 text-yellow-800">Transaksi kedaluwarsa. Silakan buat transaksi baru.</div>
            )}
        </div>
    );
};

export default PaymentPage;
