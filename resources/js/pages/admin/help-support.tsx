import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Layers,
    Info,
    Upload
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Help & Support',
        href: route('admin.help-support'),
    },
];

interface HelpSupportProps extends PageProps {}

export default function HelpSupport({}: HelpSupportProps) {
    const dataFlowSteps = [
        {
            step: 1,
            title: 'Buat Kursus Baru',
            icon: GraduationCap,
            description: 'Langkah awal membuat course/mata pelajaran',
            details: [
                'Masuk ke menu "Courses" di sidebar',
                'Klik tombol "Add Course" atau "Tambah Kursus"',
                'Isi informasi dasar kursus: Judul, Deskripsi, Harga',
                'Pilih kategori kursus dari dropdown',
                'Pilih instruktur yang akan mengajar',
                'Upload gambar thumbnail kursus',
                'Set status awal sebagai "Draft"',
                'Klik "Save" untuk menyimpan kursus'
            ]
        },
        {
            step: 2,
            title: 'Tambahkan Chapter',
            icon: Layers,
            description: 'Buat struktur bab/chapter dalam kursus',
            details: [
                'Buka detail kursus yang sudah dibuat',
                'Pilih tab "Chapters" atau "Bab"',
                'Klik tombol "Add Chapter" atau "Tambah Bab"',
                'Isi judul chapter (contoh: "Bab 1: Pengenalan")',
                'Tambahkan deskripsi singkat chapter',
                'Atur nomor urutan chapter (1, 2, 3, dst)',
                'Klik "Save Chapter" untuk menyimpan',
                'Ulangi untuk menambah chapter lainnya'
            ]
        },
        {
            step: 3,
            title: 'Upload Materi Pembelajaran',
            icon: Upload,
            description: 'Tambahkan konten pembelajaran ke setiap chapter',
            details: [
                'Masuk ke detail chapter yang sudah dibuat',
                'Pilih tab "Materials" atau "Materi"',
                'Klik tombol "Add Material" atau "Tambah Materi"',
                'Pilih tipe materi: Video, Dokumen (PDF/PPT), atau Quiz',
                'Untuk Video: Upload file MP4 atau embed link YouTube/Vimeo',
                'Untuk Dokumen: Upload file PDF, PPT, atau DOCX',
                'Untuk Quiz: Buat pertanyaan dan pilihan jawaban',
                'Isi judul materi dan deskripsi',
                'Set durasi estimasi belajar (dalam menit)',
                'Atur urutan materi dalam chapter',
                'Tentukan apakah materi gratis atau berbayar',
                'Klik "Save Material" untuk menyimpan',
                'Ulangi untuk semua materi dalam chapter'
            ]
        }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & Support" />

            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                        <p className="text-muted-foreground mt-2">
                            Panduan alur input data course
                        </p>
                    </div>
                </div>

                {/* Main Content - Data Flow Only */}
                <Card>
                    <CardHeader>
                        <CardTitle>Alur Input Data Course</CardTitle>
                        <CardDescription>
                            Ikuti 3 langkah sederhana untuk membuat course lengkap dengan materi pembelajaran
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Visual Flow Diagram */}
                        <div className="mb-8 p-6 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-center flex-wrap gap-4">
                                <Badge variant="outline" className="text-sm py-1 px-3">1. Buat Kursus</Badge>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <Badge variant="outline" className="text-sm py-1 px-3">2. Tambah Chapter</Badge>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <Badge variant="outline" className="text-sm py-1 px-3">3. Upload Materi</Badge>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <Badge variant="default" className="text-sm py-1 px-3 bg-green-500">✓ Selesai</Badge>
                            </div>
                        </div>

                        {/* Detailed Steps */}
                        <div className="space-y-6">
                            {dataFlowSteps.map((flowStep, index) => {
                                const Icon = flowStep.icon;
                                return (
                                    <Card key={index} className="overflow-hidden border-l-4 border-l-primary">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                                                        {flowStep.step}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Icon className="h-6 w-6 text-primary" />
                                                        <CardTitle className="text-xl">{flowStep.title}</CardTitle>
                                                    </div>
                                                    <CardDescription className="text-base">{flowStep.description}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="pl-16">
                                                <ul className="space-y-2">
                                                    {flowStep.details.map((detail, detailIndex) => (
                                                        <li key={detailIndex} className="flex items-start gap-3">
                                                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm">{detail}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Important Notes */}
                        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips Penting:</h4>
                                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                        <li>• Pastikan judul kursus jelas dan deskriptif</li>
                                        <li>• Setiap kursus minimal harus memiliki 1 chapter</li>
                                        <li>• Setiap chapter minimal harus memiliki 1 materi pembelajaran</li>
                                        <li>• Upload thumbnail berkualitas tinggi untuk kursus (rekomendasi: 1280x720px)</li>
                                        <li>• Video materi sebaiknya dalam format MP4 dengan kualitas HD</li>
                                        <li>• Dokumen pendukung bisa berupa PDF, PPT, atau DOCX</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}