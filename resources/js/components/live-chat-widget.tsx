import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Minimize2, Maximize2, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from '@inertiajs/react';

interface LiveChatWidgetProps {
    tawkToId?: string;
    tawkToKey?: string;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ 
    tawkToId = "68b08159be8646192a419bab", 
    tawkToKey = "1j3onihr8" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // Only load Tawk.to script if user is authenticated
        if (isAuthenticated) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://embed.tawk.to/${tawkToId}/${tawkToKey}`;
            script.charset = 'UTF-8';
            script.setAttribute('crossorigin', '*');
            
            document.head.appendChild(script);

            return () => {
                // Cleanup script when component unmounts
                const existingScript = document.querySelector(`script[src*="${tawkToId}"]`);
                if (existingScript) {
                    document.head.removeChild(existingScript);
                }
            };
        }
    }, [tawkToId, tawkToKey, isAuthenticated]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isAuthenticated && window.Tawk_API) {
            if (isOpen) {
                window.Tawk_API.hideWidget();
            } else {
                window.Tawk_API.showWidget();
            }
        }
    };

    const minimizeChat = () => {
        setIsMinimized(!isMinimized);
        if (window.Tawk_API) {
            if (isMinimized) {
                window.Tawk_API.showWidget();
            } else {
                window.Tawk_API.hideWidget();
            }
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={toggleChat}
                    size="lg"
                    className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                        !isAuthenticated ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                    }`}
                >
                    {isAuthenticated ? (
                        <MessageCircle className="h-6 w-6" />
                    ) : (
                        <Lock className="h-6 w-6" />
                    )}
                </Button>
                
                {/* Notification Badge - only show for authenticated users */}
                {isAuthenticated && (
                    <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                        1
                    </Badge>
                )}
            </div>

            {/* Custom Chat Widget */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80">
                    <Card className="border-0 shadow-2xl">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isAuthenticated ? (
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Lock className="h-5 w-5 text-yellow-500" />
                                    )}
                                    <CardTitle className="text-lg">
                                        {isAuthenticated ? 'Live Chat Support' : 'Live Chat Terkunci'}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-1">
                                    {isAuthenticated && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={minimizeChat}
                                            className="h-8 w-8 p-0"
                                        >
                                            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleChat}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>
                                {isAuthenticated 
                                    ? 'Tim support kami siap membantu Anda 24/7'
                                    : 'Silakan login untuk menggunakan live chat'
                                }
                            </CardDescription>
                        </CardHeader>
                        
                        {!isMinimized && (
                            <CardContent className="pt-0">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        {/* Welcome Message */}
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground">
                                                👋 Halo {user?.name || 'User'}! Ada yang bisa kami bantu? Tim support kami siap melayani Anda.
                                            </p>
                                        </div>
                                        
                                        {/* Quick Actions */}
                                        <div className="space-y-2">
                                            <Button variant="outline" size="sm" className="w-full justify-start text-left">
                                                📚 Tanya tentang kursus
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full justify-start text-left">
                                                💳 Bantuan pembayaran
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full justify-start text-left">
                                                🏠 Info penginapan
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full justify-start text-left">
                                                📞 Hubungi langsung
                                            </Button>
                                        </div>
                                        
                                        {/* Contact Info */}
                                        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                                            <p>📧 info@pareeduhub.com</p>
                                            <p>📞 +62 812-3456-7890</p>
                                            <p>⏰ 24/7 Support</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Lock Message */}
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                                            <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                                            <p className="text-sm font-medium mb-2">
                                                Live Chat Memerlukan Login
                                            </p>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Untuk menggunakan fitur live chat dan mendapatkan bantuan dari tim support kami, silakan login atau daftar terlebih dahulu.
                                            </p>
                                            <div className="space-y-2">
                                                <Link href="/login" className="block">
                                                    <Button className="w-full" size="sm">
                                                        Masuk Sekarang
                                                    </Button>
                                                </Link>
                                                <Link href="/register" className="block">
                                                    <Button variant="outline" className="w-full" size="sm">
                                                        Daftar Akun Baru
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        {/* Contact Info for non-authenticated */}
                                        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                                            <p className="mb-2">Atau hubungi kami langsung:</p>
                                            <p>📧 info@pareeduhub.com</p>
                                            <p>📞 +62 812-3456-7890</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </div>
            )}

            {/* Tawk.to Widget Container */}
            <div id="tawkto-container" className="hidden"></div>
        </>
    );
};

// Extend Window interface for Tawk.to
declare global {
    interface Window {
        Tawk_API?: {
            showWidget: () => void;
            hideWidget: () => void;
            maximize: () => void;
            minimize: () => void;
            toggle: () => void;
            toggleVisibility: () => void;
            endChat: () => void;
            showWidget: () => void;
            hideWidget: () => void;
        };
    }
}

export default LiveChatWidget;