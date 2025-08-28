import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';

export default function Error500() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="500 - Server Error" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full px-6 py-8">
                    <div className="text-center">
                        {/* 500 Illustration */}
                        <div className="relative">
                            <h1 className="text-9xl font-bold text-red-100 dark:text-red-900/30">500</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">⚠️</div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
                            Terjadi Kesalahan Server
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Maaf, terjadi kesalahan pada server kami. 
                            Tim teknis kami telah diberitahu dan sedang menangani masalah ini.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                onClick={handleRefresh}
                                variant="outline"
                                className="inline-flex items-center"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Coba Lagi
                            </Button>
                            <Link href="/">
                                <Button className="inline-flex items-center w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" />
                                    Ke Beranda
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Error Details (if available) */}
                        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                Error Code: 500<br/>
                                Time: {new Date().toLocaleString('id-ID')}
                            </p>
                        </div>
                        
                        {/* Additional Help */}
                        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            <p>Jika masalah berlanjut, silakan</p>
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