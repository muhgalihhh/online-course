import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Users, DollarSign, Calendar, Building2, Tag, ChevronRight, Image as ImageIcon, Layers, GraduationCap } from 'lucide-react';

interface CourseShowProps extends PageProps {
	course: {
		id: number;
		title: string;
		description: string;
		price: number;
		is_pro: boolean;
		thumbnail_path?: string;
		thumbnail?: string;
		institution: { id: number; name: string };
		category: { id: number; name: string };
		chapters: { id: number; title: string; course_materials_count: number }[];
		users: { id: number; name: string }[];
		created_at: string;
		updated_at?: string;
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
				{/* Header Section */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<Link href={route('admin.courses.index')}>
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Kembali
							</Button>
						</Link>
						<Separator orientation="vertical" className="h-6" />
						<h1 className="text-3xl font-bold">Detail Kursus</h1>
					</div>
					<div className="flex gap-2">
						<Link href={route('admin.courses.edit', course.id)}>
							<Button variant="outline">
								Edit Kursus
							</Button>
						</Link>
						<Link href={route('admin.chapters.by-course', course.id)}>
							<Button>
								<Layers className="h-4 w-4 mr-2" />
								Kelola Chapter
							</Button>
						</Link>
					</div>
				</div>

				{/* Hero Section with Thumbnail */}
				<Card className="overflow-hidden">
					<div className="grid md:grid-cols-3 gap-6">
						{/* Thumbnail Section */}
						<div className="md:col-span-1">
							<div className="aspect-video md:aspect-square relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg m-6">
								{course.thumbnail || course.thumbnail_path ? (
									<img
										src={course.thumbnail || `/storage/${course.thumbnail_path}`}
										alt={course.title}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<div className="text-center">
											<ImageIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
											<p className="text-sm text-muted-foreground">No Thumbnail</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Course Info Section */}
						<div className="md:col-span-2 p-6">
							<div className="space-y-4">
								<div>
									<h2 className="text-2xl font-bold mb-2">{course.title}</h2>
									<div className="flex items-center gap-2 mb-4">
										<Badge variant={course.is_pro ? 'default' : 'secondary'} className="text-xs">
											{course.is_pro ? 'Pro' : 'Free'}
										</Badge>
										<Badge variant="outline" className="text-xs">
											<DollarSign className="h-3 w-3 mr-1" />
											Rp {course.price.toLocaleString('id-ID')}
										</Badge>
									</div>
								</div>

								<Separator />

								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-xs text-muted-foreground">Institusi</p>
											<p className="font-medium">{course.institution.name}</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Tag className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-xs text-muted-foreground">Kategori</p>
											<p className="font-medium">{course.category.name}</p>
										</div>
									</div>
								</div>

								<div>
									<p className="text-sm font-medium mb-2">Deskripsi</p>
									<p className="text-muted-foreground leading-relaxed">{course.description}</p>
								</div>

								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										<span>Dibuat: {new Date(course.created_at).toLocaleDateString('id-ID', { 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric' 
										})}</span>
									</div>
									{course.updated_at && (
										<div className="flex items-center gap-1">
											<Calendar className="h-4 w-4" />
											<span>Diperbarui: {new Date(course.updated_at).toLocaleDateString('id-ID', { 
												year: 'numeric', 
												month: 'long', 
												day: 'numeric' 
											})}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Statistics Cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Chapter</CardTitle>
							<BookOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{course.chapters.length}</div>
							<p className="text-xs text-muted-foreground">Chapter dalam kursus</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Materi</CardTitle>
							<Layers className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{course.chapters.reduce((sum, ch) => sum + ch.course_materials_count, 0)}
							</div>
							<p className="text-xs text-muted-foreground">Total materi pembelajaran</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Peserta Terdaftar</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{course.users.length}</div>
							<p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
						</CardContent>
					</Card>
				</div>

				{/* Tabs Section */}
				<Tabs defaultValue="chapters" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="chapters">
							<BookOpen className="h-4 w-4 mr-2" />
							Chapter & Materi
						</TabsTrigger>
						<TabsTrigger value="students">
							<Users className="h-4 w-4 mr-2" />
							Peserta Terdaftar
						</TabsTrigger>
					</TabsList>

					<TabsContent value="chapters">
						<Card>
							<CardHeader>
								<CardTitle>Daftar Chapter</CardTitle>
								<CardDescription>
									Semua chapter dan materi dalam kursus ini
								</CardDescription>
							</CardHeader>
							<CardContent>
								{course.chapters.length > 0 ? (
									<div className="space-y-2">
										{course.chapters.map((ch, index) => (
											<Link
												key={ch.id}
												href={route('admin.chapters.show', ch.id)}
												className="block"
											>
												<div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
													<div className="flex items-center gap-3">
														<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
															{index + 1}
														</div>
														<div>
															<p className="font-medium">{ch.title}</p>
															<p className="text-sm text-muted-foreground">
																{ch.course_materials_count} materi pembelajaran
															</p>
														</div>
													</div>
													<div className="flex items-center gap-2">
														<Badge variant="secondary">
															{ch.course_materials_count} materi
														</Badge>
														<ChevronRight className="h-4 w-4 text-muted-foreground" />
													</div>
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
										<p className="text-muted-foreground">Belum ada chapter dalam kursus ini</p>
										<Link href={route('admin.chapters.create')}>
											<Button variant="outline" size="sm" className="mt-4">
												Tambah Chapter
											</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="students">
						<Card>
							<CardHeader>
								<CardTitle>Peserta Terdaftar</CardTitle>
								<CardDescription>
									Daftar pengguna yang terdaftar dalam kursus ini
								</CardDescription>
							</CardHeader>
							<CardContent>
								{course.users.length > 0 ? (
									<div className="space-y-2">
										{course.users.map((user) => (
											<div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border">
												<Avatar className="h-10 w-10">
													<AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
													<AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
												</Avatar>
												<div className="flex-1">
													<p className="font-medium">{user.name}</p>
													<p className="text-sm text-muted-foreground">ID: {user.id}</p>
												</div>
												<Badge variant="outline">
													<GraduationCap className="h-3 w-3 mr-1" />
													Peserta
												</Badge>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
										<p className="text-muted-foreground">Belum ada peserta terdaftar</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</AdminLayout>
	);
}