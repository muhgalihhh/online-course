// resources/js/pages/admin/users/create.tsx

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
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

export default function UserCreate() {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        profile_photo_path: File | null;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        profile_photo_path: null,
    });

    useEffect(() => {
        if (data.profile_photo_path) {
            const objectUrl = URL.createObjectURL(data.profile_photo_path);
            setPreview(objectUrl);

            // Membersihkan object URL setelah komponen di-unmount
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(null);
        }
    }, [data.profile_photo_path]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const handleCancel = () => {
        router.visit(route('admin.users.index'));
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Users', href: route('admin.users.index') },
                { title: 'Create' },
            ]}
        >
            <Head title="Create User" />
            <div className="space-y-6">
                <PageHeader title="Tambah User Baru" backUrl={route('admin.users.index')} />
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informasi User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage 
                                        src={preview || undefined} 
                                        alt={data.name || 'User'}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                        {useInitials(data.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="profile_photo_path">Foto Profil (Opsional)</Label>
                                    <Input
                                        id="profile_photo_path"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('profile_photo_path', e.target.files ? e.target.files[0] : null)}
                                        className={errors.profile_photo_path ? 'border-red-500' : ''}
                                    />
                                    {errors.profile_photo_path && <ErrorMessage message={errors.profile_photo_path} />}
                                </div>
                            </div>
                            {/* ... sisa form ... */}
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
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <ErrorMessage message={errors.password} />}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Konfirmasi password"
                                    />
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

                            <FormActions onCancel={handleCancel} submitText="Simpan User" loading={processing} />
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
