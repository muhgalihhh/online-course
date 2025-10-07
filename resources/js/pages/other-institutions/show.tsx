import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    logo_path?: string;
    logo_url?: string;
}

interface Props {
    institution: Institution;
}

export default function OtherInstitutionShow({ institution }: Props) {
    return (
        <GuestLayout>
            <Head title={`${institution.name} - Pusat Informasi`} />

            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/lembaga-lain"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Lembaga
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start gap-6">
                                    {institution.logo_url ? (
                                        <img
                                            src={institution.logo_url}
                                            alt={`Logo ${institution.name}`}
                                            className="h-24 w-24 rounded-xl bg-muted object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-muted">
                                            <span className="text-3xl font-bold text-muted-foreground">{institution.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="mb-2 text-2xl leading-tight">{institution.name}</CardTitle>
                                        <Badge variant="secondary">Lembaga Pendidikan</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-muted-foreground">
                                        Informasi detail tentang {institution.name} akan ditampilkan di sini. Saat ini sistem belum memiliki deskripsi
                                        lengkap untuk lembaga ini.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Kontak</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {institution.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Alamat</p>
                                            <p className="text-sm text-muted-foreground">{institution.address}</p>
                                        </div>
                                    </div>
                                )}

                                {institution.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Telepon</p>
                                            <a href={`tel:${institution.phone}`} className="text-sm text-primary hover:underline">
                                                {institution.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {institution.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <a href={`mailto:${institution.email}`} className="text-sm text-primary hover:underline">
                                                {institution.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {institution.website && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Website</p>
                                            <a
                                                href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                            >
                                                {institution.website}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {!institution.address && !institution.phone && !institution.email && !institution.website && (
                                    <p className="text-sm text-muted-foreground">Informasi kontak belum tersedia.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Aksi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {institution.website && (
                                    <Button className="w-full" asChild>
                                        <a
                                            href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Globe className="mr-2 h-4 w-4" />
                                            Kunjungi Website
                                        </a>
                                    </Button>
                                )}

                                {institution.phone && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`tel:${institution.phone}`}>
                                            <Phone className="mr-2 h-4 w-4" />
                                            Hubungi
                                        </a>
                                    </Button>
                                )}

                                {institution.email && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`mailto:${institution.email}`}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Kirim Email
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
