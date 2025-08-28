import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Error503() {
    const [retryIn, setRetryIn] = useState(30);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setRetryIn((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.reload();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="503 - Service Unavailable" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full px-6 py-8">
                    <div className="text-center">
                        {/* 503 Illustration */}
                        <div className="relative">
                            <h1 className="text-9xl font-bold text-purple-100 dark:text-purple-900/30">503</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">🔧</div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
                            Sedang Dalam Pemeliharaan
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Kami sedang melakukan pemeliharaan sistem untuk memberikan layanan yang lebih baik. 
                            Silakan coba lagi dalam beberapa saat.
                        </p>
                        
                        {/* Auto Retry Counter */}
                        <div className="mt-6 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                Otomatis mencoba lagi dalam {retryIn} detik...
                            </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                onClick={handleRefresh}
                                variant="outline"
                                className="inline-flex items-center"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Coba Sekarang
                            </Button>
                            <Link href="/">
                                <Button className="inline-flex items-center w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" />
                                    Ke Beranda
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Maintenance Info */}
                        <div className="mt-12 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                                <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Apa yang sedang kami lakukan?
                            </h3>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 text-left">
                                <li>• Meningkatkan performa sistem</li>
                                <li>• Menambahkan fitur baru</li>
                                <li>• Memperbaiki bug yang dilaporkan</li>
                                <li>• Meningkatkan keamanan</li>
                            </ul>
                        </div>
                        
                        {/* Support Link */}
                        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            <p>Ikuti update kami di</p>
                            <div className="flex justify-center gap-4 mt-2">
                                <a 
                                    href="#" 
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Twitter
                                </a>
                                <span>•</span>
                                <a 
                                    href="mailto:support@example.com" 
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}