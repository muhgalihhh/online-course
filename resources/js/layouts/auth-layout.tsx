import AuthCardLayout from '@/layouts/auth/auth-card-layout';

export default function AuthLayout({ 
    children, 
    title, 
    description, 
    variant = 'card',
    ...props 
}: { 
    children: React.ReactNode; 
    title: string; 
    description?: string;
    variant?: 'simple' | 'card' | 'split';
}) {
    // Default to card layout for better shadcn/ui consistency
    return (
        <AuthCardLayout title={title} description={description} {...props}>
            {children}
        </AuthCardLayout>
    );
}
