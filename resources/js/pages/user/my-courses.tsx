import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
    BookOpen, 
    Clock, 
    GraduationCap, 
    Star, 
    Users,
    Play,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

interface MyCoursesProps {
    enrollments: Course[];
}

export default function MyCourses({ enrollments }: MyCoursesProps) {
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

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <GuestLayout>
            <Head title="Kelas Saya" />
            
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Header Section */}
                <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Kelas Saya</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Lanjutkan perjalanan belajar Anda
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{enrollments.length} Kelas Terdaftar</span>
                                </div>
                                <Button asChild>
                                    <Link href="/courses">
                                        Jelajahi Kelas Lain
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-8">
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
                                            <Clock className="h-3 w-3" />
                                            <span>Terdaftar: {formatDate(course.enrolled_at)}</span>
                                        </div>

                                        {/* Action Button */}
                                        <Button asChild className="w-full">
                                            <Link href={`/courses/${course.id}/learn`}>
                                                <Play className="mr-2 h-4 w-4" />
                                                {course.user_progress > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}