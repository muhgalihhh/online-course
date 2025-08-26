import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, FileText, Video } from 'lucide-react';

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
		course: Course;
		course_materials: Material[];
	};
}

export default function ChapterShow({ chapter }: ChapterShowProps) {
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
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="text-sm text-muted-foreground">Kursus: {chapter.course.title}</div>
						{chapter.description && (
							<p className="text-muted-foreground">{chapter.description}</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Daftar Materi</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="divide-y">
							{chapter.course_materials.map((m) => (
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
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}