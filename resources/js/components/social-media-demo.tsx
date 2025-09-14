import React from 'react';
import {
    AppStoreIcon,
    BRAND_COLORS,
    FacebookIcon,
    GooglePlayIcon,
    InstagramIcon,
    LinkedInIcon,
    SocialButton,
    TelegramIcon,
    TikTokIcon,
    TwitterIcon,
    WhatsAppIcon,
    YouTubeIcon,
} from './social-icons';

// Demo component untuk menunjukkan semua social media icons dari react-icons
export const SocialMediaDemo: React.FC = () => {
    return (
        <div className="bg-white p-8">
            <h2 className="mb-6 text-2xl font-bold">Social Media Icons - React Icons Library</h2>

            {/* Basic Icons */}
            <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">Basic Icons (Simple Icons Style)</h3>
                <div className="flex items-center gap-4">
                    <FacebookIcon className="h-6 w-6 text-blue-600" />
                    <InstagramIcon className="h-6 w-6 text-pink-600" />
                    <TwitterIcon className="h-6 w-6 text-blue-400" />
                    <TikTokIcon className="h-6 w-6 text-black" />
                    <YouTubeIcon className="h-6 w-6 text-red-600" />
                    <WhatsAppIcon className="h-6 w-6 text-green-600" />
                    <TelegramIcon className="h-6 w-6 text-blue-500" />
                    <LinkedInIcon className="h-6 w-6 text-blue-700" />
                </div>
            </div>

            {/* Mobile App Icons */}
            <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">Mobile App Store Icons</h3>
                <div className="flex items-center gap-4">
                    <AppStoreIcon className="h-8 w-8 text-black" />
                    <GooglePlayIcon className="h-8 w-8 text-green-600" />
                </div>
            </div>

            {/* Interactive Social Buttons */}
            <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">Interactive Social Buttons with Hover Effects</h3>
                <div className="flex items-center gap-4">
                    <SocialButton platform="facebook" href="https://facebook.com/example">
                        <FacebookIcon className="h-5 w-5" />
                    </SocialButton>
                    <SocialButton platform="instagram" href="https://instagram.com/example">
                        <InstagramIcon className="h-5 w-5" />
                    </SocialButton>
                    <SocialButton platform="twitter" href="https://twitter.com/example">
                        <TwitterIcon className="h-5 w-5" />
                    </SocialButton>
                    <SocialButton platform="tiktok" href="https://tiktok.com/@example">
                        <TikTokIcon className="h-5 w-5" />
                    </SocialButton>
                    <SocialButton platform="youtube" href="https://youtube.com/example">
                        <YouTubeIcon className="h-5 w-5" />
                    </SocialButton>
                </div>
            </div>

            {/* Size Variations */}
            <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">Different Sizes</h3>
                <div className="flex items-center gap-4">
                    <FacebookIcon className="h-4 w-4 text-blue-600" />
                    <FacebookIcon className="h-6 w-6 text-blue-600" />
                    <FacebookIcon className="h-8 w-8 text-blue-600" />
                    <FacebookIcon className="h-10 w-10 text-blue-600" />
                    <FacebookIcon className="h-12 w-12 text-blue-600" />
                </div>
            </div>

            {/* Brand Colors Reference */}
            <div>
                <h3 className="mb-4 text-lg font-semibold">Brand Colors Reference</h3>
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(BRAND_COLORS).map(([platform, color]) => (
                        <div key={platform} className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium capitalize">{platform}</span>
                            <span className="text-xs text-gray-500">{color}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SocialMediaDemo;
