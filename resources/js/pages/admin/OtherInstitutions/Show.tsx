import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Globe, Mail, MapPin, Phone } from 'lucide-react';

interface OtherInstitution {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    logo_path: string;
    logo_url: string;
    created_at: string;
    updated_at: string;
}

interface OtherInstitutionShowProps extends PageProps {
    otherInstitution: OtherInstitution;
}

export default function OtherInstitutionShow({ otherInstitution }: OtherInstitutionShowProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Pusat Informasi', href: route('admin.other-institutions.index') },
                { title: otherInstitution.name, href: route('admin.other-institutions.show', otherInstitution.id) },
            ]}
        >
            <Head title={`Lembaga: ${otherInstitution.name}`} />

            <div className="space-y-6">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href={route('admin.other-institutions.index')}>
                            <Button variant="outline" size="sm" className="mr-2">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Detail Lembaga</h1>
                    </div>
                    <Link href={route('admin.other-institutions.edit', otherInstitution.id)}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                        {otherInstitution.logo_url && (
                            <img src={otherInstitution.logo_url} alt={otherInstitution.name} className="mr-4 h-16 w-16 rounded object-cover" />
                        )}
                        <div>
                            <CardTitle className="text-xl">{otherInstitution.name}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">Informasi lembaga mitra</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informasi Kontak</h3>

                                {otherInstitution.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <a href={`mailto:${otherInstitution.email}`} className="text-blue-600 hover:text-blue-800">
                                                {otherInstitution.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {otherInstitution.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Telepon</p>
                                            <a href={`tel:${otherInstitution.phone}`} className="text-blue-600 hover:text-blue-800">
                                                {otherInstitution.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {otherInstitution.website && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Website</p>
                                            <a
                                                href={otherInstitution.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {otherInstitution.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informasi Lainnya</h3>

                                {otherInstitution.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Alamat</p>
                                            <p className="text-sm">{otherInstitution.address}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div>
                                        <span className="font-medium">Dibuat pada:</span>{' '}
                                        {new Date(otherInstitution.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div>
                                        <span className="font-medium">Terakhir diperbarui:</span>{' '}
                                        {new Date(otherInstitution.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
