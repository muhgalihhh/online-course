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
import { Edit, Eye, Image, Plus, ToggleLeft, ToggleRight, Trash2, Video } from 'lucide-react';
import { useState } from 'react';

interface Gallery {
    id: number;
    title: string;
    description: string;
    file_path: string;
    file_type: 'image' | 'video';
    video_source?: 'file' | 'youtube';
    file_url: string | null;
    youtube_url?: string | null;
    youtube_video_id?: string | null;
    youtube_thumbnail?: string | null;
    is_active: boolean;
    created_at: string;
}

interface GalleryIndexProps extends PageProps {
    galleries: PaginatedData<Gallery>;
    filters: {
        search: string;
        file_type: string;
        is_active: string;
        sort_by: string;
        sort_direction: string;
        date_from: string;
        date_to: string;
    };
}

export default function GalleryIndex({ galleries, filters }: GalleryIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        galleryId: number | null;
        galleryTitle: string;
    }>({
        isOpen: false,
        galleryId: null,
        galleryTitle: '',
    });

    const filterConfig: FilterConfig = {
        search: {
            placeholder: 'Cari berdasarkan judul atau deskripsi...',
        },
        select: {
            file_type: {
                label: 'Tipe File',
                placeholder: 'Semua Tipe File',
                options: [
                    { value: 'image', label: 'Gambar' },
                    { value: 'video', label: 'Video' },
                ],
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
        sort: {
            options: [
                { value: 'created_at', label: 'Tanggal Dibuat' },
                { value: 'title', label: 'Judul' },
                { value: 'file_type', label: 'Tipe File' },
                { value: 'is_active', label: 'Status' },
            ],
        },
        dateRange: {
            enabled: false,
        },
    };

    const handleDelete = (gallery: Gallery) => {
        setDeleteDialog({
            isOpen: true,
            galleryId: gallery.id,
            galleryTitle: gallery.title,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.galleryId) {
            router.delete(route('admin.galleries.destroy', deleteDialog.galleryId));
        }
        setDeleteDialog({ isOpen: false, galleryId: null, galleryTitle: '' });
    };

    const toggleActive = (gallery: Gallery) => {
        router.patch(route('admin.galleries.toggle-active', gallery.id));
    };

    return (
        <AdminLayout>
            <Head title="Gallery Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gallery Management</h1>
                        <p className="text-muted-foreground">Kelola foto dan video untuk galeri website</p>
                    </div>
                    <Link href={route('admin.galleries.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Item Galeri
                        </Button>
                    </Link>
                </div>

                <AdminFilter config={filterConfig} filters={filters} route="admin.galleries.index" />

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Gallery ({galleries.total} items)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {galleries.data.length > 0 ? (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Preview</TableHead>
                                            <TableHead>Judul</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal Dibuat</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {galleries.data.map((gallery) => (
                                            <TableRow key={gallery.id}>
                                                <TableCell>
                                                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                                        {gallery.file_type === 'image' && gallery.file_url ? (
                                                            <img src={gallery.file_url} alt={gallery.title} className="h-full w-full object-cover" />
                                                        ) : gallery.file_type === 'video' && gallery.video_source === 'file' && gallery.file_url ? (
                                                            <div className="relative h-full w-full">
                                                                <video src={gallery.file_url} className="h-full w-full object-cover" />
                                                                <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                                                                    Video
                                                                </div>
                                                            </div>
                                                        ) : gallery.file_type === 'video' && gallery.video_source === 'youtube' ? (
                                                            <div className="relative h-full w-full">
                                                                {gallery.youtube_thumbnail ? (
                                                                    <img
                                                                        src={gallery.youtube_thumbnail}
                                                                        alt={gallery.title}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                                                                        <Video className="mb-1 h-6 w-6" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="rounded bg-red-600/80 px-1 text-[10px] font-semibold text-white">
                                                                        YouTube
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                                                                <Image className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{gallery.title}</div>
                                                        {gallery.description && (
                                                            <div className="max-w-xs truncate text-sm text-muted-foreground">
                                                                {gallery.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={gallery.file_type === 'image' ? 'default' : 'secondary'}>
                                                        {gallery.file_type === 'image' ? (
                                                            <>
                                                                <Image className="mr-1 h-3 w-3" /> Gambar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Video className="mr-1 h-3 w-3" /> Video
                                                            </>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={gallery.is_active ? 'default' : 'destructive'}>
                                                        {gallery.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(gallery.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={route('admin.galleries.show', gallery.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.galleries.edit', gallery.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="outline" size="sm" onClick={() => toggleActive(gallery)}>
                                                            {gallery.is_active ? (
                                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(gallery)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {galleries.last_page > 1 && <Pagination links={galleries.links} />}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <div className="mb-4 text-gray-400">
                                    <Image className="mx-auto mb-4 h-16 w-16" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Belum ada item galeri</h3>
                                <p className="mb-6 text-gray-500">Mulai dengan menambahkan foto atau video pertama Anda.</p>
                                <Link href={route('admin.galleries.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Item Galeri
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmation
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, galleryId: null, galleryTitle: '' })}
                onConfirm={confirmDelete}
                title="Hapus Item Galeri"
                description={`Apakah Anda yakin ingin menghapus "${deleteDialog.galleryTitle}"? File terkait juga akan dihapus dari server. Tindakan ini tidak dapat dibatalkan.`}
            />
        </AdminLayout>
    );
}
