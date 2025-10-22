import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, ExternalLink, Home, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Institution {
    id: number;
    name: string;
    phone: string;
}

interface Accommodation {
    id: number;
    name: string;
    description: string;
    price_per_night: number;
    formatted_price: string;
    image_path: string | null;
    image_url: string;
    is_active: boolean;
    institution: Institution;
    whatsapp_booking_url: string;
    created_at: string;
    updated_at: string;
}

interface AccommodationIndexProps extends PageProps {
    accommodations: PaginatedData<Accommodation>;
    institutions?: { id: number; name: string }[];
    filters: {
        search: string;
        institution_id: string;
        is_active: string;
        min_price: string;
        max_price: string;
        sort_by: string;
        sort_direction: string;
        date_from: string;
        date_to: string;
    };
}

export default function AccommodationIndex({ accommodations, institutions = [], filters }: AccommodationIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        accommodationId: number | null;
        accommodationName: string;
    }>({
        isOpen: false,
        accommodationId: null,
        accommodationName: '',
    });

    const filterConfig: FilterConfig = {
        search: {
            placeholder: 'Cari berdasarkan nama akomodasi, deskripsi, atau institusi...',
        },
        select: {
            institution_id: {
                label: 'Institusi',
                placeholder: 'Semua Institusi',
                options:
                    institutions && institutions.length > 0
                        ? institutions.map((inst) => ({
                              value: inst.id.toString(),
                              label: inst.name,
                          }))
                        : [],
            },
            is_active: {
                label: 'Status',
                placeholder: 'Semua Status',
                options: [
                    { value: 'true', label: 'Aktif' },
                    { value: 'false', label: 'Tidak Aktif' },
                ],
            },
        },
        numberRange: {
            min_price: {
                label: 'Harga Minimum',
            },
            max_price: {
                label: 'Harga Maksimum',
            },
        },
        sort: {
            options: [
                { value: 'created_at', label: 'Tanggal Dibuat' },
                { value: 'name', label: 'Nama' },
                { value: 'price_per_night', label: 'Harga' },
                { value: 'is_active', label: 'Status' },
            ],
        },
        dateRange: {
            enabled: false,
        },
    };

    const handleDelete = (accommodation: Accommodation) => {
        setDeleteDialog({
            isOpen: true,
            accommodationId: accommodation.id,
            accommodationName: accommodation.name,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.accommodationId) {
            router.delete(route('admin.accommodations.destroy', deleteDialog.accommodationId));
        }
        setDeleteDialog({ isOpen: false, accommodationId: null, accommodationName: '' });
    };

    const handleToggleStatus = (accommodation: Accommodation) => {
        router.post(route('admin.accommodations.toggle-status', accommodation.id));
    };

    return (
        <AdminLayout>
            <Head title="Kelola Akomodasi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kelola Akomodasi</h1>
                        <p className="text-muted-foreground">Kelola data akomodasi penginapan yang tersedia</p>
                    </div>
                    <Link href={route('admin.accommodations.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Akomodasi
                        </Button>
                    </Link>
                </div>

                {/* Filter */}
                <AdminFilter config={filterConfig} filters={filters} route="admin.accommodations.index" />

                {/* Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Daftar Akomodasi ({accommodations.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accommodations.data.length === 0 ? (
                            <div className="py-8 text-center">
                                <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">Belum Ada Akomodasi</h3>
                                <p className="mb-4 text-muted-foreground">Mulai menambahkan akomodasi penginapan pertama Anda.</p>
                                <Link href={route('admin.accommodations.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Akomodasi
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Gambar</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Institusi</TableHead>
                                            <TableHead>Harga per Malam</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Dibuat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accommodations.data.map((accommodation) => (
                                            <TableRow key={accommodation.id}>
                                                <TableCell>
                                                    <div className="h-12 w-16 overflow-hidden rounded-md bg-muted">
                                                        <img
                                                            src={accommodation.image_url}
                                                            alt={accommodation.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{accommodation.name}</div>
                                                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                                                            {accommodation.description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{accommodation.institution.name}</div>
                                                        {accommodation.institution.phone && (
                                                            <div className="text-sm text-muted-foreground">{accommodation.institution.phone}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-green-600">{accommodation.formatted_price}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={accommodation.is_active ? 'default' : 'secondary'}>
                                                        {accommodation.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(accommodation.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* WhatsApp Booking Link */}
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a
                                                                href={accommodation.whatsapp_booking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Pesan via WhatsApp"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>

                                                        {/* Toggle Status */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(accommodation)}
                                                            title={accommodation.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        >
                                                            {accommodation.is_active ? (
                                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </Button>

                                                        {/* Edit */}
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('admin.accommodations.edit', accommodation.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        {/* Delete */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(accommodation)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Pagination links={accommodations.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, accommodationId: null, accommodationName: '' })}
                onConfirm={confirmDelete}
                title="Hapus Akomodasi"
                description={`Apakah Anda yakin ingin menghapus akomodasi "${deleteDialog.accommodationName}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </AdminLayout>
    );
}
