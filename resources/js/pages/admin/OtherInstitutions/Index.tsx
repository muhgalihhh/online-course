import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Globe, Mail, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
}

interface OtherInstitutionIndexProps extends PageProps {
    otherInstitutions: PaginatedData<OtherInstitution>;
    filters: {
        search: string;
        date_from: string;
        date_to: string;
        sort_by: string;
        sort_order: string;
    };
}

export default function OtherInstitutionIndex({ otherInstitutions, filters }: OtherInstitutionIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        institutionId: number | null;
        institutionName: string;
    }>({
        isOpen: false,
        institutionId: null,
        institutionName: '',
    });

    const filterConfig: FilterConfig = {
        search: {
            placeholder: 'Search by name, email, or address...',
        },
        dateRange: {
            enabled: true,
            label: 'Creation Date',
        },
        sort: {
            enabled: true,
            options: [
                { value: 'created_at', label: 'Creation Date' },
                { value: 'name', label: 'Name' },
                { value: 'email', label: 'Email' },
            ],
            defaultSort: 'created_at',
            defaultOrder: 'desc',
        },
    };

    const handleDelete = (institutionId: number, institutionName: string) => {
        setDeleteDialog({
            isOpen: true,
            institutionId,
            institutionName,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.institutionId) {
            router.delete(route('admin.other-institutions.destroy', deleteDialog.institutionId));
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Pusat Informasi', href: route('admin.other-institutions.index') },
            ]}
        >
            <Head title="Manage Other Institutions" />

            <div className="space-y-4">
                <AdminFilter config={filterConfig} filters={filters} route="admin.other-institutions.index" />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Daftar Pusat Informasi</h1>
                    <Link href={route('admin.other-institutions.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Lembaga
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pusat Informasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Logo</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kontak</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {otherInstitutions.data.map((institution) => (
                                    <TableRow key={institution.id}>
                                        <TableCell>
                                            {institution.logo_url ? (
                                                <img src={institution.logo_url} alt={institution.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                                                    <span className="text-xs text-gray-500">No Logo</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{institution.name}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {institution.email && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3" />
                                                        {institution.email}
                                                    </div>
                                                )}
                                                {institution.phone && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        {institution.phone}
                                                    </div>
                                                )}
                                                {institution.address && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        {institution.address.substring(0, 30)}...
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {institution.website ? (
                                                <a
                                                    href={institution.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Globe className="h-3 w-3" />
                                                    Visit
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(institution.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.other-institutions.show', institution.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('admin.other-institutions.edit', institution.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(institution.id, institution.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {otherInstitutions.links && otherInstitutions.links.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={otherInstitutions.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, institutionId: null, institutionName: '' })}
                onConfirm={confirmDelete}
                title="Hapus Lembaga"
                description="Apakah Anda yakin ingin menghapus lembaga"
                itemName={deleteDialog.institutionName}
            />
        </AdminLayout>
    );
}
