import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Institution {
    id: number;
    name: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_pro: boolean;
    status: 'draft' | 'published';
    institution_id: number;
    category_id: number;
    institution: Institution;
    category: Category;
    thumbnail_path?: string;
    thumbnail?: string;
}

interface CourseEditProps extends PageProps {
    course: Course;
    categories: Category[];
    institutions: Institution[];
}

export default function CourseEdit({ course, categories, institutions }: CourseEditProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        institution_id: course.institution_id.toString(),
        category_id: course.category_id.toString(),
        title: course.title,
        description: course.description,
        price: course.price.toString(),
        is_pro: course.is_pro,
        status: course.status || ('draft' as 'draft' | 'published'),
        thumbnail_path: null as File | null,
    });

    useEffect(() => {
        if (data.thumbnail_path) {
            const objectUrl = URL.createObjectURL(data.thumbnail_path);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(null);
        }
    }, [data.thumbnail_path]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.courses.update', course.id));
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Courses', href: route('admin.courses.index') },
                { title: 'Edit', href: route('admin.courses.edit', course.id) },
            ]}
        >
            <Head title="Edit Course" />

            <div className="">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('admin.courses.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Edit Kursus</h1>
                    </div>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Informasi Kursus</CardTitle>
                        <CardDescription>Perbarui informasi kursus di bawah ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="institution_id">Institusi</Label>
                                    <Select value={data.institution_id} onValueChange={(value) => setData('institution_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih institusi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutions.map((institution) => (
                                                <SelectItem key={institution.id} value={institution.id.toString()}>
                                                    {institution.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.institution_id && <p className="text-sm text-red-600">{errors.institution_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Kategori</Label>
                                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Kursus</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul kursus"
                                />
                                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Masukkan deskripsi kursus"
                                    rows={4}
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail_path">Thumbnail Kursus</Label>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <div className="group relative">
                                            {preview || course.thumbnail ? (
                                                <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                                                    <img src={preview || course.thumbnail} alt="Preview" className="h-full w-full object-cover" />
                                                    {preview && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={() => setData('thumbnail_path', null)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor="thumbnail_path"
                                                    className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted/70"
                                                >
                                                    <Upload className="mb-3 h-10 w-10 text-muted-foreground transition-transform group-hover:scale-110" />
                                                    <p className="text-sm font-medium text-muted-foreground">Klik untuk upload</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">atau drag & drop gambar di sini</p>
                                                </label>
                                            )}
                                        </div>
                                        <Input
                                            id="thumbnail_path"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('thumbnail_path', e.target.files ? e.target.files[0] : null)}
                                            className="hidden"
                                        />
                                        {!preview && course.thumbnail && (
                                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                                Upload gambar baru untuk mengganti thumbnail yang ada
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Tips untuk thumbnail yang baik:</strong>
                                                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                                                    <li>Gunakan gambar dengan resolusi minimal 1280x720 px</li>
                                                    <li>Format yang didukung: JPG, PNG, WebP</li>
                                                    <li>Ukuran maksimal file: 2MB</li>
                                                    <li>Gunakan gambar yang menarik dan relevan dengan kursus</li>
                                                    <li>Hindari teks berlebihan pada gambar</li>
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                        {errors.thumbnail_path && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.thumbnail_path}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Harga</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0"
                                    />
                                    {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox
                                        id="is_pro"
                                        checked={data.is_pro}
                                        onCheckedChange={(checked) => setData('is_pro', checked as boolean)}
                                    />
                                    <Label htmlFor="is_pro">Kursus Pro</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status Publikasi</Label>
                                <Select value={data.status} onValueChange={(value: 'draft' | 'published') => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft (Belum dipublikasi)</SelectItem>
                                        <SelectItem value="published">Published (Sudah dipublikasi)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                            </div>

                            <div className="flex justify-end space-x-2 border-t pt-4">
                                <Link href={route('admin.courses.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Update Kursus'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
