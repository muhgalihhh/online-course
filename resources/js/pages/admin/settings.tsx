// resources/js/pages/admin/settings.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell, CreditCard, Database, Globe, Lock, Mail, Palette, RefreshCw, Save, Settings as SettingsIcon, Shield, User, Users, Trash2, Camera } from 'lucide-react';
import { useState, useRef, FormEvent } from 'react';
import { Transition } from '@headlessui/react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Settings',
        href: route('admin.settings'),
    },
];

interface SettingsData {
    [key: string]: {
        [key: string]: {
            value: any;
            type: string;
            description: string;
            is_public: boolean;
        };
    };
}

interface SettingsProps extends PageProps {
    settings: SettingsData;
    profileData: {
        name: string;
        email: string;
        profile_photo_path?: string;
    };
    mustVerifyEmail: boolean;
}

export default function Settings({ settings = {}, profileData, mustVerifyEmail }: SettingsProps) {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState('profile');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Profile form
    const profileForm = useForm({
        section: 'profile',
        name: profileData?.name || auth.user.name,
        email: profileData?.email || auth.user.email,
        profile_photo: null as File | null,
    });

    // Password form
    const passwordForm = useForm({
        section: 'password',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // General settings form
    const generalForm = useForm({
        section: 'general',
        platform_name: settings?.general?.platform_name?.value || 'EduPlatform',
        platform_description: settings?.general?.platform_description?.value || 'Platform kursus online terbaik untuk pembelajaran digital',
        contact_email: settings?.general?.contact_email?.value || 'admin@eduplatform.com',
        support_phone: settings?.general?.support_phone?.value || '+62 812-3456-7890',
        max_users: settings?.general?.max_users?.value || 10000,
        user_verification: settings?.general?.user_verification?.value || 'email',
        auto_approve_users: settings?.general?.auto_approve_users?.value !== false,
        allow_registration: settings?.general?.allow_registration?.value !== false,
    });

    // Appearance settings form
    const appearanceForm = useForm({
        section: 'appearance',
        default_theme: settings?.appearance?.default_theme?.value || 'light',
        primary_color: settings?.appearance?.primary_color?.value || '#3B82F6',
        show_logo: settings?.appearance?.show_logo?.value !== false,
        sidebar_position: settings?.appearance?.sidebar_position?.value || 'left',
        collapsible_sidebar: settings?.appearance?.collapsible_sidebar?.value !== false,
        show_breadcrumbs: settings?.appearance?.show_breadcrumbs?.value !== false,
    });

    // Security settings form
    const securityForm = useForm({
        section: 'security',
        password_policy: settings?.security?.password_policy?.value || 'medium',
        two_factor_auth: settings?.security?.two_factor_auth?.value === true,
        session_timeout_enabled: settings?.security?.session_timeout_enabled?.value !== false,
        session_timeout_minutes: settings?.security?.session_timeout_minutes?.value || 30,
        ip_whitelist_enabled: settings?.security?.ip_whitelist_enabled?.value === true,
        allowed_ips: settings?.security?.allowed_ips?.value || '',
        rate_limiting: settings?.security?.rate_limiting?.value !== false,
        rate_limit_per_minute: settings?.security?.rate_limit_per_minute?.value || 60,
    });

    // Notification settings form
    const notificationForm = useForm({
        section: 'notifications',
        notify_new_registration: settings?.notifications?.notify_new_registration?.value !== false,
        notify_course_enrollment: settings?.notifications?.notify_course_enrollment?.value !== false,
        notify_payment_confirmation: settings?.notifications?.notify_payment_confirmation?.value !== false,
        notify_system_updates: settings?.notifications?.notify_system_updates?.value === true,
        push_notifications: settings?.notifications?.push_notifications?.value !== false,
        sound_alerts: settings?.notifications?.sound_alerts?.value === true,
        notification_retention_days: settings?.notifications?.notification_retention_days?.value || 30,
    });

    // Email settings form
    const emailForm = useForm({
        section: 'email',
        smtp_host: settings?.email?.smtp_host?.value || 'smtp.gmail.com',
        smtp_port: settings?.email?.smtp_port?.value || 587,
        smtp_username: settings?.email?.smtp_username?.value || 'noreply@eduplatform.com',
        smtp_password: settings?.email?.smtp_password?.value || '',
        smtp_use_tls: settings?.email?.smtp_use_tls?.value !== false,
        email_from_name: settings?.email?.email_from_name?.value || 'EduPlatform',
        email_from_address: settings?.email?.email_from_address?.value || 'noreply@eduplatform.com',
        email_reply_to: settings?.email?.email_reply_to?.value || 'support@eduplatform.com',
        email_footer: settings?.email?.email_footer?.value || '© 2024 EduPlatform. All rights reserved.',
    });

    // Advanced settings form
    const advancedForm = useForm({
        section: 'advanced',
        cache_duration_minutes: settings?.advanced?.cache_duration_minutes?.value || 60,
        file_upload_limit_mb: settings?.advanced?.file_upload_limit_mb?.value || 10,
        debug_mode: settings?.advanced?.debug_mode?.value === true,
        maintenance_mode: settings?.advanced?.maintenance_mode?.value === true,
        default_currency: settings?.advanced?.default_currency?.value || 'IDR',
        payment_gateway: settings?.advanced?.payment_gateway?.value || 'midtrans',
        auto_refund: settings?.advanced?.auto_refund?.value !== false,
    });

    // Delete account form
    const deleteForm = useForm({
        password: '',
    });

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        profileForm.post(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        passwordForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const handleGeneralSubmit = (e: FormEvent) => {
        e.preventDefault();
        generalForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleAppearanceSubmit = (e: FormEvent) => {
        e.preventDefault();
        appearanceForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleSecuritySubmit = (e: FormEvent) => {
        e.preventDefault();
        securityForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleNotificationSubmit = (e: FormEvent) => {
        e.preventDefault();
        notificationForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleEmailSubmit = (e: FormEvent) => {
        e.preventDefault();
        emailForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleAdvancedSubmit = (e: FormEvent) => {
        e.preventDefault();
        advancedForm.patch(route('admin.settings.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDeleteAccount = (e: FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteForm.delete(route('admin.settings.delete-account'), {
                preserveScroll: true,
            });
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('profile_photo', file);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Kelola pengaturan sistem, profil, dan konfigurasi platform</p>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Password</span>
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifikasi</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Advanced</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your account profile information and email address</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                {/* Profile Photo */}
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage 
                                            src={profileData?.profile_photo_path ? `/storage/${profileData.profile_photo_path}` : undefined} 
                                            alt={profileForm.data.name} 
                                        />
                                        <AvatarFallback>{getInitials(profileForm.data.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="mr-2 h-4 w-4" />
                                            Change Photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={profileForm.data.name}
                                            onChange={(e) => profileForm.setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={profileForm.errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={(e) => profileForm.setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError message={profileForm.errors.email} />
                                    </div>

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="rounded-md bg-yellow-50 p-4">
                                            <p className="text-sm text-yellow-800">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={route('verification.send')}
                                                    method="post"
                                                    as="button"
                                                    className="font-medium text-yellow-900 underline hover:no-underline"
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={profileForm.processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                    <Transition
                                        show={profileForm.recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">Saved successfully!</p>
                                    </Transition>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Delete Account */}
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Delete Account</CardTitle>
                            <CardDescription>
                                Once your account is deleted, all of its resources and data will be permanently deleted.
                                Before deleting your account, please download any data or information that you wish to retain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDeleteAccount} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="delete-password">Confirm Password</Label>
                                    <Input
                                        id="delete-password"
                                        type="password"
                                        value={deleteForm.data.password}
                                        onChange={(e) => deleteForm.setData('password', e.target.value)}
                                        placeholder="Enter your password to confirm"
                                    />
                                    <InputError message={deleteForm.errors.password} />
                                </div>
                                <Button type="submit" variant="destructive" disabled={deleteForm.processing}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Account
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Settings */}
                <TabsContent value="password" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Password</CardTitle>
                            <CardDescription>
                                Ensure your account is using a long, random password to stay secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <InputError message={passwordForm.errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <InputError message={passwordForm.errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <InputError message={passwordForm.errors.password_confirmation} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={passwordForm.processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Password
                                    </Button>
                                    <Transition
                                        show={passwordForm.recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">Password updated successfully!</p>
                                    </Transition>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <form onSubmit={handleGeneralSubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Platform Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="platform-name">Platform Name</Label>
                                        <Input
                                            id="platform-name"
                                            value={generalForm.data.platform_name}
                                            onChange={(e) => generalForm.setData('platform_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="platform-description">Description</Label>
                                        <Textarea
                                            id="platform-description"
                                            value={generalForm.data.platform_description}
                                            onChange={(e) => generalForm.setData('platform_description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-email">Contact Email</Label>
                                        <Input
                                            id="contact-email"
                                            type="email"
                                            value={generalForm.data.contact_email}
                                            onChange={(e) => generalForm.setData('contact_email', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="support-phone">Support Phone</Label>
                                        <Input
                                            id="support-phone"
                                            value={generalForm.data.support_phone}
                                            onChange={(e) => generalForm.setData('support_phone', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        User Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="max-users">Maximum Users</Label>
                                        <Input
                                            id="max-users"
                                            type="number"
                                            value={generalForm.data.max_users}
                                            onChange={(e) => generalForm.setData('max_users', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="user-verification">User Verification</Label>
                                        <Select
                                            value={generalForm.data.user_verification}
                                            onValueChange={(value) => generalForm.setData('user_verification', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email Verification</SelectItem>
                                                <SelectItem value="phone">Phone Verification</SelectItem>
                                                <SelectItem value="both">Both</SelectItem>
                                                <SelectItem value="none">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-approve Users</Label>
                                            <p className="text-sm text-muted-foreground">Otomatis menyetujui pendaftaran user baru</p>
                                        </div>
                                        <Switch
                                            checked={generalForm.data.auto_approve_users}
                                            onCheckedChange={(checked) => generalForm.setData('auto_approve_users', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Allow User Registration</Label>
                                            <p className="text-sm text-muted-foreground">Mengizinkan user baru untuk mendaftar</p>
                                        </div>
                                        <Switch
                                            checked={generalForm.data.allow_registration}
                                            onCheckedChange={(checked) => generalForm.setData('allow_registration', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" disabled={generalForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save General Settings
                            </Button>
                            <Transition
                                show={generalForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Settings saved successfully!</p>
                            </Transition>
                        </div>
                    </form>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                    <form onSubmit={handleAppearanceSubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Theme Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Default Theme</Label>
                                        <Select
                                            value={appearanceForm.data.default_theme}
                                            onValueChange={(value) => appearanceForm.setData('default_theme', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Primary Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="color"
                                                value={appearanceForm.data.primary_color}
                                                onChange={(e) => appearanceForm.setData('primary_color', e.target.value)}
                                                className="h-10 w-20"
                                            />
                                            <Input
                                                type="text"
                                                value={appearanceForm.data.primary_color}
                                                onChange={(e) => appearanceForm.setData('primary_color', e.target.value)}
                                                placeholder="#3B82F6"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Show Logo</Label>
                                            <p className="text-sm text-muted-foreground">Menampilkan logo platform</p>
                                        </div>
                                        <Switch
                                            checked={appearanceForm.data.show_logo}
                                            onCheckedChange={(checked) => appearanceForm.setData('show_logo', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Layout Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Sidebar Position</Label>
                                        <Select
                                            value={appearanceForm.data.sidebar_position}
                                            onValueChange={(value) => appearanceForm.setData('sidebar_position', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left">Left</SelectItem>
                                                <SelectItem value="right">Right</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Collapsible Sidebar</Label>
                                            <p className="text-sm text-muted-foreground">Sidebar dapat di-collapse</p>
                                        </div>
                                        <Switch
                                            checked={appearanceForm.data.collapsible_sidebar}
                                            onCheckedChange={(checked) => appearanceForm.setData('collapsible_sidebar', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Show Breadcrumbs</Label>
                                            <p className="text-sm text-muted-foreground">Menampilkan breadcrumb navigation</p>
                                        </div>
                                        <Switch
                                            checked={appearanceForm.data.show_breadcrumbs}
                                            onCheckedChange={(checked) => appearanceForm.setData('show_breadcrumbs', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" disabled={appearanceForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Appearance Settings
                            </Button>
                            <Transition
                                show={appearanceForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Settings saved successfully!</p>
                            </Transition>
                        </div>
                    </form>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <form onSubmit={handleSecuritySubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Authentication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Password Policy</Label>
                                        <Select
                                            value={securityForm.data.password_policy}
                                            onValueChange={(value) => securityForm.setData('password_policy', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low (6 characters)</SelectItem>
                                                <SelectItem value="medium">Medium (8 characters)</SelectItem>
                                                <SelectItem value="high">High (12 characters)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Two-Factor Authentication</Label>
                                            <p className="text-sm text-muted-foreground">Wajib untuk admin</p>
                                        </div>
                                        <Switch
                                            checked={securityForm.data.two_factor_auth}
                                            onCheckedChange={(checked) => securityForm.setData('two_factor_auth', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Session Timeout</Label>
                                            <p className="text-sm text-muted-foreground">Auto logout setelah inaktif</p>
                                        </div>
                                        <Switch
                                            checked={securityForm.data.session_timeout_enabled}
                                            onCheckedChange={(checked) => securityForm.setData('session_timeout_enabled', checked)}
                                        />
                                    </div>
                                    {securityForm.data.session_timeout_enabled && (
                                        <div className="space-y-2">
                                            <Label>Session Timeout (minutes)</Label>
                                            <Input
                                                type="number"
                                                value={securityForm.data.session_timeout_minutes}
                                                onChange={(e) => securityForm.setData('session_timeout_minutes', parseInt(e.target.value))}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Access Control</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>IP Whitelist</Label>
                                            <p className="text-sm text-muted-foreground">Batasi akses berdasarkan IP</p>
                                        </div>
                                        <Switch
                                            checked={securityForm.data.ip_whitelist_enabled}
                                            onCheckedChange={(checked) => securityForm.setData('ip_whitelist_enabled', checked)}
                                        />
                                    </div>
                                    {securityForm.data.ip_whitelist_enabled && (
                                        <div className="space-y-2">
                                            <Label>Allowed IP Addresses</Label>
                                            <Textarea
                                                placeholder="192.168.1.1&#10;10.0.0.1"
                                                value={securityForm.data.allowed_ips}
                                                onChange={(e) => securityForm.setData('allowed_ips', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Rate Limiting</Label>
                                            <p className="text-sm text-muted-foreground">Batasi request per menit</p>
                                        </div>
                                        <Switch
                                            checked={securityForm.data.rate_limiting}
                                            onCheckedChange={(checked) => securityForm.setData('rate_limiting', checked)}
                                        />
                                    </div>
                                    {securityForm.data.rate_limiting && (
                                        <div className="space-y-2">
                                            <Label>Rate Limit (requests/minute)</Label>
                                            <Input
                                                type="number"
                                                value={securityForm.data.rate_limit_per_minute}
                                                onChange={(e) => securityForm.setData('rate_limit_per_minute', parseInt(e.target.value))}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" disabled={securityForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Security Settings
                            </Button>
                            <Transition
                                show={securityForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Settings saved successfully!</p>
                            </Transition>
                        </div>
                    </form>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <form onSubmit={handleNotificationSubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Email Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>New User Registration</Label>
                                            <p className="text-sm text-muted-foreground">Kirim email saat user baru mendaftar</p>
                                        </div>
                                        <Switch
                                            checked={notificationForm.data.notify_new_registration}
                                            onCheckedChange={(checked) => notificationForm.setData('notify_new_registration', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Course Enrollment</Label>
                                            <p className="text-sm text-muted-foreground">Kirim email saat user mendaftar kursus</p>
                                        </div>
                                        <Switch
                                            checked={notificationForm.data.notify_course_enrollment}
                                            onCheckedChange={(checked) => notificationForm.setData('notify_course_enrollment', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Payment Confirmation</Label>
                                            <p className="text-sm text-muted-foreground">Kirim email konfirmasi pembayaran</p>
                                        </div>
                                        <Switch
                                            checked={notificationForm.data.notify_payment_confirmation}
                                            onCheckedChange={(checked) => notificationForm.setData('notify_payment_confirmation', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>System Updates</Label>
                                            <p className="text-sm text-muted-foreground">Kirim email update sistem</p>
                                        </div>
                                        <Switch
                                            checked={notificationForm.data.notify_system_updates}
                                            onCheckedChange={(checked) => notificationForm.setData('notify_system_updates', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>In-App Notifications</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Aktifkan push notifications</p>
                                        </div>
                                        <Switch
                                            checked={notificationForm.data.push_notifications}
                                            onCheckedChange={(checked) => notificationForm.setData('push_notifications', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Sound Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Putar suara saat notifikasi</p>
                                        </div>
                                        <Switch
                                            checked={notificationForm.data.sound_alerts}
                                            onCheckedChange={(checked) => notificationForm.setData('sound_alerts', checked)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notification Retention (days)</Label>
                                        <Input
                                            type="number"
                                            value={notificationForm.data.notification_retention_days}
                                            onChange={(e) => notificationForm.setData('notification_retention_days', parseInt(e.target.value))}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" disabled={notificationForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Notification Settings
                            </Button>
                            <Transition
                                show={notificationForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Settings saved successfully!</p>
                            </Transition>
                        </div>
                    </form>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email" className="space-y-6">
                    <form onSubmit={handleEmailSubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        SMTP Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>SMTP Host</Label>
                                        <Input
                                            value={emailForm.data.smtp_host}
                                            onChange={(e) => emailForm.setData('smtp_host', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SMTP Port</Label>
                                        <Input
                                            type="number"
                                            value={emailForm.data.smtp_port}
                                            onChange={(e) => emailForm.setData('smtp_port', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Username</Label>
                                        <Input
                                            value={emailForm.data.smtp_username}
                                            onChange={(e) => emailForm.setData('smtp_username', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input
                                            type="password"
                                            value={emailForm.data.smtp_password}
                                            onChange={(e) => emailForm.setData('smtp_password', e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Use TLS</Label>
                                            <p className="text-sm text-muted-foreground">Enkripsi koneksi email</p>
                                        </div>
                                        <Switch
                                            checked={emailForm.data.smtp_use_tls}
                                            onCheckedChange={(checked) => emailForm.setData('smtp_use_tls', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Templates</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>From Name</Label>
                                        <Input
                                            value={emailForm.data.email_from_name}
                                            onChange={(e) => emailForm.setData('email_from_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>From Email</Label>
                                        <Input
                                            type="email"
                                            value={emailForm.data.email_from_address}
                                            onChange={(e) => emailForm.setData('email_from_address', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reply To Email</Label>
                                        <Input
                                            type="email"
                                            value={emailForm.data.email_reply_to}
                                            onChange={(e) => emailForm.setData('email_reply_to', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Footer</Label>
                                        <Textarea
                                            value={emailForm.data.email_footer}
                                            onChange={(e) => emailForm.setData('email_footer', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" disabled={emailForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Email Settings
                            </Button>
                            <Transition
                                show={emailForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Settings saved successfully!</p>
                            </Transition>
                        </div>
                    </form>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-6">
                    <form onSubmit={handleAdvancedSubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        System Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Cache Duration (minutes)</Label>
                                        <Input
                                            type="number"
                                            value={advancedForm.data.cache_duration_minutes}
                                            onChange={(e) => advancedForm.setData('cache_duration_minutes', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>File Upload Limit (MB)</Label>
                                        <Input
                                            type="number"
                                            value={advancedForm.data.file_upload_limit_mb}
                                            onChange={(e) => advancedForm.setData('file_upload_limit_mb', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Debug Mode</Label>
                                            <p className="text-sm text-muted-foreground">Aktifkan mode debug</p>
                                        </div>
                                        <Switch
                                            checked={advancedForm.data.debug_mode}
                                            onCheckedChange={(checked) => advancedForm.setData('debug_mode', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Maintenance Mode</Label>
                                            <p className="text-sm text-muted-foreground">Aktifkan mode maintenance</p>
                                        </div>
                                        <Switch
                                            checked={advancedForm.data.maintenance_mode}
                                            onCheckedChange={(checked) => advancedForm.setData('maintenance_mode', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Default Currency</Label>
                                        <Select
                                            value={advancedForm.data.default_currency}
                                            onValueChange={(value) => advancedForm.setData('default_currency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                                                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                                <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                                                <SelectItem value="MYR">Malaysian Ringgit (MYR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Gateway</Label>
                                        <Select
                                            value={advancedForm.data.payment_gateway}
                                            onValueChange={(value) => advancedForm.setData('payment_gateway', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="midtrans">Midtrans</SelectItem>
                                                <SelectItem value="xendit">Xendit</SelectItem>
                                                <SelectItem value="stripe">Stripe</SelectItem>
                                                <SelectItem value="paypal">PayPal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-refund</Label>
                                            <p className="text-sm text-muted-foreground">Otomatis refund untuk transaksi gagal</p>
                                        </div>
                                        <Switch
                                            checked={advancedForm.data.auto_refund}
                                            onCheckedChange={(checked) => advancedForm.setData('auto_refund', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" disabled={advancedForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Advanced Settings
                            </Button>
                            <Transition
                                show={advancedForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Settings saved successfully!</p>
                            </Transition>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}