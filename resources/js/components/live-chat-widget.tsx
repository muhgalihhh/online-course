import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

interface LiveChatWidgetProps {
    tawkToId?: string;
    tawkToKey?: string;
    autoCloseAfterFirstMessage?: boolean;
    customStyles?: boolean;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
    tawkToId = import.meta.env.VITE_TAWK_TO_ID || '68b08159be8646192a419bab',
    tawkToKey = import.meta.env.VITE_TAWK_TO_KEY || '1j3onihr8',
    autoCloseAfterFirstMessage = true,
    customStyles = true,
}) => {
    const { user } = useAuth();

    useEffect(() => {
        // Prevent duplicate script loading
        const existingScript = document.querySelector(`script[src*="embed.tawk.to"]`);
        if (existingScript) {
            return;
        }

        // Create Tawk.to configuration
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Konfigurasi untuk chat behavior
        window.Tawk_API.onLoad = function () {
            // Set custom styles jika diminta
            if (customStyles) {
                // Custom CSS untuk widget
                const style = document.createElement('style');
                style.textContent = `
                    /* Custom Tawk.to Widget Styling */
                    #tawkchat-minified-container {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                        border-radius: 50px !important;
                        box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3) !important;
                        transition: all 0.3s ease !important;
                    }
                    
                    #tawkchat-minified-container:hover {
                        transform: scale(1.05) !important;
                        box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4) !important;
                    }
                    
                    #tawkchat-minified-box {
                        border-radius: 50px !important;
                    }
                    
                    #tawkchat-container {
                        border-radius: 12px !important;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
                        border: 1px solid rgba(59, 130, 246, 0.2) !important;
                    }
                    
                    #tawkchat-container iframe {
                        border-radius: 12px !important;
                    }
                    
                    /* Chat header customization */
                    .tawk-header {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                        border-radius: 12px 12px 0 0 !important;
                    }
                    
                    /* Additional styling for better appearance */
                    #tawkchat-minified-wrapper {
                        z-index: 9999 !important;
                    }
                    
                    #tawkchat-container-wrapper {
                        z-index: 9998 !important;
                    }
                    
                    /* Style the widget bubble */
                    .tawk-min-container {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                        border: none !important;
                        box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3) !important;
                    }
                    
                    /* Animation for notification */
                    @keyframes tawk-pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                    
                    .tawk-notification {
                        animation: tawk-pulse 2s infinite !important;
                    }
                `;
                document.head.appendChild(style);
            }

            // Set user attributes jika user ada
            if (user && window.Tawk_API?.setAttributes) {
                window.Tawk_API.setAttributes(
                    {
                        name: user.name,
                        email: user.email,
                        id: user.id.toString(),
                        role: 'user',
                    },
                    function (error: unknown) {
                        if (error) {
                            console.error('Tawk.to setAttributes error:', error);
                        }
                    },
                );
            }

            // Auto-close functionality setelah pesan pertama
            if (autoCloseAfterFirstMessage && window.Tawk_API) {
                let messageCount = 0;
                let hasReceivedReply = false;

                // Listen untuk visitor message
                window.Tawk_API.onChatMessageVisitor = function (message: unknown) {
                    messageCount++;
                    console.log('Message sent by visitor:', message);

                    // Setelah pesan pertama, beri feedback
                    if (messageCount === 1) {
                        // Show acknowledgment after 2 seconds
                        setTimeout(() => {
                            // Minimize setelah 5 detik jika belum ada balasan
                            if (!hasReceivedReply && window.Tawk_API?.minimize) {
                                setTimeout(() => {
                                    if (!hasReceivedReply && window.Tawk_API?.minimize) {
                                        window.Tawk_API.minimize();
                                    }
                                }, 8000); // 8 detik total menunggu
                            }
                        }, 2000);
                    }
                };

                // Listen untuk agent message (response)
                window.Tawk_API.onChatMessageAgent = function (message: unknown) {
                    hasReceivedReply = true;
                    console.log('Message received from agent:', message);

                    // Setelah agent membalas, tutup chat dalam 15 detik untuk memberi waktu baca
                    setTimeout(() => {
                        if (window.Tawk_API?.minimize) {
                            window.Tawk_API.minimize();
                        }
                    }, 15000); // 15 detik untuk membaca respon
                };

                // Listen untuk chat end
                if (window.Tawk_API.onChatEnded) {
                    window.Tawk_API.onChatEnded = function () {
                        console.log('Chat session ended');
                        if (window.Tawk_API?.minimize) {
                            window.Tawk_API.minimize();
                        }
                    };
                }
            }
        };

        // Load Tawk.to script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://embed.tawk.to/${tawkToId}/${tawkToKey}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        document.head.appendChild(script);

        return () => {
            // Cleanup Tawk.to when component unmounts
            if (window.Tawk_API?.hideWidget) {
                window.Tawk_API.hideWidget();
            }
            const scriptToRemove = document.querySelector(`script[src*="embed.tawk.to"]`);
            if (scriptToRemove && scriptToRemove.parentNode) {
                scriptToRemove.parentNode.removeChild(scriptToRemove);
            }
            // Clean up Tawk.to iframe
            const tawkFrame = document.querySelector('iframe[title*="chat"]');
            if (tawkFrame && tawkFrame.parentNode) {
                tawkFrame.parentNode.removeChild(tawkFrame);
            }
            // Remove custom styles
            const customStyles = document.querySelectorAll('style');
            customStyles.forEach((style) => {
                if (style.textContent?.includes('Custom Tawk.to Widget Styling')) {
                    style.remove();
                }
            });
        };
    }, [tawkToId, tawkToKey, user, autoCloseAfterFirstMessage, customStyles]);

    return null;
};

export default LiveChatWidget;
