import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { 
    ArrowRight,
    Book,
    CheckCircle2,
    Clock, 
    Database,
    FileText, 
    GraduationCap,
    Layers,
    Mail, 
    MessageSquare, 
    Phone, 
    PlayCircle, 
    Send, 
    Settings,
    UserPlus,
    Users,
    Building2,
    AlertCircle,
    CheckCircle,
    Info,
    FileCheck,
    FolderOpen,
    Upload,
    ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface ContactInfo {
    email: string;
    phone: string;
    hours: string;
    response_time: string;
}

interface HelpSupportProps extends PageProps {
    contactInfo: ContactInfo;
}

export default function HelpSupport({ contactInfo }: HelpSupportProps) {
    const [activeTab, setActiveTab] = useState('data-flow');

    const ticketForm = useForm({
        subject: '',
        category: '',
        priority: '',
        message: '',
    });

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ticketForm.post(route('admin.help-support.ticket'), {
            onSuccess: () => {
                toast.success('Support ticket submitted successfully!');
                ticketForm.reset();
            },
            onError: () => {
                toast.error('Failed to submit ticket. Please try again.');
            },
        });
    };

    const dataFlowSteps = [
        {
            step: 1,
            title: 'Setup Institusi',
            icon: Building2,
            description: 'Tambahkan data institusi/lembaga pendidikan',
            details: [
                'Masuk ke menu Institutions',
                'Klik tombol "Add Institution"',
                'Isi informasi institusi (nama, alamat, kontak)',
                'Simpan data institusi'
            ]
        },
        {
            step: 2,
            title: 'Tambah User',
            icon: UserPlus,
            description: 'Daftarkan pengguna (admin, instruktur, siswa)',
            details: [
                'Masuk ke menu Users',
                'Klik tombol "Add User"',
                'Pilih role pengguna (Admin/Instructor/Student)',
                'Isi data pengguna dan assign ke institusi',
                'Simpan data pengguna'
            ]
        },
        {
            step: 3,
            title: 'Buat Kategori',
            icon: FolderOpen,
            description: 'Buat kategori untuk mengelompokkan kursus',
            details: [
                'Masuk ke menu Categories',
                'Klik tombol "Add Category"',
                'Isi nama dan deskripsi kategori',
                'Upload icon kategori (opsional)',
                'Simpan kategori'
            ]
        },
        {
            step: 4,
            title: 'Buat Kursus',
            icon: GraduationCap,
            description: 'Tambahkan kursus/mata pelajaran baru',
            details: [
                'Masuk ke menu Courses',
                'Klik tombol "Add Course"',
                'Isi informasi kursus (judul, deskripsi, harga)',
                'Pilih kategori dan instruktur',
                'Upload thumbnail kursus',
                'Set status kursus (draft/published)',
                'Simpan kursus'
            ]
        },
        {
            step: 5,
            title: 'Tambah Chapter',
            icon: Layers,
            description: 'Buat chapter/bab dalam kursus',
            details: [
                'Masuk ke detail kursus',
                'Klik tab "Chapters"',
                'Klik tombol "Add Chapter"',
                'Isi judul dan deskripsi chapter',
                'Atur urutan chapter',
                'Simpan chapter'
            ]
        },
        {
            step: 6,
            title: 'Upload Materi',
            icon: Upload,
            description: 'Tambahkan materi pembelajaran ke chapter',
            details: [
                'Masuk ke detail chapter',
                'Klik tab "Materials"',
                'Klik tombol "Add Material"',
                'Pilih tipe materi (Video/Document/Quiz)',
                'Upload file atau embed video',
                'Atur urutan materi',
                'Set durasi dan prerequisite',
                'Simpan materi'
            ]
        },
        {
            step: 7,
            title: 'Verifikasi & Publish',
            icon: FileCheck,
            description: 'Review dan publikasikan kursus',
            details: [
                'Review semua konten kursus',
                'Cek kelengkapan materi',
                'Verifikasi harga dan settings',
                'Ubah status ke "Published"',
                'Kursus siap diakses siswa'
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
                            Panduan alur input data dan bantuan sistem
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('data-flow')}>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <Database className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Alur Input Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Panduan langkah demi langkah input data</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('ticket')}>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Kirim Tiket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Dapatkan bantuan dari tim support</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('contact')}>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Info Kontak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Informasi kontak langsung</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="data-flow">Alur Input Data</TabsTrigger>
                        <TabsTrigger value="ticket">Kirim Tiket</TabsTrigger>
                        <TabsTrigger value="contact">Kontak</TabsTrigger>
                    </TabsList>

                    {/* Data Flow Tab */}
                    <TabsContent value="data-flow" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alur Input Data Sistem</CardTitle>
                                <CardDescription>
                                    Ikuti langkah-langkah berikut untuk menginput data dengan benar
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Visual Flow Diagram */}
                                <div className="mb-8 p-6 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs">Institusi</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline" className="text-xs">Users</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline" className="text-xs">Kategori</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline" className="text-xs">Kursus</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline" className="text-xs">Chapter</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline" className="text-xs">Materi</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="success" className="text-xs">Publish</Badge>
                                    </div>
                                </div>

                                {/* Detailed Steps */}
                                <div className="space-y-4">
                                    {dataFlowSteps.map((flowStep, index) => {
                                        const Icon = flowStep.icon;
                                        return (
                                            <Card key={index} className="overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <span className="text-sm font-bold text-primary">{flowStep.step}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Icon className="h-5 w-5 text-primary" />
                                                                <CardTitle className="text-lg">{flowStep.title}</CardTitle>
                                                            </div>
                                                            <CardDescription>{flowStep.description}</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="pl-14">
                                                        <ul className="space-y-2">
                                                            {flowStep.details.map((detail, detailIndex) => (
                                                                <li key={detailIndex} className="flex items-start gap-2">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm text-muted-foreground">{detail}</span>
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
                                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Catatan Penting:</h4>
                                            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                                <li>• Pastikan data institusi sudah lengkap sebelum menambah user</li>
                                                <li>• Setiap user harus terhubung dengan institusi yang valid</li>
                                                <li>• Kursus harus memiliki minimal 1 chapter untuk bisa dipublish</li>
                                                <li>• Setiap chapter harus memiliki minimal 1 materi</li>
                                                <li>• Review semua data sebelum mengubah status ke published</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Submit Ticket Tab */}
                    <TabsContent value="ticket" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Kirim Tiket Support</CardTitle>
                                <CardDescription>
                                    Jelaskan masalah Anda dan tim kami akan merespon dalam {contactInfo?.response_time || '24 jam'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleTicketSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Kategori</Label>
                                            <Select
                                                value={ticketForm.data.category}
                                                onValueChange={(value) => ticketForm.setData('category', value)}
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="technical">Masalah Teknis</SelectItem>
                                                    <SelectItem value="data_input">Masalah Input Data</SelectItem>
                                                    <SelectItem value="general">Pertanyaan Umum</SelectItem>
                                                    <SelectItem value="feature_request">Permintaan Fitur</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {ticketForm.errors.category && (
                                                <p className="text-sm text-destructive">{ticketForm.errors.category}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Prioritas</Label>
                                            <Select
                                                value={ticketForm.data.priority}
                                                onValueChange={(value) => ticketForm.setData('priority', value)}
                                            >
                                                <SelectTrigger id="priority">
                                                    <SelectValue placeholder="Pilih prioritas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="h-5">Rendah</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="medium">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="default" className="h-5">Sedang</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="high">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="warning" className="h-5">Tinggi</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="urgent">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="destructive" className="h-5">Mendesak</Badge>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {ticketForm.errors.priority && (
                                                <p className="text-sm text-destructive">{ticketForm.errors.priority}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subjek</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Deskripsi singkat masalah Anda"
                                            value={ticketForm.data.subject}
                                            onChange={(e) => ticketForm.setData('subject', e.target.value)}
                                        />
                                        {ticketForm.errors.subject && (
                                            <p className="text-sm text-destructive">{ticketForm.errors.subject}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Pesan</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Berikan informasi detail tentang masalah Anda..."
                                            rows={6}
                                            value={ticketForm.data.message}
                                            onChange={(e) => ticketForm.setData('message', e.target.value)}
                                        />
                                        {ticketForm.errors.message && (
                                            <p className="text-sm text-destructive">{ticketForm.errors.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Waktu respon yang diharapkan: {contactInfo?.response_time || '24 jam'}
                                        </p>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={ticketForm.processing}
                                        className="w-full md:w-auto"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {ticketForm.processing ? 'Mengirim...' : 'Kirim Tiket'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        Get in touch with our support team directly
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Email Support</p>
                                            <a 
                                                href={`mailto:${contactInfo.email}`} 
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Phone Support</p>
                                            <a 
                                                href={`tel:${contactInfo.phone}`} 
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {contactInfo.phone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Business Hours</p>
                                            <p className="text-sm text-muted-foreground">{contactInfo.hours}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Support Guidelines</CardTitle>
                                    <CardDescription>
                                        Tips for getting help quickly
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Check FAQs first for instant answers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Include specific error messages or screenshots</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Provide steps to reproduce the issue</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Mention affected users or courses if applicable</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">For urgent issues, use high priority and call support</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}