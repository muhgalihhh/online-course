import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2, Mail, Phone, Globe } from 'lucide-react';
import { Pagination } from '@/components/pagination';

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
    institutions: PaginatedData<Institution>;
}

export default function InstitutionIndex({ institutions }: InstitutionIndexProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Institutions', href: route('admin.institutions.index') },
            ]}
        >
            <Head title="Manage Institutions" />

            <div className="">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Daftar Institusi</h1>
                    <Link href={route('admin.institutions.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Institusi
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Institusi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kontak</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead>Jumlah Kursus</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {institutions.data.map((institution) => (
                                    <TableRow key={institution.id}>
                                        <TableCell className="font-medium">{institution.name}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {institution.email && (
                                                    <div className="flex items-center text-sm">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {institution.email}
                                                    </div>
                                                )}
                                                {institution.phone && (
                                                    <div className="flex items-center text-sm">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {institution.phone}
                                                    </div>
                                                )}
                                                {institution.website && (
                                                    <div className="flex items-center text-sm">
                                                        <Globe className="h-3 w-3 mr-1" />
                                                        {institution.website}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{institution.address || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{institution.courses_count}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(institution.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.institutions.edit', institution.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {institutions.links && institutions.links.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={institutions.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}