import React, { useEffect } from 'react';

// Anti-piracy hook
export const useAntiPiracy = (isVideoPage: boolean = false) => {
    useEffect(() => {
        if (!isVideoPage) return;

        const disableRightClick = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const disableKeyboardShortcuts = (e: KeyboardEvent) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+C (Inspect)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }

            // Ctrl+S (Save)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                return false;
            }

            // Print Screen
            if (e.keyCode === 44) {
                e.preventDefault();
                return false;
            }
        };

        const disableSelection = (e: Event) => {
            e.preventDefault();
            return false;
        };

        const disableDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // DevTools detection
        const detectDevTools = () => {
            const threshold = 160;
            const detected = window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold;

            if (detected) {
                window.location.href = '/courses';
            }
        };

        // Blur content when window loses focus (anti-screen recording)
        const handleBlur = () => {
            document.body.style.filter = 'blur(10px)';
            document.body.style.pointerEvents = 'none';
        };

        const handleFocus = () => {
            document.body.style.filter = 'none';
            document.body.style.pointerEvents = 'auto';
        };

        // Console clearing
        const clearConsole = () => {
            if (typeof console.clear === 'function') {
                console.clear();
            }
        };

        // Anti-debugging
        const antiDebug = () => {
            try {
                const start = Date.now();
                debugger;
                const end = Date.now();
                if (end - start > 100) {
                    window.location.href = '/courses';
                }
            } catch (e) {}
        };

        // Add event listeners
        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeyboardShortcuts);
        document.addEventListener('selectstart', disableSelection);
        document.addEventListener('dragstart', disableDragStart);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        // Set intervals for protection
        const devToolsInterval = setInterval(detectDevTools, 1000);
        const consoleInterval = setInterval(clearConsole, 100);
        const debugInterval = setInterval(antiDebug, 2000);

        // Apply CSS protection
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
                -webkit-tap-highlight-color: transparent !important;
            }

            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            @media print {
                body { display: none !important; }
            }
        `;
        document.head.appendChild(style);

        // Cleanup function
        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeyboardShortcuts);
            document.removeEventListener('selectstart', disableSelection);
            document.removeEventListener('dragstart', disableDragStart);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);

            clearInterval(devToolsInterval);
            clearInterval(consoleInterval);
            clearInterval(debugInterval);

            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }

            // Reset styles
            document.body.style.filter = 'none';
            document.body.style.pointerEvents = 'auto';
        };
    }, [isVideoPage]);
};

// Watermark component
export const VideoWatermark: React.FC<{
    userName: string;
    courseName: string;
    className?: string;
}> = ({ userName, courseName, className = '' }) => {
    const watermarkText = `${userName} - ${courseName} - ${new Date().toLocaleString('id-ID')}`;

    return <div className={`video-watermark ${className}`}>{watermarkText}</div>;
};

// Secure video player component
export const SecureVideoPlayer: React.FC<{
    src: string;
    title: string;
    className?: string;
    onContextMenu?: (e: React.MouseEvent) => void;
}> = ({ src, title, className = '', onContextMenu }) => {
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onContextMenu) {
            onContextMenu(e);
        }
        return false;
    };

    return (
        <video
            className={`anti-piracy-video h-full w-full ${className}`}
            src={src}
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            preload="metadata"
            onContextMenu={handleContextMenu}
        >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            <source src={src} type="video/ogg" />
            Browser Anda tidak mendukung tag video.
        </video>
    );
};

export default { useAntiPiracy, VideoWatermark, SecureVideoPlayer };
