import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Image } from 'lucide-react';
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
    institution_id: number;
    category_id: number;
    institution: Institution;
    category: Category;
    thumbnail_path?: string;
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
                <div className="flex items-center mb-6">
                    <Button variant="ghost" size="sm" className="mr-2">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Kursus</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informasi Kursus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="institution_id">Institusi</Label>
                                    <Select
                                        value={data.institution_id}
                                        onValueChange={(value) => setData('institution_id', value)}
                                    >
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
                                    {errors.institution_id && (
                                        <p className="text-sm text-red-600">{errors.institution_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Kategori</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                    >
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
                                    {errors.category_id && (
                                        <p className="text-sm text-red-600">{errors.category_id}</p>
                                    )}
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
                                <div className="flex items-center space-x-4">
                                    {(preview || course.thumbnail_path) && (
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={preview || `/storage/${course.thumbnail_path}`}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    {!preview && !course.thumbnail_path && (
                                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <Image className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            id="thumbnail_path"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('thumbnail_path', e.target.files ? e.target.files[0] : null)}
                                            className={errors.thumbnail_path ? 'border-red-500' : ''}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Upload gambar JPG, PNG, atau WebP (maksimal 2MB) untuk mengganti thumbnail
                                        </p>
                                        {errors.thumbnail_path && <p className="text-sm text-red-600">{errors.thumbnail_path}</p>}
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

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
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