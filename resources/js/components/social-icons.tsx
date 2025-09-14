import React from 'react';
// Import dari react-icons dengan berbagai style
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

// Simple Icons untuk branding yang lebih authentic
import { SiFacebook, SiInstagram, SiLinkedin, SiTelegram, SiTiktok, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si';

// Brand Colors untuk Hover Effects
export const BRAND_COLORS = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    tiktok: '#000000',
    youtube: '#FF0000',
    whatsapp: '#25D366',
    telegram: '#0088CC',
    linkedin: '#0A66C2',
} as const;

// Main Social Media Icons (menggunakan Simple Icons untuk authentic look)
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiFacebook className={className} />;

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiInstagram className={className} />;

export const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiX className={className} />;

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiTiktok className={className} />;

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiYoutube className={className} />;

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiWhatsapp className={className} />;

export const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiTelegram className={className} />;

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <SiLinkedin className={className} />;

// Mobile App Store Icons (Using PNG logos from public folder)
export const AppStoreIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <img src="/apple-logo.png" alt="App Store" className={className} />
);

export const GooglePlayIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <img src="/playstore.png" alt="Google Play" className={className} />
);

// Alternative Font Awesome versions (jika butuh style berbeda)
export const FacebookIconFA: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <FaFacebook className={className} />;

export const InstagramIconFA: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <FaInstagram className={className} />;

export const TwitterIconFA: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <FaTwitter className={className} />;

// Utility function untuk mendapatkan brand color
export const getBrandColor = (platform: keyof typeof BRAND_COLORS): string => {
    return BRAND_COLORS[platform];
};

// Utility component dengan hover effects (simplified)
interface SocialButtonProps {
    platform: keyof typeof BRAND_COLORS;
    href: string;
    children: React.ReactNode;
    className?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ platform, href, children, className = '' }) => {
    const getHoverClass = (platform: string) => {
        const hoverClasses = {
            facebook: 'hover:bg-blue-600',
            instagram: 'hover:bg-pink-600',
            twitter: 'hover:bg-blue-400',
            tiktok: 'hover:bg-black',
            youtube: 'hover:bg-red-600',
            whatsapp: 'hover:bg-green-600',
            telegram: 'hover:bg-blue-500',
            linkedin: 'hover:bg-blue-700',
        };
        return hoverClasses[platform as keyof typeof hoverClasses] || 'hover:bg-gray-600';
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-full p-2 text-gray-500 transition-colors duration-200 hover:text-white ${getHoverClass(platform)} ${className}`}
        >
            {children}
        </a>
    );
};
