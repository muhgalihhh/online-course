import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, FileText, Video, Plus, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Course { id: number; title: string; }

interface Material {
	id: number;
	title: string;
	order: number;
	type: 'pdf'|'image'|'video';
	is_preview: boolean;
}

interface ChapterShowProps extends PageProps {
	chapter: {
		id: number;
		title: string;
		description?: string;
		order: number;
		duration?: number;
		is_free?: boolean;
		course: Course;
		course_materials: Material[];
	};
}

export default function ChapterShow({ chapter }: ChapterShowProps) {
	const [isFormExpanded, setIsFormExpanded] = useState(false);
	
	const { data, setData, post, processing, errors, reset } = useForm<{ 
		course_id: string; 
		chapter_id: string; 
		title: string; 
		order: string; 
		type: 'pdf'|'image'|'video_local'|'video_youtube'|''; 
		file_path: File | null; 
		youtube_url: string; 
		is_preview: boolean; 
	}>({
		course_id: chapter.course.id.toString(),
		chapter_id: chapter.id.toString(),
		title: '',
		order: (chapter.course_materials.length + 1).toString(),
		type: '',
		file_path: null,
		youtube_url: '',
		is_preview: false,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post(route('admin.materials.store'), {
			onSuccess: () => {
				reset();
				setIsFormExpanded(false);
			}
		});
	};

	const handleCancel = () => {
		reset();
		setIsFormExpanded(false);
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
	return (
		<AdminLayout
			breadcrumbs={[
				{ title: 'Admin', href: route('admin.dashboard') },
				{ title: 'Chapters', href: route('admin.chapters.index') },
				{ title: chapter.title, href: route('admin.chapters.show', chapter.id) },
			]}
		>
			<Head title={`Chapter: ${chapter.title}`} />

			<div className="space-y-6">
				<div className="flex items-center mb-2">
					<Link href={route('admin.chapters.index')}>
						<Button variant="outline" size="sm" className="mr-2">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h1 className="text-2xl font-bold">Detail Chapter</h1>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							{chapter.title}
							<Badge variant="secondary">Chapter {chapter.order}</Badge>
							{chapter.is_free && <Badge variant="default">Gratis</Badge>}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="text-sm text-muted-foreground">Kursus: {chapter.course.title}</div>
						{chapter.duration && (
							<div className="text-sm text-muted-foreground">
								Durasi: {Math.floor(chapter.duration / 60) > 0 && `${Math.floor(chapter.duration / 60)}h `}{chapter.duration % 60}m
							</div>
						)}
						{chapter.description && (
							<p className="text-muted-foreground">{chapter.description}</p>
						)}
						<div className="flex items-center gap-4 text-sm">
							<span className="text-muted-foreground">Status:</span>
							<Badge variant={chapter.is_free ? "default" : "secondary"}>
								{chapter.is_free ? "Chapter Gratis" : "Chapter Premium"}
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Daftar Materi</CardTitle>
							<Button 
								size="sm" 
								onClick={() => setIsFormExpanded(!isFormExpanded)}
								variant={isFormExpanded ? "secondary" : "default"}
							>
								{isFormExpanded ? (
									<>
										<ChevronUp className="mr-2 h-4 w-4" />
										Tutup Form
									</>
								) : (
									<>
										<Plus className="mr-2 h-4 w-4" />
										Tambah Materi
									</>
								)}
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{/* Expandable Form Section */}
						{isFormExpanded && (
							<div className="mb-6 p-4 border rounded-lg bg-muted/50">
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold">Form Tambah Materi</h3>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={handleCancel}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										{/* Course Field - Disabled */}
										<div className="space-y-2">
											<Label>Course</Label>
											<Input 
												value={chapter.course.title} 
												disabled 
												className="bg-muted"
											/>
											<p className="text-xs text-muted-foreground">
												Course sudah dipilih otomatis
											</p>
										</div>

										{/* Chapter Field - Disabled */}
										<div className="space-y-2">
											<Label>Chapter</Label>
											<Input 
												value={chapter.title} 
												disabled 
												className="bg-muted"
											/>
											<p className="text-xs text-muted-foreground">
												Chapter sudah dipilih otomatis
											</p>
										</div>

										{/* Title Field */}
										<div className="space-y-2">
											<Label>Judul Materi *</Label>
											<Input 
												value={data.title} 
												onChange={(e) => setData('title', e.target.value)} 
												placeholder="Masukkan judul materi"
											/>
											{errors.title && (
												<p className="text-sm text-red-600">{errors.title}</p>
											)}
										</div>

										{/* Order Field */}
										<div className="space-y-2">
											<Label>Urutan *</Label>
											<Input 
												type="number" 
												value={data.order} 
												onChange={(e) => setData('order', e.target.value)} 
												min="1"
											/>
											{errors.order && (
												<p className="text-sm text-red-600">{errors.order}</p>
											)}
										</div>

										{/* Type Field */}
										<div className="space-y-2 md:col-span-2">
											<Label>Tipe Materi *</Label>
											<Select 
												value={data.type} 
												onValueChange={(v) => setData('type', v as any)}
											>
												<SelectTrigger>
													<SelectValue placeholder="Pilih tipe materi" />
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
											{errors.type && (
												<p className="text-sm text-red-600">{errors.type}</p>
											)}
										</div>
									</div>

									{/* Conditional File Upload */}
									{(data.type === 'pdf' || data.type === 'image' || data.type === 'video_local') && (
										<div className="space-y-2">
											<Label>File *</Label>
											<Input 
												type="file" 
												accept={getFileAccept()}
												onChange={(e) => setData('file_path', e.target.files?.[0] || null)} 
											/>
											<p className="text-sm text-muted-foreground">
												{getFileHelperText()}
											</p>
											{errors.file_path && (
												<p className="text-sm text-red-600">{errors.file_path}</p>
											)}
										</div>
									)}

									{/* YouTube URL Field */}
									{data.type === 'video_youtube' && (
										<div className="space-y-2">
											<Label>URL YouTube *</Label>
											<Input 
												value={data.youtube_url} 
												onChange={(e) => setData('youtube_url', e.target.value)} 
												placeholder="https://youtu.be/... atau https://www.youtube.com/watch?v=..." 
											/>
											<p className="text-sm text-muted-foreground">
												Masukkan URL YouTube yang valid
											</p>
											{errors.youtube_url && (
												<p className="text-sm text-red-600">{errors.youtube_url}</p>
											)}
										</div>
									)}

									{/* Preview Switch */}
									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div className="space-y-0.5">
											<Label>Jadikan Preview</Label>
											<p className="text-sm text-muted-foreground">
												Materi dapat diakses tanpa membeli kursus
											</p>
										</div>
										<Switch 
											checked={data.is_preview} 
											onCheckedChange={(v) => setData('is_preview', v)} 
										/>
									</div>

									{/* Form Actions */}
									<div className="flex items-center justify-end gap-3 pt-4 border-t">
										<Button 
											type="button" 
											variant="outline" 
											onClick={handleCancel}
										>
											Batal
										</Button>
										<Button 
											type="submit" 
											disabled={processing}
										>
											<Save className="mr-2 h-4 w-4" />
											{processing ? 'Menyimpan...' : 'Simpan Materi'}
										</Button>
									</div>
								</form>
							</div>
						)}

						{/* Materials List */}
						<div className="divide-y">
							{chapter.course_materials.length === 0 ? (
								<div className="py-8 text-center text-muted-foreground">
									<FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
									<p>Belum ada materi di chapter ini</p>
									<p className="text-sm mt-1">Klik tombol "Tambah Materi" untuk menambahkan materi baru</p>
								</div>
							) : (
								chapter.course_materials.map((m) => (
									<div key={m.id} className="py-3 flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Badge variant="outline" className="font-mono">{m.order}</Badge>
											{m.type === 'video' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
											<div>
												<div className="font-medium">{m.title}</div>
												<div className="text-xs text-muted-foreground uppercase">{m.type}</div>
											</div>
										</div>
										<Badge variant={m.is_preview ? 'default' : 'secondary'}>
											{m.is_preview ? 'Preview' : 'Full'}
										</Badge>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}