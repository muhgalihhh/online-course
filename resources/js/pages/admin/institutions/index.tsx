import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2, Mail, Phone, Globe, MapPin, Building2, Calendar, BookOpen } from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    created_at: string;
    courses_count: number;
}

interface InstitutionIndexProps extends PageProps {
    institution: Institution | null;
}

export default function InstitutionIndex({ institution }: InstitutionIndexProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Profil Institusi', href: route('admin.institutions.index') },
            ]}
        >
            <Head title="Profil Institusi" />

            <div className="">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Profil Institusi</h1>
                        <p className="text-muted-foreground">
                            Kelola informasi profil institusi untuk platform kursus online Anda
                        </p>
                    </div>
                    {!institution ? (
                        <Link href={route('admin.institutions.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Profil Institusi
                            </Button>
                        </Link>
                    ) : (
                        <Link href={route('admin.institutions.edit', institution.id)}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profil
                            </Button>
                        </Link>
                    )}
                </div>

                {!institution ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Belum Ada Profil Institusi</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Anda belum membuat profil institusi. Buat profil institusi untuk menampilkan informasi lembaga Anda.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Mulai dengan Membuat Profil Institusi</h3>
                                <p className="text-muted-foreground mb-4">
                                    Tambahkan informasi lengkap tentang institusi Anda untuk memberikan kepercayaan kepada peserta kursus.
                                </p>
                                <Link href={route('admin.institutions.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Profil Institusi
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Profile Card */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center">
                                            <Building2 className="h-5 w-5 mr-2" />
                                            {institution.name}
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            {institution.courses_count} Kursus
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {institution.description && (
                                        <div>
                                            <h4 className="font-medium mb-2">Deskripsi</h4>
                                            <p className="text-muted-foreground">{institution.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {institution.email && (
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Email</p>
                                                    <p className="text-sm text-muted-foreground">{institution.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        {institution.phone && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Telepon</p>
                                                    <p className="text-sm text-muted-foreground">{institution.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {institution.website && (
                                            <div className="flex items-center space-x-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Website</p>
                                                    <a 
                                                        href={institution.website} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {institution.website}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {institution.address && (
                                            <div className="flex items-start space-x-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium">Alamat</p>
                                                    <p className="text-sm text-muted-foreground">{institution.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 pt-4 border-t">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Dibuat pada {new Date(institution.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistik</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium">Total Kursus</span>
                                        </div>
                                        <Badge variant="default">{institution.courses_count}</Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Building2 className="h-5 w-5 text-green-600" />
                                            <span className="font-medium">Status</span>
                                        </div>
                                        <Badge variant="default">Aktif</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Aksi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={route('admin.institutions.edit', institution.id)} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profil
                                        </Button>
                                    </Link>
                                    
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus Profil
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}