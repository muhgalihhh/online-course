import { SecureVideoPlayer, useAntiPiracy, VideoWatermark } from '@/components/security/AntiPiracy';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UserDashboardLayout from '@/layouts/user-dashboard-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    AlertCircle,
    Bookmark,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    Image as ImageIcon,
    List,
    MessageSquare,
    MoreVertical,
    PanelLeft,
    PanelLeftClose,
    PlayCircle,
    Share2,
    Target,
    Trophy,
    Video,
    Youtube,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Extend window interface for Laravel data
declare global {
    interface Window {
        Laravel?: {
            user?: {
                name: string;
            };
        };
    }
}

interface Material {
    id: number;
    title: string;
    type: 'pdf' | 'image' | 'video_local' | 'video_youtube';
    order: number;
    is_preview: boolean;
    file_path?: string;
    file_url?: string;
    youtube_url?: string;
    secure_video_url?: string; // For local videos
    secure_youtube_url?: string; // For YouTube videos
    created_at: string;
}

interface Chapter {
    id: number;
    title: string;
    description: string;
    order: number;
    materials: Material[];
}

interface Course {
    id: number;
    title: string;
    description: string;
    level: string;
    duration: number;
    thumbnail_path?: string;
    user_progress: number;
    enrolled_at: string;
    completed_at?: string;
    chapters: Chapter[];
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

interface LearnProps {
    course: Course;
    completedMaterials: number[];
    enrollment: {
        progress: number;
        enrolled_at: string;
        completed_at?: string;
    };
}

// Helper function to extract YouTube ID
const extractYouTubeId = (url: string) => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/, /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
};

export default function Learn({ course, completedMaterials, enrollment }: LearnProps) {
    const [selectedChapter, setSelectedChapter] = useState<Chapter>(course.chapters[0]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [completedMaterialsState, setCompletedMaterialsState] = useState<number[]>(completedMaterials);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('learn-sidebar-open');
        return saved ? JSON.parse(saved) : true;
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<number[]>(() => {
        // Expand the first chapter by default
        return course.chapters.length > 0 ? [course.chapters[0].id] : [];
    });
    const [enrollmentState, setEnrollmentState] = useState(enrollment);

    // Enable anti-piracy protection for video content
    const isVideoContent = selectedMaterial?.type === 'video_youtube' || selectedMaterial?.type === 'video_local';
    useAntiPiracy(isVideoContent);

    // Save sidebar state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('learn-sidebar-open', JSON.stringify(isDesktopSidebarOpen));
    }, [isDesktopSidebarOpen]);

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    };

    const getMaterialIcon = (type: Material['type']) => {
        switch (type) {
            case 'video_youtube':
                return <Youtube className="h-4 w-4" />;
            case 'video_local':
                return <Video className="h-4 w-4" />;
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            case 'image':
                return <ImageIcon className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
        }
    };

    const getMaterialTypeLabel = (type: Material['type']) => {
        switch (type) {
            case 'video_youtube':
                return 'YouTube';
            case 'video_local':
                return 'Video';
            case 'pdf':
                return 'PDF';
            case 'image':
                return 'Gambar';
            default:
                return 'Materi';
        }
    };

    const getMaterialTypeColor = (type: Material['type']) => {
        switch (type) {
            case 'video_youtube':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'video_local':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pdf':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'image':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const handleMaterialComplete = async (materialId: number) => {
        if (completedMaterialsState.includes(materialId) || !selectedChapter) return;
        const nextCompleted = [...completedMaterialsState, materialId];
        setCompletedMaterialsState(nextCompleted);

        const chapterMaterialIds = selectedChapter.materials.map((m) => m.id);
        const allCompleted = chapterMaterialIds.every((id) => nextCompleted.includes(id));
        if (allCompleted) {
            try {
                const response = await fetch(route('courses.chapters.complete', { course: course.id, chapter: selectedChapter.id }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data.completedMaterials)) {
                        setCompletedMaterialsState(data.completedMaterials);
                    }
                    if (data.enrollment) {
                        setEnrollmentState({
                            ...enrollmentState,
                            progress: data.enrollment.progress,
                            completed_at: data.enrollment.completed_at,
                        });
                    }
                }
            } catch (error) {
                // ignore errors; UI already optimistic
            }
        }
    };

    const navigateToNextMaterial = () => {
        const currentChapterIndex = course.chapters.findIndex((ch) => ch.id === selectedChapter.id);
        const currentMaterialIndex = selectedChapter.materials.findIndex((m) => m.id === selectedMaterial?.id);

        if (currentMaterialIndex < selectedChapter.materials.length - 1) {
            // Next material in same chapter
            setSelectedMaterial(selectedChapter.materials[currentMaterialIndex + 1]);
        } else if (currentChapterIndex < course.chapters.length - 1) {
            // First material of next chapter
            const nextChapter = course.chapters[currentChapterIndex + 1];
            setSelectedChapter(nextChapter);
            setSelectedMaterial(nextChapter.materials[0]);
        }
    };

    const navigateToPreviousMaterial = () => {
        const currentChapterIndex = course.chapters.findIndex((ch) => ch.id === selectedChapter.id);
        const currentMaterialIndex = selectedChapter.materials.findIndex((m) => m.id === selectedMaterial?.id);

        if (currentMaterialIndex > 0) {
            // Previous material in same chapter
            setSelectedMaterial(selectedChapter.materials[currentMaterialIndex - 1]);
        } else if (currentChapterIndex > 0) {
            // Last material of previous chapter
            const prevChapter = course.chapters[currentChapterIndex - 1];
            setSelectedChapter(prevChapter);
            setSelectedMaterial(prevChapter.materials[prevChapter.materials.length - 1]);
        }
    };

    const totalMaterials = course.chapters.reduce((sum, ch) => sum + ch.materials.length, 0);
    const progressPercentage = totalMaterials > 0 ? Math.round((completedMaterialsState.length / totalMaterials) * 100) : 0;

    return (
        <UserDashboardLayout>
            <Head title={`Belajar - ${course.title}`} />
            <TooltipProvider>
                <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                    {/* Header */}
                    <div className="border-b bg-background/95 backdrop-blur">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {/* Desktop Sidebar Toggle */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hidden lg:flex"
                                                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                                            >
                                                {isDesktopSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{isDesktopSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}</TooltipContent>
                                    </Tooltip>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/dashboard">
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            Kembali
                                        </Link>
                                    </Button>
                                    <Separator orientation="vertical" className="h-6" />
                                    <div>
                                        <h1 className="text-lg font-semibold">{course.title}</h1>
                                        <p className="text-sm text-muted-foreground">
                                            {course.category.name} • {course.institution.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="lg:hidden">
                                        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <List className="mr-2 h-4 w-4" />
                                                    Daftar Materi
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="left" className="w-[90vw] p-0 sm:w-96">
                                                <SheetHeader className="border-b px-6 py-4">
                                                    <SheetTitle>Daftar Materi</SheetTitle>
                                                    <div className="mt-2">
                                                        <p className="mb-2 text-sm text-muted-foreground">
                                                            {completedMaterialsState.length} dari {totalMaterials} materi selesai
                                                        </p>
                                                        <Progress value={progressPercentage} />
                                                    </div>
                                                </SheetHeader>
                                                <ScrollArea className="h-[calc(100vh-120px)]">
                                                    <div className="px-6 py-4">
                                                        {course.chapters.map((chapter, chapterIndex) => {
                                                            const chapterMaterials = chapter.materials;
                                                            const completedInChapter = chapterMaterials.filter((m) =>
                                                                completedMaterialsState.includes(m.id),
                                                            ).length;
                                                            const isCurrentChapter = selectedChapter?.id === chapter.id;

                                                            return (
                                                                <div key={chapter.id} className="mb-4">
                                                                    {/* Chapter Header */}
                                                                    <div
                                                                        className={`mb-2 flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                                                                            isCurrentChapter
                                                                                ? 'border border-primary/20 bg-primary/10'
                                                                                : 'hover:bg-muted/50'
                                                                        } `}
                                                                        onClick={() => {
                                                                            setSelectedChapter(chapter);
                                                                            setSelectedMaterial(chapter.materials[0] || null);
                                                                            if (chapter.materials[0]) {
                                                                                setIsSidebarOpen(false);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <div
                                                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                                                                        isCurrentChapter
                                                                                            ? 'bg-primary text-primary-foreground'
                                                                                            : 'bg-muted-foreground/20 text-muted-foreground'
                                                                                    } `}
                                                                                >
                                                                                    {chapter.order}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <h4 className="text-sm font-semibold">{chapter.title}</h4>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {completedInChapter}/{chapterMaterials.length} materi selesai
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {completedInChapter === chapterMaterials.length && (
                                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                        )}
                                                                    </div>

                                                                    {/* Materials List - Always visible on mobile */}
                                                                    <div className="ml-10 space-y-1">
                                                                        {chapter.materials.map((material) => {
                                                                            const isCompleted = completedMaterialsState.includes(material.id);
                                                                            const isSelected = selectedMaterial?.id === material.id;

                                                                            return (
                                                                                <div
                                                                                    key={material.id}
                                                                                    className={`flex cursor-pointer items-center gap-2 rounded-md p-2 transition-all duration-200 ${
                                                                                        isSelected
                                                                                            ? 'border border-secondary-foreground/10 bg-secondary shadow-sm'
                                                                                            : 'hover:bg-muted/50'
                                                                                    } `}
                                                                                    onClick={() => {
                                                                                        setSelectedChapter(chapter);
                                                                                        setSelectedMaterial(material);
                                                                                        setIsSidebarOpen(false);
                                                                                    }}
                                                                                >
                                                                                    {/* Status Icon */}
                                                                                    <div className="flex-shrink-0">
                                                                                        {isCompleted ? (
                                                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                                        ) : isSelected ? (
                                                                                            <PlayCircle className="h-4 w-4 text-primary" />
                                                                                        ) : (
                                                                                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Material Icon */}
                                                                                    <div className="flex-shrink-0">
                                                                                        {getMaterialIcon(material.type)}
                                                                                    </div>

                                                                                    {/* Material Info */}
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p
                                                                                            className={`truncate text-sm ${isSelected ? 'font-medium' : ''} ${isCompleted ? 'text-muted-foreground line-through' : ''} `}
                                                                                        >
                                                                                            {material.title}
                                                                                        </p>
                                                                                    </div>

                                                                                    {/* Material Type Badge */}
                                                                                    <Badge
                                                                                        variant="secondary"
                                                                                        className={`px-2 py-0 text-xs ${getMaterialTypeColor(material.type)}`}
                                                                                    >
                                                                                        {getMaterialTypeLabel(material.type)}
                                                                                    </Badge>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {chapterIndex < course.chapters.length - 1 && <Separator className="mt-4" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ScrollArea>
                                            </SheetContent>
                                        </Sheet>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Progress Kelas</p>
                                        <p className="text-sm text-muted-foreground">{progressPercentage}% Selesai</p>
                                    </div>
                                    <Progress value={progressPercentage} className="w-32" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex h-[calc(100vh-73px)]">
                        {/* Desktop Sidebar */}
                        <div
                            className={`hidden overflow-hidden border-r bg-card shadow-lg transition-all duration-300 lg:block ${isDesktopSidebarOpen ? 'w-[350px] xl:w-[400px]' : 'w-0'} `}
                        >
                            <div className="flex h-full flex-col bg-gradient-to-b from-background to-muted/20">
                                {/* Sidebar Header */}
                                <div className="border-b bg-background/80 p-6 backdrop-blur">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold">Daftar Materi</h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Bagikan Kelas
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Bookmark className="mr-2 h-4 w-4" />
                                                    Simpan Progress
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Diskusi
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Progress Card */}
                                    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                                        <CardContent className="p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-medium">Progress Belajar</span>
                                                </div>
                                                <Badge variant="secondary" className="bg-primary/20 text-primary">
                                                    {progressPercentage}%
                                                </Badge>
                                            </div>
                                            <Progress value={progressPercentage} className="h-2" />
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {completedMaterialsState.length} dari {totalMaterials} materi selesai
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar Content */}
                                <ScrollArea className="flex-1">
                                    <div className="space-y-2 p-4">
                                        {course.chapters.map((chapter, chapterIndex) => {
                                            const chapterMaterials = chapter.materials;
                                            const completedInChapter = chapterMaterials.filter((m) => completedMaterialsState.includes(m.id)).length;
                                            const isCurrentChapter = selectedChapter?.id === chapter.id;
                                            const isExpanded = expandedChapters.includes(chapter.id);

                                            return (
                                                <Collapsible
                                                    key={chapter.id}
                                                    open={isExpanded}
                                                    onOpenChange={(open) => {
                                                        setExpandedChapters((prev) =>
                                                            open ? [...prev, chapter.id] : prev.filter((id) => id !== chapter.id),
                                                        );
                                                    }}
                                                >
                                                    {/* Chapter Header */}
                                                    <CollapsibleTrigger asChild>
                                                        <Card
                                                            className={`mb-2 w-full cursor-pointer p-4 transition-all duration-200 ${
                                                                isCurrentChapter
                                                                    ? 'border-primary/30 bg-primary/10 shadow-md'
                                                                    : 'hover:bg-muted/50 hover:shadow-sm'
                                                            } `}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                                            isCurrentChapter
                                                                                ? 'bg-primary text-primary-foreground shadow-lg'
                                                                                : 'bg-muted text-muted-foreground'
                                                                        } `}
                                                                    >
                                                                        {chapter.order}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                                                                            {chapter.title}
                                                                            {isCurrentChapter && (
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    Sedang Dipelajari
                                                                                </Badge>
                                                                            )}
                                                                        </h4>
                                                                        <div className="mt-1 flex items-center gap-4">
                                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                                <Target className="h-3 w-3" />
                                                                                {chapterMaterials.length} materi
                                                                            </span>
                                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                                <CheckCircle2 className="h-3 w-3" />
                                                                                {completedInChapter} selesai
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {completedInChapter === chapterMaterials.length && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <Badge className="border-green-500/20 bg-green-500/10 text-green-600">
                                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                                    Selesai
                                                                                </Badge>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Bab ini sudah selesai</TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    <ChevronDown
                                                                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </CollapsibleTrigger>

                                                    {/* Materials List */}
                                                    <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down transition-all">
                                                        <div className="mt-2 ml-12 space-y-2">
                                                            {chapter.materials.map((material, materialIndex) => {
                                                                const isCompleted = completedMaterialsState.includes(material.id);
                                                                const isSelected = selectedMaterial?.id === material.id;

                                                                return (
                                                                    <Card
                                                                        key={material.id}
                                                                        className={`cursor-pointer p-3 transition-all duration-200 ${
                                                                            isSelected
                                                                                ? 'border-primary/30 bg-secondary shadow-sm'
                                                                                : 'border-transparent hover:bg-muted/50 hover:shadow-sm'
                                                                        } `}
                                                                        onClick={() => {
                                                                            setSelectedChapter(chapter);
                                                                            setSelectedMaterial(material);
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {/* Status Icon */}
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <div className="flex-shrink-0">
                                                                                        {isCompleted ? (
                                                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                                        ) : isSelected ? (
                                                                                            <PlayCircle className="h-5 w-5 animate-pulse text-primary" />
                                                                                        ) : (
                                                                                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                                                                        )}
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    {isCompleted
                                                                                        ? 'Selesai'
                                                                                        : isSelected
                                                                                          ? 'Sedang dipelajari'
                                                                                          : 'Belum dimulai'}
                                                                                </TooltipContent>
                                                                            </Tooltip>

                                                                            {/* Material Icon with Type */}
                                                                            <div
                                                                                className={`rounded-lg p-2 ${getMaterialTypeColor(material.type).replace('text-', 'bg-').replace('700', '100').replace('400', '900/20')}`}
                                                                            >
                                                                                {getMaterialIcon(material.type)}
                                                                            </div>

                                                                            {/* Material Info */}
                                                                            <div className="min-w-0 flex-1">
                                                                                <p
                                                                                    className={`text-sm font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''} `}
                                                                                >
                                                                                    {material.title}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {getMaterialTypeLabel(material.type)}
                                                                                </p>
                                                                            </div>

                                                                            {/* Action Icons */}
                                                                            <div className="flex items-center gap-1">
                                                                                {isSelected && (
                                                                                    <Badge variant="default" className="text-xs">
                                                                                        Aktif
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-auto">
                            <div className="container mx-auto px-4 py-6 lg:px-6">
                                <div className="space-y-6">
                                    {/* Main Content Card */}
                                    <Card>
                                        {selectedMaterial ? (
                                            <>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {getMaterialIcon(selectedMaterial.type)}
                                                            <CardTitle>{selectedMaterial.title}</CardTitle>
                                                        </div>
                                                        <Badge variant="outline">
                                                            Bab {selectedChapter.order}: {selectedChapter.title}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    {selectedMaterial.type === 'video_youtube' ? (
                                                        <div className="video-container relative aspect-video overflow-hidden rounded-lg bg-muted">
                                                            {selectedMaterial.secure_youtube_url ? (
                                                                <iframe
                                                                    className="secure-iframe h-full w-full"
                                                                    src={selectedMaterial.secure_youtube_url}
                                                                    title={selectedMaterial.title}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                    allowFullScreen
                                                                />
                                                            ) : selectedMaterial.youtube_url ? (
                                                                // Fallback to direct YouTube embed if secure URL is not available
                                                                <iframe
                                                                    className="h-full w-full"
                                                                    src={`https://www.youtube.com/embed/${extractYouTubeId(selectedMaterial.youtube_url)}?rel=0&showinfo=0&modestbranding=1`}
                                                                    title={selectedMaterial.title}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                    allowFullScreen
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <Youtube className="h-12 w-12 text-muted-foreground" />
                                                                    <p className="ml-2 text-muted-foreground">Video YouTube tidak tersedia</p>
                                                                </div>
                                                            )}
                                                            <VideoWatermark
                                                                userName={window.Laravel?.user?.name || 'User'}
                                                                courseName={course.title}
                                                            />
                                                        </div>
                                                    ) : selectedMaterial.type === 'video_local' ? (
                                                        <div className="video-container relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black">
                                                            {selectedMaterial.secure_video_url ? (
                                                                <SecureVideoPlayer
                                                                    src={selectedMaterial.secure_video_url}
                                                                    title={selectedMaterial.title}
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        alert('Konten ini dilindungi hak cipta');
                                                                        return false;
                                                                    }}
                                                                />
                                                            ) : selectedMaterial.file_url || selectedMaterial.file_path ? (
                                                                // Fallback to direct video if secure URL is not available
                                                                <video
                                                                    className="h-full w-full"
                                                                    controls
                                                                    controlsList="nodownload"
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        return false;
                                                                    }}
                                                                >
                                                                    <source
                                                                        src={selectedMaterial.file_url || selectedMaterial.file_path}
                                                                        type="video/mp4"
                                                                    />
                                                                    Browser Anda tidak mendukung pemutar video.
                                                                </video>
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <Video className="h-12 w-12 text-muted-foreground" />
                                                                    <p className="ml-2 text-muted-foreground">Video tidak tersedia</p>
                                                                </div>
                                                            )}
                                                            <VideoWatermark
                                                                userName={window.Laravel?.user?.name || 'User'}
                                                                courseName={course.title}
                                                            />
                                                        </div>
                                                    ) : selectedMaterial.type === 'pdf' ? (
                                                        <div className="min-h-[400px] rounded-lg bg-muted p-4">
                                                            <div className="mb-4 flex items-center gap-2">
                                                                <FileText className="h-5 w-5" />
                                                                <span>Dokumen PDF</span>
                                                            </div>
                                                            {selectedMaterial.file_url || selectedMaterial.file_path ? (
                                                                <iframe
                                                                    className="h-[70vh] w-full rounded"
                                                                    src={selectedMaterial.file_url || selectedMaterial.file_path}
                                                                />
                                                            ) : (
                                                                <p className="text-muted-foreground">Dokumen tidak tersedia.</p>
                                                            )}
                                                            {(selectedMaterial.file_url || selectedMaterial.file_path) && (
                                                                <Button className="mt-4" variant="outline" asChild>
                                                                    <a
                                                                        href={selectedMaterial.file_url || selectedMaterial.file_path}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download PDF
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-muted p-4">
                                                            {selectedMaterial.file_url || selectedMaterial.file_path ? (
                                                                <img
                                                                    src={selectedMaterial.file_url || selectedMaterial.file_path}
                                                                    alt={selectedMaterial.title}
                                                                    className="max-h-[70vh] rounded"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="text-center text-muted-foreground">
                                                                    <ImageIcon className="mx-auto mb-2 h-12 w-12" />
                                                                    Gambar tidak tersedia.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Navigation Buttons */}
                                                    <div className="mt-6 flex items-center justify-between">
                                                        <Button
                                                            variant="outline"
                                                            onClick={navigateToPreviousMaterial}
                                                            disabled={course.chapters[0].materials[0].id === selectedMaterial.id}
                                                        >
                                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                                            Sebelumnya
                                                        </Button>

                                                        {!completedMaterialsState.includes(selectedMaterial.id) && (
                                                            <Button variant="default" onClick={() => handleMaterialComplete(selectedMaterial.id)}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Tandai Selesai
                                                            </Button>
                                                        )}

                                                        <Button
                                                            variant="outline"
                                                            onClick={navigateToNextMaterial}
                                                            disabled={
                                                                course.chapters[course.chapters.length - 1].materials[
                                                                    course.chapters[course.chapters.length - 1].materials.length - 1
                                                                ].id === selectedMaterial.id
                                                            }
                                                        >
                                                            Selanjutnya
                                                            <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </>
                                        ) : (
                                            <CardContent className="py-12">
                                                <Alert className="border-dashed">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription className="text-center">
                                                        <div className="mt-4">
                                                            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                            <p className="mb-2 text-lg font-medium">Belum ada materi yang dipilih</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Pilih materi dari daftar di samping untuk mulai belajar
                                                            </p>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            </CardContent>
                                        )}
                                    </Card>

                                    {/* Chapter Description */}
                                    {selectedChapter && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Tentang Bab Ini</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground">{selectedChapter.description}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </UserDashboardLayout>
    );
}
