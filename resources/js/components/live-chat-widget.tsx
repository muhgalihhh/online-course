import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

interface LiveChatWidgetProps {
    tawkToId?: string;
    tawkToKey?: string;
    autoCloseAfterFirstMessage?: boolean;
    customStyles?: boolean;
    autoOpenOnLoad?: boolean;
    autoOpenDelay?: number;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
    tawkToId = import.meta.env.VITE_TAWK_TO_ID || '68b08159be8646192a419bab',
    tawkToKey = import.meta.env.VITE_TAWK_TO_KEY || '1j3onihr8',
    autoCloseAfterFirstMessage = true,
    customStyles = true,
    // Default: don’t auto open. Keep just the chat icon until clicked
    autoOpenOnLoad = false,
    autoOpenDelay = 2000,
}) => {
    const { user } = useAuth();

    useEffect(() => {
        // Helper to configure behavior, can be called onLoad or immediately when API is ready
        const configureTawkBehavior = () => {
            // Pastikan widget terlihat (ikon muncul) dan tetap minimized by default
            try {
                if (window.Tawk_API?.showWidget) window.Tawk_API.showWidget();
                if (!autoOpenOnLoad && window.Tawk_API?.minimize) {
                    // Force minimize to override any auto-open trigger from Tawk dashboard
                    window.Tawk_API.minimize();
                }
            } catch {}

            // Optional: only auto-open if explicitly diminta
            if (autoOpenOnLoad && window.Tawk_API?.maximize) {
                setTimeout(() => {
                    if (window.Tawk_API?.maximize) {
                        window.Tawk_API.maximize();
                    }
                }, autoOpenDelay);
            }

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
                        border: 1px solid rgba(30, 58, 138, 0.2) !important;
                        animation: tawk-slide-in 0.3s ease-out !important;
                    }

                    /* Animation untuk opening chat */
                    @keyframes tawk-slide-in {
                        from {
                            opacity: 0;
                            transform: translateY(20px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    #tawkchat-container iframe {
                        border-radius: 12px !important;
                    }

                    /* Chat header customization */
                    .tawk-header {
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
                        border-radius: 12px 12px 0 0 !important;
                    }

                    /* Additional styling for better appearance */
                    #tawkchat-minified-wrapper {
                        z-index: 9999 !important;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }

                    #tawkchat-container-wrapper {
                        z-index: 9998 !important;
                    }

                    /* Style the widget bubble */
                    .tawk-min-container {
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
                        border: none !important;
                        box-shadow: 0 8px 32px rgba(30, 58, 138, 0.3) !important;
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

        // Prevent duplicate script loading, but still configure behavior if already present
        const existingScript = document.querySelector(`script[src*="embed.tawk.to"]`);
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();

        if (existingScript) {
            // If API is ready, configure now; otherwise attach to onLoad
            if (window.Tawk_API?.showWidget) {
                configureTawkBehavior();
            } else {
                window.Tawk_API.onLoad = configureTawkBehavior;
            }
        } else {
            // Load Tawk.to script and configure on load
            window.Tawk_API.onLoad = configureTawkBehavior;

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://embed.tawk.to/${tawkToId}/${tawkToKey}`;
            script.charset = 'UTF-8';
            script.setAttribute('crossorigin', '*');
            document.head.appendChild(script);
        }

        return () => {
            // Jangan hide atau remove script/iframe agar widget tetap ada antar navigasi
            // Hanya bersihkan custom styles yang kita inject
            const customStyles = document.querySelectorAll('style');
            customStyles.forEach((style) => {
                if (style.textContent?.includes('Custom Tawk.to Widget Styling')) {
                    style.remove();
                }
            });
        };
    }, [tawkToId, tawkToKey, user, autoCloseAfterFirstMessage, customStyles, autoOpenOnLoad, autoOpenDelay]);

    return null;
};

export default LiveChatWidget;
