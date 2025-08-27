import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppearance } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Camera, Lock, Monitor, Moon, Palette, Save, Sun, Trash2, User } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

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

interface SettingsProps extends PageProps {
    settings: any;
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
    const { appearance, updateAppearance } = useAppearance();

    // Profile form
    const profileForm = useForm({
        name: profileData?.name || auth.user.name,
        email: profileData?.email || auth.user.email,
        profile_photo: null as File | null,
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Delete account form
    const deleteForm = useForm({
        password: '',
    });

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        profileForm.post(route('admin.settings.profile'), {
            preserveScroll: true,
            onSuccess: () => {
                profileForm.reset('profile_photo');
            },
        });
    };

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('admin.settings.password'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const handleDeleteAccount = (e: FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteForm.delete(route('admin.settings.account'), {
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
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your account's profile information and email address.</CardDescription>
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
                                        <div>
                                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2"
                                            >
                                                <Camera className="h-4 w-4" />
                                                Change Photo
                                            </Button>
                                            {profileForm.data.profile_photo && (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    New photo selected: {profileForm.data.profile_photo.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={profileForm.data.name}
                                            onChange={(e) => profileForm.setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={profileForm.errors.name} />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
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
                                        <div className="text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="underline hover:text-foreground"
                                            >
                                                Click here to re-send the verification email.
                                            </Link>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={profileForm.processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4">
                        {/* Update Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Password</CardTitle>
                                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            required
                                        />
                                        <InputError message={passwordForm.errors.current_password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            required
                                        />
                                        <InputError message={passwordForm.errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                        <InputError message={passwordForm.errors.password_confirmation} />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={passwordForm.processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Delete Account */}
                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="text-destructive">Delete Account</CardTitle>
                                <CardDescription>
                                    Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your
                                    account, please download any data or information that you wish to retain.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleDeleteAccount} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete_password">Enter your password to confirm account deletion</Label>
                                        <Input
                                            id="delete_password"
                                            type="password"
                                            value={deleteForm.data.password}
                                            onChange={(e) => deleteForm.setData('password', e.target.value)}
                                            placeholder="Password"
                                            required
                                        />
                                        <InputError message={deleteForm.errors.password} />
                                    </div>

                                    <Button type="submit" variant="destructive" disabled={deleteForm.processing} className="flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                                <CardDescription>
                                    Customize the appearance of your dashboard. Choose between light, dark, or system theme.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label>Theme</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => updateAppearance('light')}
                                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent ${
                                                appearance === 'light' ? 'border-primary' : 'border-muted'
                                            }`}
                                        >
                                            <Sun className="mb-2 h-6 w-6" />
                                            <span className="text-sm font-medium">Light</span>
                                            {appearance === 'light' && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateAppearance('dark')}
                                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent ${
                                                appearance === 'dark' ? 'border-primary' : 'border-muted'
                                            }`}
                                        >
                                            <Moon className="mb-2 h-6 w-6" />
                                            <span className="text-sm font-medium">Dark</span>
                                            {appearance === 'dark' && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateAppearance('system')}
                                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent ${
                                                appearance === 'system' ? 'border-primary' : 'border-muted'
                                            }`}
                                        >
                                            <Monitor className="mb-2 h-6 w-6" />
                                            <span className="text-sm font-medium">System</span>
                                            {appearance === 'system' && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {appearance === 'system'
                                            ? 'Theme will automatically match your system preferences'
                                            : `Currently using ${appearance} theme`}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <Label>Theme Preview</Label>
                                    <div className="space-y-3 rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="h-3 w-24 rounded bg-foreground/80" />
                                                <div className="h-2 w-32 rounded bg-muted-foreground/50" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-8 rounded bg-primary" />
                                                <div className="h-8 w-8 rounded bg-secondary" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full rounded bg-muted" />
                                            <div className="h-2 w-3/4 rounded bg-muted" />
                                            <div className="h-2 w-1/2 rounded bg-muted" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
