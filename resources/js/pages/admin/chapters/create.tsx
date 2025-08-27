// resources/js/pages/admin/chapters/create.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Chapters',
        href: route('admin.chapters.index'),
    },
    {
        title: 'Create',
        href: route('admin.chapters.create'),
    },
];

interface Course {
    id: number;
    title: string;
}

interface CreateChapterProps extends PageProps {
    courses: Course[];
    selected_course_id?: number;
}

export default function CreateChapter({ courses, selected_course_id }: CreateChapterProps) {
    const { data, setData, post, processing, errors } = useForm({
        course_id: selected_course_id ? selected_course_id.toString() : '',
        title: '',
        description: '',
        order: '',
        duration: '',
        is_free: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.chapters.store'));
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Chapter" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Tambah Chapter Baru</h1>
                    <p className="text-muted-foreground">
                        Buat chapter baru untuk kursus yang dipilih
                    </p>
                </div>
                <Link href={route('admin.chapters.index')}>
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Informasi Dasar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="course_id">Kursus *</Label>
                                <Select 
                                    value={data.course_id} 
                                    onValueChange={(value) => setData('course_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kursus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.course_id && (
                                    <p className="text-sm text-red-600">{errors.course_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Chapter *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul chapter"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Masukkan deskripsi chapter"
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chapter Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Chapter</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="order">Urutan *</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', e.target.value)}
                                    placeholder="1"
                                    min="1"
                                />
                                {errors.order && (
                                    <p className="text-sm text-red-600">{errors.order}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Durasi (menit) *</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={data.duration}
                                    onChange={(e) => setData('duration', e.target.value)}
                                    placeholder="30"
                                    min="1"
                                />
                                {errors.duration && (
                                    <p className="text-sm text-red-600">{errors.duration}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Chapter Gratis</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Chapter ini dapat diakses tanpa membeli kursus
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_free}
                                    onCheckedChange={(checked) => setData('is_free', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview Chapter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">
                                        {data.title || 'Judul Chapter'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {data.description || 'Deskripsi chapter akan muncul di sini'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">Chapter {data.order || '1'}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {data.duration ? `${data.duration} menit` : 'Durasi belum diatur'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Kursus:</span>
                                <span className="text-sm font-medium">
                                    {courses.find(c => c.id.toString() === data.course_id)?.title || 'Belum dipilih'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                    data.is_free 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {data.is_free ? 'Gratis' : 'Premium'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4">
                    <Link href={route('admin.chapters.index')}>
                        <Button variant="outline" type="button">
                            Batal
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Menyimpan...' : 'Simpan Chapter'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}