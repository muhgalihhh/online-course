import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

export default function Error419() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="419 - Session Expired" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full px-6 py-8">
                    <div className="text-center">
                        {/* 419 Illustration */}
                        <div className="relative">
                            <h1 className="text-9xl font-bold text-blue-100 dark:text-blue-900/30">419</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">⏱️</div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
                            Sesi Telah Berakhir
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Sesi Anda telah berakhir karena tidak ada aktivitas. 
                            Silakan refresh halaman untuk melanjutkan.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                onClick={handleRefresh}
                                className="inline-flex items-center"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Halaman
                            </Button>
                            <Link href="/">
                                <Button 
                                    variant="outline"
                                    className="inline-flex items-center w-full sm:w-auto"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Ke Beranda
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Security Note */}
                        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                💡 Tip: Sesi berakhir otomatis untuk menjaga keamanan akun Anda. 
                                Pastikan untuk logout jika menggunakan komputer publik.
                            </p>
                        </div>
                        
                        {/* Support Link */}
                        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            <p>Mengalami masalah?</p>
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