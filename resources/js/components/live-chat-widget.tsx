import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface LiveChatWidgetProps {
    tawkToId?: string;
    tawkToKey?: string;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ 
    tawkToId = "68b08159be8646192a419bab", 
    tawkToKey = "1j3onihr8" 
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
        
        // Load Tawk.to script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://embed.tawk.to/${tawkToId}/${tawkToKey}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        
        // Set user attributes if available
        script.onload = () => {
            if (window.Tawk_API && window.Tawk_API.onLoad) {
                window.Tawk_API.onLoad = function() {
                    if (user) {
                        window.Tawk_API.setAttributes({
                            name: user.name,
                            email: user.email,
                            id: user.id
                        }, function(error) {
                            // Handle error if needed
                        });
                    }
                };
            }
        };
        
        document.head.appendChild(script);

        return () => {
            // Cleanup Tawk.to when component unmounts
            if (window.Tawk_API && window.Tawk_API.hideWidget) {
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
        };
    }, [tawkToId, tawkToKey, user]);

    return null;
};

// Extend Window interface for Tawk.to
declare global {
    interface Window {
        Tawk_API?: any;
        Tawk_LoadStart?: Date;
    }
}

export default LiveChatWidget;