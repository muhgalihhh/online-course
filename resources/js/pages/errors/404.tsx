import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <Head title="404 - Page Not Found" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full px-6 py-8">
                    <div className="text-center">
                        {/* 404 Illustration */}
                        <div className="relative">
                            <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">🔍</div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
                            Oops! Halaman Tidak Ditemukan
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                            Mungkin halaman telah dipindahkan atau dihapus.
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
                        
                        {/* Additional Help */}
                        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
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