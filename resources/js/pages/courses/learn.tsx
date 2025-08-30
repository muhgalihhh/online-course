import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import UserDashboardLayout from '@/layouts/user-dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
    BookOpen, 
    Clock, 
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    FileText,
    Video,
    Download,
    CheckCircle2,
    Lock,
    Users,
    Star,
    Image as ImageIcon,
    Youtube,
    List
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Material {
    id: number;
    title: string;
    type: 'pdf' | 'image' | 'video_local' | 'video_youtube';
    file_path?: string | null;
    file_url?: string | null;
    youtube_url?: string | null;
    order: number;
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

export default function Learn({ course, completedMaterials, enrollment }: LearnProps) {
    const [selectedChapter, setSelectedChapter] = useState<Chapter>(course.chapters[0]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
        selectedChapter?.materials?.[0] || null
    );
    const [completedMaterialsState, setCompletedMaterialsState] = useState<number[]>(completedMaterials);
    const [enrollmentState, setEnrollmentState] = useState(enrollment);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                    }
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
        const currentChapterIndex = course.chapters.findIndex(ch => ch.id === selectedChapter.id);
        const currentMaterialIndex = selectedChapter.materials.findIndex(m => m.id === selectedMaterial?.id);
        
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
        const currentChapterIndex = course.chapters.findIndex(ch => ch.id === selectedChapter.id);
        const currentMaterialIndex = selectedChapter.materials.findIndex(m => m.id === selectedMaterial?.id);
        
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
    const progressPercentage = totalMaterials > 0 
        ? Math.round((completedMaterialsState.length / totalMaterials) * 100)
        : 0;

    return (
        <UserDashboardLayout>
            <Head title={`Belajar - ${course.title}`} />
            
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Header */}
                <div className="border-b bg-background/95 backdrop-blur">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
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
                                        <SheetContent side="left" className="w-[90vw] sm:w-96 p-0">
                                            <SheetHeader className="px-6 py-4 border-b">
                                                <SheetTitle>Daftar Materi</SheetTitle>
                                                <div className="mt-2">
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {completedMaterialsState.length} dari {totalMaterials} materi selesai
                                                    </p>
                                                    <Progress value={progressPercentage} />
                                                </div>
                                            </SheetHeader>
                                            <ScrollArea className="h-[calc(100vh-120px)]">
                                                <div className="px-6 py-4">
                                                    {course.chapters.map((chapter, chapterIndex) => {
                                                        const chapterMaterials = chapter.materials;
                                                        const completedInChapter = chapterMaterials.filter(m => 
                                                            completedMaterialsState.includes(m.id)
                                                        ).length;
                                                        const isCurrentChapter = selectedChapter?.id === chapter.id;
                                                        
                                                        return (
                                                            <div key={chapter.id} className="mb-4">
                                                                {/* Chapter Header */}
                                                                <div 
                                                                    className={`
                                                                        flex items-center justify-between p-3 rounded-lg cursor-pointer
                                                                        transition-colors mb-2
                                                                        ${isCurrentChapter 
                                                                            ? 'bg-primary/10 border border-primary/20' 
                                                                            : 'hover:bg-muted/50'
                                                                        }
                                                                    `}
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
                                                                            <div className={`
                                                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                                                ${isCurrentChapter 
                                                                                    ? 'bg-primary text-primary-foreground' 
                                                                                    : 'bg-muted-foreground/20 text-muted-foreground'
                                                                                }
                                                                            `}>
                                                                                {chapter.order}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h4 className="font-semibold text-sm">{chapter.title}</h4>
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
                                                                                className={`
                                                                                    flex items-center gap-2 p-2 rounded-md cursor-pointer
                                                                                    transition-all duration-200
                                                                                    ${isSelected 
                                                                                        ? 'bg-secondary shadow-sm border border-secondary-foreground/10' 
                                                                                        : 'hover:bg-muted/50'
                                                                                    }
                                                                                `}
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
                                                                                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                {/* Material Icon */}
                                                                                <div className="flex-shrink-0">
                                                                                    {getMaterialIcon(material.type)}
                                                                                </div>
                                                                                
                                                                                {/* Material Info */}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className={`
                                                                                        text-sm truncate
                                                                                        ${isSelected ? 'font-medium' : ''}
                                                                                        ${isCompleted ? 'text-muted-foreground line-through' : ''}
                                                                                    `}>
                                                                                        {material.title}
                                                                                    </p>
                                                                                </div>
                                                                                
                                                                                {/* Material Type Badge */}
                                                                                <Badge 
                                                                                    variant="secondary" 
                                                                                    className={`text-xs px-2 py-0 ${getMaterialTypeColor(material.type)}`}
                                                                                >
                                                                                    {getMaterialTypeLabel(material.type)}
                                                                                </Badge>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                
                                                                {chapterIndex < course.chapters.length - 1 && (
                                                                    <Separator className="mt-4" />
                                                                )}
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
                <div className="container mx-auto px-4 py-6">
                    <div className="grid gap-6 lg:grid-cols-[350px,1fr] xl:grid-cols-[380px,1fr]">
                        {/* Sidebar - Desktop Only */}
                        <div className="hidden lg:block space-y-6">
                            {/* Course Content - Enhanced Sidebar */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Daftar Materi</CardTitle>
                                    <CardDescription>
                                        {completedMaterialsState.length} dari {totalMaterials} materi selesai
                                    </CardDescription>
                                    <Progress value={progressPercentage} className="mt-2" />
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[calc(100vh-250px)]">
                                        <div className="px-6 pb-4">
                                            {course.chapters.map((chapter, chapterIndex) => {
                                                const chapterMaterials = chapter.materials;
                                                const completedInChapter = chapterMaterials.filter(m => 
                                                    completedMaterialsState.includes(m.id)
                                                ).length;
                                                const isCurrentChapter = selectedChapter?.id === chapter.id;
                                                
                                                return (
                                                    <div key={chapter.id} className="mb-4">
                                                        {/* Chapter Header */}
                                                        <div 
                                                            className={`
                                                                flex items-center justify-between p-3 rounded-lg cursor-pointer
                                                                transition-colors mb-2
                                                                ${isCurrentChapter 
                                                                    ? 'bg-primary/10 border border-primary/20' 
                                                                    : 'hover:bg-muted/50'
                                                                }
                                                            `}
                                                            onClick={() => {
                                                                setSelectedChapter(chapter);
                                                                setSelectedMaterial(chapter.materials[0]);
                                                            }}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`
                                                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                                        ${isCurrentChapter 
                                                                            ? 'bg-primary text-primary-foreground' 
                                                                            : 'bg-muted-foreground/20 text-muted-foreground'
                                                                        }
                                                                    `}>
                                                                        {chapter.order}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-sm">{chapter.title}</h4>
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
                                                        
                                                        {/* Materials List */}
                                                        {isCurrentChapter && (
                                                            <div className="ml-10 space-y-1">
                                                                {chapter.materials.map((material, materialIndex) => {
                                                                    const isCompleted = completedMaterialsState.includes(material.id);
                                                                    const isSelected = selectedMaterial?.id === material.id;
                                                                    
                                                                    return (
                                                                        <div
                                                                            key={material.id}
                                                                            className={`
                                                                                flex items-center gap-3 p-2 rounded-md cursor-pointer
                                                                                transition-all duration-200
                                                                                ${isSelected 
                                                                                    ? 'bg-secondary shadow-sm border border-secondary-foreground/10' 
                                                                                    : 'hover:bg-muted/50'
                                                                                }
                                                                            `}
                                                                            onClick={() => {
                                                                                setSelectedMaterial(material);
                                                                            }}
                                                                        >
                                                                            {/* Status Icon */}
                                                                            <div className="flex-shrink-0">
                                                                                {isCompleted ? (
                                                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                                ) : isSelected ? (
                                                                                    <PlayCircle className="h-4 w-4 text-primary" />
                                                                                ) : (
                                                                                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Material Icon */}
                                                                            <div className="flex-shrink-0">
                                                                                {getMaterialIcon(material.type)}
                                                                            </div>
                                                                            
                                                                            {/* Material Info */}
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={`
                                                                                    text-sm truncate
                                                                                    ${isSelected ? 'font-medium' : ''}
                                                                                    ${isCompleted ? 'text-muted-foreground line-through' : ''}
                                                                                `}>
                                                                                    {material.title}
                                                                                </p>
                                                                            </div>
                                                                            
                                                                            {/* Material Type Badge */}
                                                                            <Badge 
                                                                                variant="secondary" 
                                                                                className={`text-xs px-2 py-0 ${getMaterialTypeColor(material.type)}`}
                                                                            >
                                                                                {getMaterialTypeLabel(material.type)}
                                                                            </Badge>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        
                                                        {chapterIndex < course.chapters.length - 1 && (
                                                            <Separator className="mt-4" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Video/Content Area */}
                        <div className="space-y-6 lg:order-none order-first">
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
                                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                                    {selectedMaterial.youtube_url ? (
                                                        <iframe
                                                            className="w-full h-full"
                                                            src={selectedMaterial.youtube_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                                            title={selectedMaterial.title}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Youtube className="h-12 w-12 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : selectedMaterial.type === 'video_local' ? (
                                                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                                    {(selectedMaterial.file_url || selectedMaterial.file_path) ? (
                                                        <video 
                                                            className="w-full h-full" 
                                                            src={selectedMaterial.file_url || selectedMaterial.file_path} 
                                                            controls 
                                                            controlsList="nodownload"
                                                            preload="metadata"
                                                        >
                                                            <source src={selectedMaterial.file_url || selectedMaterial.file_path} type="video/mp4" />
                                                            <source src={selectedMaterial.file_url || selectedMaterial.file_path} type="video/webm" />
                                                            <source src={selectedMaterial.file_url || selectedMaterial.file_path} type="video/ogg" />
                                                            <source src={selectedMaterial.file_url || selectedMaterial.file_path} type="video/quicktime" />
                                                            Browser Anda tidak mendukung tag video.
                                                        </video>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Video className="h-12 w-12 text-muted-foreground" />
                                                            <p className="text-muted-foreground mt-2">Video tidak tersedia</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : selectedMaterial.type === 'pdf' ? (
                                                <div className="min-h-[400px] bg-muted rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <FileText className="h-5 w-5" />
                                                        <span>Dokumen PDF</span>
                                                    </div>
                                                    {(selectedMaterial.file_url || selectedMaterial.file_path) ? (
                                                        <iframe className="w-full h-[70vh] rounded" src={selectedMaterial.file_url || selectedMaterial.file_path} />
                                                    ) : (
                                                        <p className="text-muted-foreground">Dokumen tidak tersedia.</p>
                                                    )}
                                                    {(selectedMaterial.file_url || selectedMaterial.file_path) && (
                                                        <Button className="mt-4" variant="outline" asChild>
                                                            <a href={selectedMaterial.file_url || selectedMaterial.file_path} target="_blank" rel="noopener noreferrer">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download PDF
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="min-h-[300px] bg-muted rounded-lg p-4 flex items-center justify-center">
                                                    {(selectedMaterial.file_url || selectedMaterial.file_path) ? (
                                                        <img 
                                                            src={selectedMaterial.file_url || selectedMaterial.file_path} 
                                                            alt={selectedMaterial.title} 
                                                            className="max-h-[70vh] rounded" 
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="text-center text-muted-foreground">
                                                            <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                                                            Gambar tidak tersedia.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Navigation Buttons */}
                                            <div className="flex items-center justify-between mt-6">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={navigateToPreviousMaterial}
                                                    disabled={course.chapters[0].materials[0].id === selectedMaterial.id}
                                                >
                                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                                    Sebelumnya
                                                </Button>
                                                
                                                {!completedMaterialsState.includes(selectedMaterial.id) && (
                                                    <Button 
                                                        variant="default"
                                                        onClick={() => handleMaterialComplete(selectedMaterial.id)}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Tandai Selesai
                                                    </Button>
                                                )}
                                                
                                                <Button 
                                                    variant="outline" 
                                                    onClick={navigateToNextMaterial}
                                                    disabled={
                                                        course.chapters[course.chapters.length - 1]
                                                            .materials[course.chapters[course.chapters.length - 1].materials.length - 1]
                                                            .id === selectedMaterial.id
                                                    }
                                                >
                                                    Selanjutnya
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </>
                                ) : (
                                    <CardContent className="py-12 text-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Pilih materi untuk mulai belajar</p>
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
        </UserDashboardLayout>
    );
}