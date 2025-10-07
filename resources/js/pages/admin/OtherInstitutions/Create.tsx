import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function OtherInstitutionCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.other-institutions.store'), {
            forceFormData: true,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Pusat Informasi', href: route('admin.other-institutions.index') },
                { title: 'Create', href: route('admin.other-institutions.create') },
            ]}
        >
            <Head title="Create Other Institution" />

            <div className="">
                <div className="mb-6 flex items-center">
                    <Link href={route('admin.other-institutions.index')}>
                        <Button variant="ghost" size="sm" className="mr-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Tambah Lembaga Baru</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informasi Lembaga</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lembaga *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lembaga"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan email lembaga"
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Masukkan nomor telepon"
                                />
                                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
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

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Masukkan alamat lengkap"
                                    rows={3}
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo</Label>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="cursor-pointer" />
                                        <p className="mt-1 text-sm text-gray-500">Upload logo lembaga (JPG, PNG, GIF max 2MB)</p>
                                    </div>
                                    {logoPreview && (
                                        <div className="h-20 w-20">
                                            <img src={logoPreview} alt="Logo preview" className="h-full w-full rounded border object-cover" />
                                        </div>
                                    )}
                                </div>
                                {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Link href={route('admin.other-institutions.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Lembaga'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
