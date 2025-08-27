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

interface Material {
	id: number;
	chapter_id: number;
	title: string;
	order: number;
	type: 'pdf'|'image'|'video_local'|'video_youtube';
	file_path: string | null;
	youtube_url: string | null;
	is_preview: boolean;
}

interface EditMaterialProps extends PageProps {
	material: Material;
	chapters: Chapter[];
}

export default function EditMaterial({ material, chapters }: EditMaterialProps) {
	// Find the course_id from the material's chapter
	const materialChapter = chapters.find(ch => ch.id === material.chapter_id);
	const materialCourseId = materialChapter ? materialChapter.course.id : null;
	const { data, setData, post, processing, errors } = useForm<{ 
		course_id: string; chapter_id: string; title: string; order: string; type: 'pdf'|'image'|'video_local'|'video_youtube'; file_path: File | null; youtube_url: string; is_preview: boolean; _method?: string;
	}>({
		course_id: '',
		chapter_id: material.chapter_id.toString(),
		title: material.title,
		order: material.order.toString(),
		type: material.type,
		file_path: null,
		youtube_url: material.youtube_url || '',
		is_preview: material.is_preview,
		_method: 'put',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post(route('admin.materials.update', material.id));
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
				return 'Upload file PDF baru (maksimal 10MB) - opsional jika ingin mengganti';
			case 'image':
				return 'Upload gambar baru JPG, PNG, GIF, atau WebP (maksimal 5MB) - opsional jika ingin mengganti';
			case 'video_local':
				return 'Upload video baru MP4, MOV, AVI, dll (maksimal 100MB) - opsional jika ingin mengganti';
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
	const effectiveCourseId = data.course_id || (() => {
		const chapter = chapters.find(ch => ch.id.toString() === data.chapter_id);
		return chapter ? chapter.course.id.toString() : '';
	})();
	const filteredChapters = effectiveCourseId ? (courseGroups[Number(effectiveCourseId)]?.chapters ?? []) : [];

	return (
		<AdminLayout
			breadcrumbs={[
				{ title: 'Admin', href: route('admin.dashboard') },
				{ title: 'Materials', href: route('admin.materials.index') },
				{ title: 'Edit', href: route('admin.materials.edit', material.id) },
			]}
		>
			<Head title="Edit Material" />

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Edit Materi</h1>
				<Link href={materialCourseId ? route('admin.materials.index') + '?selected_course=' + materialCourseId : route('admin.materials.index')}>
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
						{/* Current file info */}
						{(material.type !== 'video_youtube' && material.file_path) && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h4 className="font-medium text-blue-900 mb-2">File Saat Ini:</h4>
								<p className="text-blue-700 text-sm">{material.file_path}</p>
							</div>
						)}

						{(material.type === 'video_youtube' && material.youtube_url) && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<h4 className="font-medium text-red-900 mb-2">URL YouTube Saat Ini:</h4>
								<p className="text-red-700 text-sm">{material.youtube_url}</p>
							</div>
						)}

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Course *</Label>
								<Select value={effectiveCourseId} onValueChange={(v) => { setData('course_id', v); setData('chapter_id', ''); }}>
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
								<Select value={data.chapter_id} onValueChange={(v) => setData('chapter_id', v)} disabled={!effectiveCourseId}>
									<SelectTrigger>
										<SelectValue placeholder={effectiveCourseId ? "Pilih chapter" : "Pilih course terlebih dahulu"} />
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
								<Label>File {material.file_path ? '(opsional - kosongkan jika tidak ingin mengganti)' : '(wajib)'}</Label>
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
					<Link href={materialCourseId ? route('admin.materials.index') + '?selected_course=' + materialCourseId : route('admin.materials.index')}>
						<Button variant="outline" type="button">Batal</Button>
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