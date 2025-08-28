import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, LogIn } from 'lucide-react';

export default function Error403() {
    return (
        <>
            <Head title="403 - Access Forbidden" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full px-6 py-8">
                    <div className="text-center">
                        {/* 403 Illustration */}
                        <div className="relative">
                            <h1 className="text-9xl font-bold text-yellow-100 dark:text-yellow-900/30">403</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">🚫</div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
                            Akses Ditolak
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
                            Silakan login dengan akun yang memiliki akses atau hubungi administrator.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/login">
                                <Button 
                                    variant="outline"
                                    className="inline-flex items-center w-full sm:w-auto"
                                >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Login
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button className="inline-flex items-center w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" />
                                    Ke Beranda
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Jika Anda yakin seharusnya memiliki akses ke halaman ini, 
                                silakan hubungi administrator sistem.
                            </p>
                        </div>
                        
                        {/* Support Link */}
                        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
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