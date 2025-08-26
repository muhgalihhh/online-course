import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface CourseSummary {
	id: number;
	title: string;
	chapters_count: number;
}

interface CategoryShowProps extends PageProps {
	category: {
		id: number;
		name: string;
		description: string | null;
		created_at: string;
		courses: CourseSummary[];
	};
}

export default function CategoryShow({ category }: CategoryShowProps) {
	return (
		<AdminLayout
			breadcrumbs={[
				{ title: 'Admin', href: route('admin.dashboard') },
				{ title: 'Categories', href: route('admin.categories.index') },
				{ title: category.name, href: route('admin.categories.show', category.id) },
			]}
		>
			<Head title={`Kategori: ${category.name}`} />

			<div className="space-y-6">
				<div className="flex items-center mb-2">
					<Link href={route('admin.categories.index')}>
						<Button variant="outline" size="sm" className="mr-2">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h1 className="text-2xl font-bold">Detail Kategori</h1>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{category.name}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">{category.description || 'Tidak ada deskripsi'}</p>
						<div className="text-sm text-muted-foreground">
							Dibuat pada {new Date(category.created_at).toLocaleDateString('id-ID')}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Kursus dalam Kategori
							<Badge variant="secondary">{category.courses.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="divide-y">
							{category.courses.map((course) => (
								<div key={course.id} className="py-3 flex items-center justify-between">
									<div className="space-y-1">
										<div className="font-medium">{course.title}</div>
										<div className="text-xs text-muted-foreground">
											{course.chapters_count} chapters
										</div>
									</div>
									<Link href={route('admin.courses.show', course.id)}>
										<Button variant="outline" size="sm">Lihat</Button>
									</Link>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}