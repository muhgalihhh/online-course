import { ErrorMessage } from '@/components/error-message';
import { FormActions } from '@/components/form-actions';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { UserCog } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface UserEditProps extends PageProps {
    user: User;
}

export default function UserEdit({ user }: UserEditProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const getInitials = useInitials();
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
        profile_photo_path: null as File | null,
    });

    useEffect(() => {
        if (data.profile_photo_path) {
            const objectUrl = URL.createObjectURL(data.profile_photo_path);
            setPreview(objectUrl);

            // Membersihkan object URL setelah komponen di-unmount
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [data.profile_photo_path]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.update', user.id), {
            // Penting: paksa Inertia untuk mengingat scroll position setelah form submit
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.users.index'));
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Users', href: route('admin.users.index') },
                { title: `Edit "${user.name}"`, href: route('admin.users.edit', user.id) },
            ]}
        >
            <Head title={`Edit User - ${user.name}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Edit User`}
                    description={`Memperbarui detail untuk pengguna ${user.name}`}
                    backUrl={route('admin.users.index')}
                    badge={{
                        text: 'Editing',
                        icon: UserCog,
                        variant: 'outline',
                    }}
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <UserCog className="h-5 w-5" />
                            <span>Informasi User</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage 
                                        src={preview || user.profile_photo_url} 
                                        alt={user.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="profile_photo_path">Ganti Foto Profil (Opsional)</Label>
                                    <Input
                                        id="profile_photo_path"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('profile_photo_path', e.target.files ? e.target.files[0] : null)}
                                        className={errors.profile_photo_path ? 'border-red-500' : ''}
                                    />
                                    {errors.profile_photo_path && <ErrorMessage message={errors.profile_photo_path} />}
                                    {user.profile_photo_url && !preview && (
                                        <p className="text-sm text-gray-500">
                                            Foto profil saat ini sudah ada. Pilih file baru untuk menggantinya.
                                        </p>
                                    )}
                                    {preview && (
                                        <p className="text-sm text-green-600">
                                            Preview foto baru sudah ditampilkan di samping.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <ErrorMessage message={errors.name} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan email"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <ErrorMessage message={errors.email} />}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru (Opsional)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak diubah"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <ErrorMessage message={errors.password} />}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Konfirmasi password baru"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && <ErrorMessage message={errors.password_confirmation} />}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <ErrorMessage message={errors.role} />}
                            </div>

                            <FormActions onCancel={handleCancel} submitText="Update User" loading={processing} loadingText="Updating..." />
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
