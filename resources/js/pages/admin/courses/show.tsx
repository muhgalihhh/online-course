import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface CourseShowProps extends PageProps {
	course: {
		id: number;
		title: string;
		description: string;
		price: number;
		is_pro: boolean;
		thumbnail_path?: string;
		institution: { id: number; name: string };
		category: { id: number; name: string };
		chapters: { id: number; title: string; course_materials_count: number }[];
		users: { id: number; name: string }[];
		created_at: string;
	};
}

export default function CourseShow({ course }: CourseShowProps) {
	return (
		<AdminLayout
			breadcrumbs={[
				{ title: 'Admin', href: route('admin.dashboard') },
				{ title: 'Courses', href: route('admin.courses.index') },
				{ title: course.title, href: route('admin.courses.show', course.id) },
			]}
		>
			<Head title={`Kursus: ${course.title}`} />

			<div className="space-y-6">
				<div className="flex items-center mb-2">
					<Link href={route('admin.courses.index')}>
						<Button variant="outline" size="sm" className="mr-2">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h1 className="text-2xl font-bold">Detail Kursus</h1>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{course.title}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="text-sm text-muted-foreground">Institusi: {course.institution.name}</div>
						<div className="text-sm text-muted-foreground">Kategori: {course.category.name}</div>
						<div className="flex items-center gap-2">
							<Badge variant={course.is_pro ? 'default' : 'secondary'}>
								{course.is_pro ? 'Pro' : 'Free'}
							</Badge>
							<Badge variant="outline">Rp {course.price.toLocaleString('id-ID')}</Badge>
						</div>
						<p className="text-muted-foreground">{course.description}</p>
						<div className="text-sm text-muted-foreground">
							Dibuat pada {new Date(course.created_at).toLocaleDateString('id-ID')}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Chapters</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="divide-y">
							{course.chapters.map((ch) => (
								<div key={ch.id} className="py-3 flex items-center justify-between">
									<div className="font-medium">{ch.title}</div>
									<Badge variant="secondary">{ch.course_materials_count} materi</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}