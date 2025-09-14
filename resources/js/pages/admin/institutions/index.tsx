import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Building2, Calendar, Edit, Globe, Link as LinkIcon, Mail, MapPin, Phone, Plus, Smartphone, Trash2 } from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    photo_path?: string | null;
    tiktok_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
    ios_app_url?: string | null;
    android_app_url?: string | null;
    created_at: string;
    courses_count: number;
}

interface InstitutionIndexProps extends PageProps {
    institution: Institution | null;
}

export default function InstitutionIndex({ institution }: InstitutionIndexProps) {
    const resolvePhotoUrl = (path?: string | null) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('/storage/')) return path;
        return `/storage/${path.replace(/^\/+/, '')}`;
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Profil Institusi', href: route('admin.institutions.index') },
            ]}
        >
            <Head title="Profil Institusi" />

            <div className="">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Profil Institusi</h1>
                        <p className="text-muted-foreground">Kelola informasi profil institusi untuk platform kursus online Anda</p>
                    </div>
                    {!institution ? (
                        <Link href={route('admin.institutions.edit')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Buat/Atur Profil Institusi
                            </Button>
                        </Link>
                    ) : (
                        <Link href={route('admin.institutions.edit')}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
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
                            <div className="py-8 text-center">
                                <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">Mulai dengan Membuat Profil Institusi</h3>
                                <p className="mb-4 text-muted-foreground">
                                    Tambahkan informasi lengkap tentang institusi Anda untuk memberikan kepercayaan kepada peserta kursus.
                                </p>
                                <Link href={route('admin.institutions.edit')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Buat/Atur Profil Institusi
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Profile Card */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center">
                                            {institution.photo_path ? (
                                                <img
                                                    src={resolvePhotoUrl(institution.photo_path)}
                                                    alt={institution.name}
                                                    className="mr-2 h-8 w-8 rounded border object-cover"
                                                />
                                            ) : (
                                                <Building2 className="mr-2 h-5 w-5" />
                                            )}
                                            {institution.name}
                                        </CardTitle>
                                        <Badge variant="secondary">{institution.courses_count} Kursus</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {institution.photo_path && (
                                        <div>
                                            <h4 className="mb-2 font-medium">Logo/Foto</h4>
                                            <img
                                                src={resolvePhotoUrl(institution.photo_path)}
                                                alt={`Foto ${institution.name}`}
                                                className="h-24 w-24 rounded-lg border object-cover"
                                            />
                                        </div>
                                    )}
                                    {institution.description && (
                                        <div>
                                            <h4 className="mb-2 font-medium">Deskripsi</h4>
                                            <p className="text-muted-foreground">{institution.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Alamat</p>
                                                    <p className="text-sm text-muted-foreground">{institution.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Social Media */}
                                    {(institution.tiktok_url || institution.instagram_url || institution.facebook_url || institution.twitter_url) && (
                                        <div className="border-t pt-4">
                                            <h4 className="mb-3 font-medium">Sosial Media</h4>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {institution.tiktok_url && (
                                                    <div className="flex items-center space-x-2">
                                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                        <a
                                                            href={institution.tiktok_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            TikTok
                                                        </a>
                                                    </div>
                                                )}
                                                {institution.instagram_url && (
                                                    <div className="flex items-center space-x-2">
                                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                        <a
                                                            href={institution.instagram_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            Instagram
                                                        </a>
                                                    </div>
                                                )}
                                                {institution.facebook_url && (
                                                    <div className="flex items-center space-x-2">
                                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                        <a
                                                            href={institution.facebook_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            Facebook
                                                        </a>
                                                    </div>
                                                )}
                                                {institution.twitter_url && (
                                                    <div className="flex items-center space-x-2">
                                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                        <a
                                                            href={institution.twitter_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            Twitter/X
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* App Links */}
                                    {(institution.ios_app_url || institution.android_app_url) && (
                                        <div className="border-t pt-4">
                                            <h4 className="mb-3 font-medium">Aplikasi Mobile</h4>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {institution.ios_app_url && (
                                                    <div className="flex items-center space-x-2">
                                                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                        <a
                                                            href={institution.ios_app_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            App Store (iOS)
                                                        </a>
                                                    </div>
                                                )}
                                                {institution.android_app_url && (
                                                    <div className="flex items-center space-x-2">
                                                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                        <a
                                                            href={institution.android_app_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            Google Play (Android)
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2 border-t pt-4">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Dibuat pada{' '}
                                            {new Date(institution.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
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
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium">Total Kursus</span>
                                        </div>
                                        <Badge variant="default">{institution.courses_count}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
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
                                    <Link href={route('admin.institutions.edit')} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Profil
                                        </Button>
                                    </Link>

                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
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
