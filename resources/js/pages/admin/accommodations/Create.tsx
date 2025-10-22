import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Home, ImageIcon, Save } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

interface FormData {
    name: string;
    description: string;
    price_per_night: string;
    image: File | null;
    is_active: boolean;
}

export default function AccommodationCreate() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        description: '',
        price_per_night: '',
        image: null,
        is_active: true,
    });

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(route('admin.accommodations.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Tambah Akomodasi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('admin.accommodations.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tambah Akomodasi</h1>
                        <p className="text-muted-foreground">Tambahkan akomodasi penginapan baru ke sistem</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5" />
                                        Informasi Dasar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField label="Nama Akomodasi" error={errors.name} required>
                                        <Input
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Masukkan nama akomodasi"
                                        />
                                    </FormField>

                                    <FormField label="Deskripsi" error={errors.description} required>
                                        <Textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Masukkan deskripsi akomodasi"
                                            rows={4}
                                        />
                                    </FormField>

                                    <FormField label="Harga per Malam (Rp)" error={errors.price_per_night} required>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={data.price_per_night}
                                            onChange={(e) => setData('price_per_night', e.target.value)}
                                            placeholder="500000"
                                        />
                                    </FormField>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active">Status Aktif</Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Gambar Akomodasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField label="Upload Gambar" error={errors.image} description="Format: JPG, PNG, WebP (max. 2MB)">
                                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                                    </FormField>

                                    {/* Image Preview */}
                                    {imagePreview && (
                                        <div className="space-y-2">
                                            <Label>Preview</Label>
                                            <div className="h-48 w-full overflow-hidden rounded-md bg-muted">
                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            </div>
                                        </div>
                                    )}

                                    {!imagePreview && (
                                        <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted">
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Belum ada gambar</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Akomodasi'}
                                </Button>

                                <Button type="button" variant="outline" className="w-full" onClick={() => reset()}>
                                    Reset Form
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
