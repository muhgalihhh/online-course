import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Institution {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    photo_path?: string;
}

interface InstitutionEditProps extends PageProps {
    institution: Institution;
}

export default function InstitutionEdit({ institution }: InstitutionEditProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        name: institution.name || '',
        description: institution.description || '',
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        website: institution.website || '',
        photo_path: null as File | null,
    });

    useEffect(() => {
        if (data.photo_path) {
            const objectUrl = URL.createObjectURL(data.photo_path);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(null);
        }
    }, [data.photo_path]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.institutions.update'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Profil Institusi', href: route('admin.institutions.index') },
                { title: 'Edit Profil', href: route('admin.institutions.edit') },
            ]}
        >
            <Head title="Edit Profil Institusi" />

            <div className="">
                <div className="mb-6 flex items-center">
                    <Button variant="ghost" size="sm" className="mr-2" asChild>
                        <a href={route('admin.institutions.index')} title="Kembali ke daftar institusi">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Profil Institusi</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building2 className="mr-2 h-5 w-5" />
                            Perbarui Informasi Profil
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Perbarui informasi profil institusi Anda untuk menjaga data yang akurat dan terpercaya
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="photo_path">Foto Institusi</Label>
                                <div className="flex items-center space-x-4">
                                    {(preview || institution.photo_path) && (
                                        <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-gray-200">
                                            <img
                                                src={preview || `/storage/${institution.photo_path}`}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    {!preview && !institution.photo_path && (
                                        <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                                            <Building2 className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            id="photo_path"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('photo_path', e.target.files ? e.target.files[0] : null)}
                                            className={errors.photo_path ? 'border-red-500' : ''}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Upload gambar JPG, PNG, atau WebP (maksimal 2MB)</p>
                                        {errors.photo_path && <p className="text-sm text-red-600">{errors.photo_path}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Institusi</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama institusi Anda"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Institusi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Ceritakan tentang institusi Anda, visi, misi, dan keunggulan yang dimiliki"
                                    rows={4}
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Masukkan alamat lengkap institusi"
                                    rows={3}
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telepon</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Masukkan nomor telepon"
                                    />
                                    {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Masukkan email institusi"
                                    />
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://example.com"
                                />
                                {errors.website && <p className="text-sm text-red-600">{errors.website}</p>}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={route('admin.institutions.index')}>Batal</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Update Profil Institusi'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
