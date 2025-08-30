import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Video, File } from 'lucide-react';

interface MaterialShowProps extends PageProps {
	material: {
		id: number;
		title: string;
		type: 'pdf'|'image'|'video_local'|'video_youtube';
		order: number;
		is_preview: boolean;
		file_path: string | null;
		file_url?: string | null;
		youtube_url: string | null;
		chapter: { id: number; title: string; course: { id: number; title: string } };
		created_at: string;
	};
}

export default function MaterialShow({ material }: MaterialShowProps) {
	return (
		<AdminLayout
			breadcrumbs={[
				{ title: 'Admin', href: route('admin.dashboard') },
				{ title: 'Materials', href: route('admin.materials.index') },
				{ title: material.title, href: route('admin.materials.show', material.id) },
			]}
		>
			<Head title={`Materi: ${material.title}`} />

			<div className="space-y-6">
				<div className="flex items-center mb-2">
					<Link href={route('admin.materials.index')}>
						<Button variant="outline" size="sm" className="mr-2">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h1 className="text-2xl font-bold">Detail Materi</h1>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{material.title}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>Chapter:</span>
							<span className="font-medium">{material.chapter.title}</span>
							<span className="text-muted-foreground">— {material.chapter.course.title}</span>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline">Order {material.order}</Badge>
							<Badge variant={material.is_preview ? 'default' : 'secondary'}>
								{material.is_preview ? 'Preview' : 'Full'}
							</Badge>
							<Badge>
								{material.type.toUpperCase()}
							</Badge>
						</div>

						<div className="p-4 border rounded-md">
							{material.type === 'video_youtube' ? (
								<div className="flex items-center gap-2 text-sm">
									<Video className="h-4 w-4" />
									<span>YouTube: {material.youtube_url || '-'}</span>
								</div>
							) : material.type === 'video_local' ? (
								<div className="flex items-center gap-2 text-sm">
									<Video className="h-4 w-4" />
									<span>Video: {material.file_url || material.file_path || '-'}</span>
								</div>
							) : (
								<div className="flex items-center gap-2 text-sm">
									<File className="h-4 w-4" />
									<span>File: {material.file_url || material.file_path || '-'}</span>
								</div>
							)}
						</div>

						<div className="text-sm text-muted-foreground">
							Dibuat pada {new Date(material.created_at).toLocaleDateString('id-ID')}
						</div>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}