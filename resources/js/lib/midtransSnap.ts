// Midtrans Snap script loader utility
// Ensures single load, provides Promise-based API, timeout + retry, and readiness check

let snapPromise: Promise<typeof window.snap | null> | null = null;

interface LoadOptions {
    clientKey: string;
    isProduction: boolean;
    timeoutMs?: number;
    maxRetries?: number;
    delayBetweenRetriesMs?: number;
}

function wait(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

async function attemptLoadScript(src: string, clientKey: string, timeout: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Already present?
        if (typeof window !== 'undefined' && (window as any).snap) {
            return resolve(true);
        }

        // Reuse existing tag if src matches
        const existing = document.querySelector(`script[data-midtrans-snap="true"]`);
        if (existing) {
            // If still loading, attach listeners
            if ((window as any).snap) return resolve(true);
        }

        const script = existing || document.createElement('script');
        script.src = src.includes('?') ? `${src}&client-key=${clientKey}` : `${src}?client-key=${clientKey}`;
        script.async = true;
        script.setAttribute('data-client-key', clientKey);
        script.setAttribute('data-midtrans-snap', 'true');

        let done = false;

        const cleanup = () => {
            script.removeEventListener('load', onLoad);
            script.removeEventListener('error', onError);
        };

        const onLoad = () => {
            if (done) return;
            done = true;
            cleanup();
            resolve(!!(window as any).snap);
        };
        const onError = (e) => {
            if (done) return;
            done = true;
            cleanup();
            reject(e);
        };

        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);

        if (!existing) document.head.appendChild(script);

        // Timeout
        setTimeout(() => {
            if (done) return;
            done = true;
            cleanup();
            resolve(!!(window as any).snap); // resolve false if still not available
        }, timeout);
    });
}

export async function loadSnapScript(opts: LoadOptions): Promise<typeof window.snap | null> {
    const { clientKey, isProduction, timeoutMs = 8000, maxRetries = 3, delayBetweenRetriesMs = 1200 } = opts;

    if (snapPromise) return snapPromise;

    snapPromise = (async () => {
        const base = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const ok = await attemptLoadScript(base, clientKey, timeoutMs);
                if (ok && (window as any).snap) {
                    console.info('[MidtransSnap] Loaded snap.js (attempt ' + attempt + ')');
                    return (window as any).snap;
                }
                console.warn('[MidtransSnap] snap.js not ready after attempt', attempt);
            } catch (e) {
                console.error('[MidtransSnap] Error loading snap.js attempt', attempt, e);
            }
            if (attempt < maxRetries) await wait(delayBetweenRetriesMs * attempt); // exponential-ish
        }

        console.error('[MidtransSnap] Failed to load snap.js after retries');
        return null;
    })();

    return snapPromise;
}

export async function ensureSnapReady(opts: LoadOptions & { pollIntervalMs?: number; maxWaitMs?: number }): Promise<typeof window.snap | null> {
    const { pollIntervalMs = 200, maxWaitMs = 5000, ...rest } = opts;
    const snap = await loadSnapScript(rest);
    if (!snap) return null;

    const start = Date.now();
    while (!(window as any).snap) {
        if (Date.now() - start > maxWaitMs) break;
        await wait(pollIntervalMs);
    }
    return (window as any).snap || null;
}
