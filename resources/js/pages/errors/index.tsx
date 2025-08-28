import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
    status: number;
    message?: string;
}

export default function ErrorPage({ status, message }: ErrorPageProps) {
    const errorMessages: Record<number, { title: string; description: string; emoji: string }> = {
        400: {
            title: 'Bad Request',
            description: 'Permintaan tidak dapat diproses karena kesalahan sintaks.',
            emoji: '❌'
        },
        401: {
            title: 'Tidak Terautentikasi',
            description: 'Anda harus login untuk mengakses halaman ini.',
            emoji: '🔐'
        },
        402: {
            title: 'Pembayaran Diperlukan',
            description: 'Akses ke halaman ini memerlukan pembayaran.',
            emoji: '💳'
        },
        403: {
            title: 'Akses Ditolak',
            description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
            emoji: '🚫'
        },
        404: {
            title: 'Halaman Tidak Ditemukan',
            description: 'Halaman yang Anda cari tidak dapat ditemukan.',
            emoji: '🔍'
        },
        405: {
            title: 'Metode Tidak Diizinkan',
            description: 'Metode request tidak diizinkan untuk resource ini.',
            emoji: '⛔'
        },
        408: {
            title: 'Request Timeout',
            description: 'Server timeout menunggu request.',
            emoji: '⏱️'
        },
        419: {
            title: 'Sesi Berakhir',
            description: 'Sesi Anda telah berakhir. Silakan refresh halaman.',
            emoji: '⏱️'
        },
        422: {
            title: 'Data Tidak Valid',
            description: 'Data yang dikirimkan tidak dapat diproses.',
            emoji: '📝'
        },
        429: {
            title: 'Terlalu Banyak Request',
            description: 'Anda telah mengirim terlalu banyak request. Silakan coba lagi nanti.',
            emoji: '🚦'
        },
        500: {
            title: 'Kesalahan Server',
            description: 'Terjadi kesalahan pada server kami.',
            emoji: '⚠️'
        },
        502: {
            title: 'Bad Gateway',
            description: 'Server menerima respons yang tidak valid.',
            emoji: '🌐'
        },
        503: {
            title: 'Layanan Tidak Tersedia',
            description: 'Server sedang dalam pemeliharaan atau kelebihan beban.',
            emoji: '🔧'
        },
        504: {
            title: 'Gateway Timeout',
            description: 'Server tidak menerima respons tepat waktu.',
            emoji: '⏳'
        }
    };

    const error = errorMessages[status] || {
        title: `Error ${status}`,
        description: message || 'Terjadi kesalahan yang tidak terduga.',
        emoji: '❓'
    };

    const getBackgroundGradient = () => {
        if (status >= 400 && status < 500) {
            return 'from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800';
        }
        return 'from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800';
    };

    return (
        <>
            <Head title={`${status} - ${error.title}`} />
            <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackgroundGradient()}`}>
                <div className="max-w-md w-full px-6 py-8">
                    <div className="text-center">
                        {/* Error Code Illustration */}
                        <div className="relative">
                            <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">{status}</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">{error.emoji}</div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
                            {error.title}
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {error.description}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="inline-flex items-center"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                            <Link href="/">
                                <Button className="inline-flex items-center w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" />
                                    Ke Beranda
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Error Details */}
                        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                Error Code: {status}<br/>
                                Time: {new Date().toLocaleString('id-ID')}
                            </p>
                        </div>
                        
                        {/* Support Link */}
                        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            <p>Butuh bantuan?</p>
                            <a 
                                href="mailto:support@example.com" 
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Hubungi Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}