import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { CheckCircle, MessageCircle, Settings, Zap } from 'lucide-react';

const LiveChatDemo = () => {
    return (
        <GuestLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900">Live Chat Widget Demo</h1>
                        <p className="text-lg text-gray-600">Tawk.to Live Chat dengan styling kustom dan auto-close feature</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Features Card */}
                        <Card className="border-blue-200 bg-white/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                    Fitur Live Chat
                                </CardTitle>
                                <CardDescription>Fitur-fitur yang telah ditingkatkan pada live chat widget</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Custom styling dengan gradient biru</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Auto-close setelah 1 pesan dari user</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Hover animation dan shadow effects</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">User attributes otomatis terisi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Mobile-responsive design</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Dark mode compatibility</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How it Works Card */}
                        <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-green-600" />
                                    Cara Kerja Auto-Close
                                </CardTitle>
                                <CardDescription>Alur kerja fitur auto-close pada chat widget</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">
                                        1
                                    </Badge>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">User mengirim pesan pertama</p>
                                        <p className="text-xs text-gray-500">Chat widget mendeteksi pesan dari visitor</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">
                                        2
                                    </Badge>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Menunggu balasan agent (8 detik)</p>
                                        <p className="text-xs text-gray-500">Jika tidak ada balasan, chat akan ter-minimize</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">
                                        3
                                    </Badge>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Agent membalas pesan</p>
                                        <p className="text-xs text-gray-500">Chat tetap terbuka untuk waktu membaca</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">
                                        4
                                    </Badge>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Auto-minimize setelah 15 detik</p>
                                        <p className="text-xs text-gray-500">Memberikan waktu cukup untuk membaca balasan</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Usage Instructions */}
                    <Card className="mt-6 border-purple-200 bg-white/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-purple-600" />
                                Cara Menggunakan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Live Chat Widget akan muncul di pojok kanan bawah halaman dengan styling yang telah diperbaiki. Lihat widget chat
                                    di pojok kanan bawah halaman ini untuk mencoba fitur baru.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary">Custom Styling</Badge>
                                    <Badge variant="secondary">Auto-Close</Badge>
                                    <Badge variant="secondary">User Tracking</Badge>
                                    <Badge variant="secondary">Mobile Ready</Badge>
                                </div>
                                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Tip:</strong> Widget akan otomatis minimize setelah percakapan selesai untuk memberikan pengalaman
                                        yang lebih bersih dan tidak mengganggu browsing user.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Button */}
                    <div className="mt-8 text-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            onClick={() => {
                                // Open live chat if available
                                if (window.Tawk_API?.maximize) {
                                    window.Tawk_API.maximize();
                                }
                            }}
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Test Live Chat Widget
                        </Button>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default LiveChatDemo;
