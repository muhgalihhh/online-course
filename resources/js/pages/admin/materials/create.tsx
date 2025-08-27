import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Video } from 'lucide-react';

interface Chapter { id: number; title: string; course: { id: number; title: string } }

interface CreateMaterialProps extends PageProps {
	chapters: Chapter[];
}

export default function CreateMaterial({ chapters }: CreateMaterialProps) {
	const { data, setData, post, processing, errors } = useForm<{ 
		course_id: string; chapter_id: string; title: string; order: string; type: 'pdf'|'image'|'video_local'|'video_youtube'|''; file_path: File | null; youtube_url: string; is_preview: boolean; 
	}>({
		course_id: '',
		chapter_id: '',
		title: '',
		order: '0',
		type: '',
		file_path: null,
		youtube_url: '',
		is_preview: false,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post(route('admin.materials.store'));
	};

	const getFileAccept = () => {
		switch (data.type) {
			case 'pdf':
				return '.pdf';
			case 'image':
				return '.jpg,.jpeg,.png,.gif,.webp';
			case 'video_local':
				return '.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm';
			default:
				return '';
		}
	};

	const getFileHelperText = () => {
		switch (data.type) {
			case 'pdf':
				return 'Upload file PDF (maksimal 10MB)';
			case 'image':
				return 'Upload gambar JPG, PNG, GIF, atau WebP (maksimal 5MB)';
			case 'video_local':
				return 'Upload video MP4, MOV, AVI, dll (maksimal 100MB)';
			default:
				return '';
		}
	};

	// Group chapters by course for better organization
	const courseGroups = chapters.reduce((acc, chapter) => {
		const courseId = chapter.course.id;
		if (!acc[courseId]) {
			acc[courseId] = {
				course: chapter.course,
				chapters: []
			};
		}
		acc[courseId].chapters.push(chapter);
		return acc;
	}, {} as Record<number, { course: { id: number; title: string }; chapters: Chapter[] }>);
	const courses = Object.values(courseGroups).map(({ course }) => course);
	const filteredChapters = data.course_id ? (courseGroups[Number(data.course_id)]?.chapters ?? []) : [];

	return (
		<AdminLayout
			breadcrumbs={[
				{ title: 'Admin', href: route('admin.dashboard') },
				{ title: 'Materials', href: route('admin.materials.index') },
				{ title: 'Create', href: route('admin.materials.create') },
			]}
		>
			<Head title="Create Material" />

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Tambah Materi</h1>
				<Link href={route('admin.materials.index')}>
					<Button variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Kembali
					</Button>
				</Link>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Informasi Materi</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Course *</Label>
								<Select value={data.course_id} onValueChange={(v) => { setData('course_id', v); setData('chapter_id', ''); }}>
									<SelectTrigger>
										<SelectValue placeholder="Pilih course" />
									</SelectTrigger>
									<SelectContent>
										{courses.map((course) => (
											<SelectItem key={course.id} value={course.id.toString()}>
												{course.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Chapter *</Label>
								<Select value={data.chapter_id} onValueChange={(v) => setData('chapter_id', v)} disabled={!data.course_id}>
									<SelectTrigger>
										<SelectValue placeholder={data.course_id ? "Pilih chapter" : "Pilih course terlebih dahulu"} />
									</SelectTrigger>
									<SelectContent>
										{filteredChapters.map((ch) => (
											<SelectItem key={ch.id} value={ch.id.toString()}>
												{ch.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.chapter_id && <p className="text-sm text-red-600">{errors.chapter_id}</p>}
							</div>

							<div className="space-y-2">
								<Label>Judul *</Label>
								<Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Judul materi" />
								{errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
							</div>

							<div className="space-y-2">
								<Label>Urutan *</Label>
								<Input type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} min="0" />
								{errors.order && <p className="text-sm text-red-600">{errors.order}</p>}
							</div>

							<div className="space-y-2">
								<Label>Tipe *</Label>
								<Select value={data.type} onValueChange={(v) => setData('type', v as any)}>
									<SelectTrigger>
										<SelectValue placeholder="Pilih tipe" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pdf">
											<div className="flex items-center gap-2">
												<FileText className="h-4 w-4" />
												PDF Document
											</div>
										</SelectItem>
										<SelectItem value="image">
											<div className="flex items-center gap-2">
												<FileText className="h-4 w-4" />
												Gambar/Image
											</div>
										</SelectItem>
										<SelectItem value="video_local">
											<div className="flex items-center gap-2">
												<Video className="h-4 w-4" />
												Video Lokal
											</div>
										</SelectItem>
										<SelectItem value="video_youtube">
											<div className="flex items-center gap-2">
												<Video className="h-4 w-4" />
												Video YouTube
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
								{errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
							</div>
						</div>

						{/* Conditional inputs based on type */}
						{(data.type === 'pdf' || data.type === 'image' || data.type === 'video_local') && (
							<div className="space-y-2">
								<Label>File *</Label>
								<Input 
									type="file" 
									accept={getFileAccept()}
									onChange={(e) => setData('file_path', e.target.files?.[0] || null)} 
								/>
								<p className="text-sm text-gray-500">{getFileHelperText()}</p>
								{errors.file_path && <p className="text-sm text-red-600">{errors.file_path}</p>}
							</div>
						)}

						{data.type === 'video_youtube' && (
							<div className="space-y-2">
								<Label>URL YouTube *</Label>
								<Input 
									value={data.youtube_url} 
									onChange={(e) => setData('youtube_url', e.target.value)} 
									placeholder="https://youtu.be/... atau https://www.youtube.com/watch?v=..." 
								/>
								<p className="text-sm text-gray-500">Masukkan URL YouTube yang valid</p>
								{errors.youtube_url && <p className="text-sm text-red-600">{errors.youtube_url}</p>}
							</div>
						)}

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Jadikan Preview</Label>
								<p className="text-sm text-muted-foreground">Materi dapat diakses tanpa membeli kursus</p>
							</div>
							<Switch checked={data.is_preview} onCheckedChange={(v) => setData('is_preview', v)} />
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center justify-end gap-4">
					<Link href={route('admin.materials.index')}>
						<Button variant="outline" type="button">Batal</Button>
					</Link>
					<Button type="submit" disabled={processing}>
						<Save className="mr-2 h-4 w-4" />
						{processing ? 'Menyimpan...' : 'Simpan Materi'}
					</Button>
				</div>
			</form>
		</AdminLayout>
	);
}