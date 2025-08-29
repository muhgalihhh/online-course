import UserDashboardLayout from '@/layouts/user-dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    BookOpen, 
    Clock, 
    GraduationCap, 
    Star, 
    Users,
    Play,
    CheckCircle,
    ArrowRight,
    Info,
    Calendar,
    Award,
    TrendingUp
} from 'lucide-react';
import { Link, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    level: string;
    duration: number;
    thumbnail_path?: string;
    status: string;
    average_rating: number;
    total_students: number;
    total_chapters: number;
    user_progress: number;
    enrolled_at: string;
    completed_at?: string;
    category: {
        id: number;
        name: string;
    };
    institution: {
        id: number;
        name: string;
        photo_path?: string;
    };
}

interface HomeProps {
    enrollments: Course[];
    user: {
        name: string;
        email: string;
        role: string;
        created_at: string;
    };
}

const Home: React.FC<HomeProps> = ({ enrollments, user }) => {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const { toast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Berhasil!',
                description: flash.success,
            });
        }
        if (flash?.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: flash.error,
            });
        }
    }, [flash?.success, flash?.error]);

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    };

    const getLevelBadgeVariant = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return 'default';
            case 'intermediate':
                return 'secondary';
            case 'advanced':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Calculate statistics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(c => c.user_progress === 100).length;
    const inProgressCourses = enrollments.filter(c => c.user_progress > 0 && c.user_progress < 100).length;
    const averageProgress = totalCourses > 0 
        ? Math.round(enrollments.reduce((sum, c) => sum + c.user_progress, 0) / totalCourses)
        : 0;

    return (
        <UserDashboardLayout>
            <Head title="Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Header Section */}
                <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Selamat Datang, {user.name}!
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    Berikut adalah daftar kelas yang Anda ambil
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/courses">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Jelajahi Kelas Baru
                                </Link>
                            </Button>
                        </div>

                        {/* Statistics Cards */}
                        <div className="mt-6 grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalCourses}</div>
                                    <p className="text-xs text-muted-foreground">Kelas terdaftar</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sedang Dipelajari</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{inProgressCourses}</div>
                                    <p className="text-xs text-muted-foreground">Kelas aktif</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{completedCourses}</div>
                                    <p className="text-xs text-muted-foreground">Kelas diselesaikan</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Progress Rata-rata</CardTitle>
                                    <Award className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{averageProgress}%</div>
                                    <Progress value={averageProgress} className="mt-2 h-2" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Content Section - Enrolled Courses */}
                <div className="container mx-auto px-4 py-8">
                    <h2 className="mb-6 text-2xl font-bold">Daftar Kelas yang Diambil</h2>
                    
                    {enrollments.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-4">
                                    <GraduationCap className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">Belum Ada Kelas</h3>
                                <p className="mt-2 text-center text-sm text-muted-foreground">
                                    Anda belum terdaftar di kelas manapun. 
                                    Mulai perjalanan belajar Anda sekarang!
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href="/courses">
                                        Jelajahi Kelas
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {enrollments.map((course) => (
                                <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-lg">
                                    {/* Course Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden bg-muted">
                                        {course.thumbnail_path ? (
                                            <img
                                                src={`/storage/${course.thumbnail_path}`}
                                                alt={course.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        
                                        {/* Progress Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs text-white">
                                                    <span>Progress</span>
                                                    <span>{course.user_progress}%</span>
                                                </div>
                                                <Progress 
                                                    value={course.user_progress} 
                                                    className="h-2 bg-white/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Completed Badge */}
                                        {course.user_progress === 100 && (
                                            <div className="absolute right-2 top-2">
                                                <Badge className="gap-1 bg-green-500">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Selesai
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <Badge variant={getLevelBadgeVariant(course.level)}>
                                                {course.level}
                                            </Badge>
                                            <Badge variant="outline">
                                                {course.category.name}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2">
                                            {course.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {course.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Institution */}
                                        <div className="flex items-center gap-2">
                                            {course.institution.photo_path ? (
                                                <img
                                                    src={`/storage/${course.institution.photo_path}`}
                                                    alt={course.institution.name}
                                                    className="h-6 w-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                                    <GraduationCap className="h-3 w-3" />
                                                </div>
                                            )}
                                            <span className="text-sm text-muted-foreground">
                                                {course.institution.name}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500" />
                                                <span>{course.average_rating.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <span>{course.total_students}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                                <span>{course.total_chapters} Bab</span>
                                            </div>
                                        </div>

                                        {/* Enrollment Date */}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>Terdaftar: {formatDate(course.enrolled_at)}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => setSelectedCourse(course)}
                                                    >
                                                        <Info className="mr-2 h-4 w-4" />
                                                        Detail
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>{course.title}</DialogTitle>
                                                        <DialogDescription>
                                                            Informasi lengkap tentang kelas ini
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        {/* Thumbnail */}
                                                        {course.thumbnail_path && (
                                                            <div className="aspect-video overflow-hidden rounded-lg">
                                                                <img
                                                                    src={`/storage/${course.thumbnail_path}`}
                                                                    alt={course.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Details */}
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h4 className="font-semibold">Deskripsi</h4>
                                                                <p className="text-sm text-muted-foreground">{course.description}</p>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold">Kategori</h4>
                                                                    <p className="text-sm text-muted-foreground">{course.category.name}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold">Level</h4>
                                                                    <Badge variant={getLevelBadgeVariant(course.level)}>
                                                                        {course.level}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold">Institusi</h4>
                                                                    <p className="text-sm text-muted-foreground">{course.institution.name}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold">Durasi</h4>
                                                                    <p className="text-sm text-muted-foreground">{course.duration} jam</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold">Rating</h4>
                                                                    <div className="flex items-center gap-1">
                                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                                        <span className="text-sm">{course.average_rating.toFixed(1)}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold">Total Siswa</h4>
                                                                    <p className="text-sm text-muted-foreground">{course.total_students}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold">Total Bab</h4>
                                                                    <p className="text-sm text-muted-foreground">{course.total_chapters}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="font-semibold">Progress Anda</h4>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span>Kemajuan</span>
                                                                        <span>{course.user_progress}%</span>
                                                                    </div>
                                                                    <Progress value={course.user_progress} />
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold">Tanggal Terdaftar</h4>
                                                                    <p className="text-sm text-muted-foreground">{formatDate(course.enrolled_at)}</p>
                                                                </div>
                                                                {course.completed_at && (
                                                                    <div>
                                                                        <h4 className="font-semibold">Tanggal Selesai</h4>
                                                                        <p className="text-sm text-muted-foreground">{formatDate(course.completed_at)}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Action Button in Modal */}
                                                        <Button asChild className="w-full">
                                                            <Link href={`/courses/${course.id}/learn`}>
                                                                <Play className="mr-2 h-4 w-4" />
                                                                {course.user_progress > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            
                                            <Button asChild size="sm" className="flex-1">
                                                <Link href={`/courses/${course.id}/learn`}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    {course.user_progress > 0 ? 'Lanjutkan' : 'Mulai'} Belajar
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </UserDashboardLayout>
    );
};

export default Home;