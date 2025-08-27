import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';

const breadcrumbs = (id: number): BreadcrumbItem[] => [
	{ title: 'Admin', href: route('admin.dashboard') },
	{ title: 'Chapters', href: route('admin.chapters.index') },
	{ title: 'Edit', href: route('admin.chapters.edit', id) },
];

interface Course { id: number; title: string; }

interface Chapter {
	id: number;
	course_id: number;
	title: string;
	description?: string;
	order: number;
	duration?: number;
	is_free?: boolean;
}

interface EditChapterProps extends PageProps {
	chapter: Chapter;
	courses: Course[];
}

export default function EditChapter({ chapter, courses }: EditChapterProps) {
	const { data, setData, put, processing, errors } = useForm({
		course_id: chapter.course_id.toString(),
		title: chapter.title,
		description: chapter.description || '',
		order: chapter.order.toString(),
		duration: chapter.duration?.toString() || '',
		is_free: Boolean(chapter.is_free),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		put(route('admin.chapters.update', chapter.id));
	};

	return (
		<AdminLayout breadcrumbs={breadcrumbs(chapter.id)}>
			<Head title="Edit Chapter" />

			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Edit Chapter</h1>
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
								<div className="relative">
									<Input
										id="course_id_display"
										value={courses.find(c => c.id.toString() === data.course_id)?.title || ''}
										disabled
										className="bg-muted cursor-not-allowed"
									/>
									<input
										type="hidden"
										name="course_id"
										value={data.course_id}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Kursus tidak dapat diubah setelah chapter dibuat
									</p>
								</div>
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

				{/* Action Buttons */}
				<div className="flex items-center justify-end gap-4">
					<Link href={route('admin.chapters.index')}>
						<Button variant="outline" type="button">
							Batal
						</Button>
					</Link>
					<Button type="submit" disabled={processing}>
						<Save className="mr-2 h-4 w-4" />
						{processing ? 'Menyimpan...' : 'Simpan Perubahan'}
					</Button>
				</div>
			</form>
		</AdminLayout>
	);
}