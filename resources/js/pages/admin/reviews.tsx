// resources/js/pages/admin/reviews.tsx

import { Pagination } from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, Filter, Flag, MessageSquare, Search, Star, ThumbsUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Reviews',
        href: route('admin.reviews'),
    },
];

interface Review {
    id: string; // Changed from number to string to support prefixed IDs
    original_id?: number; // Optional original ID for backend operations
    rating: number;
    comment: string;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    reviewable: {
        id: number;
        title: string;
        type: 'course' | 'institution';
    };
}

interface ReviewsProps extends PageProps {
    reviews: PaginatedData<Review>;
    filters?: {
        search?: string;
        status?: string;
        rating_min?: string;
        rating_max?: string;
        review_type?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_order?: string;
    };
    statistics?: {
        total_reviews: number;
        average_rating: number;
        pending_reviews: number;
        approved_reviews: number;
        rejected_reviews: number;
    };
}

export default function Reviews({ reviews, filters = {}, statistics }: ReviewsProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.review_type || 'all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

    // Filter reviews based on local state untuk UI yang responsive
    const filteredReviews = reviews.data.filter((review) => {
        const matchesSearch =
            review.comment.toLowerCase().includes(searchTerm.toLowerCase()) || review.user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
        const matchesType = typeFilter === 'all' || review.reviewable.type === typeFilter;
        const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;

        return matchesSearch && matchesStatus && matchesType && matchesRating;
    });

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (typeFilter !== 'all') params.set('review_type', typeFilter);

        router.get(route('admin.reviews'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (reviewId: string, newStatus: string) => {
        router.patch(
            route('admin.reviews.update-status', reviewId),
            {
                status: newStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Status berhasil diperbarui',
                        description: `Review telah ${newStatus === 'approved' ? 'disetujui' : newStatus === 'rejected' ? 'ditolak' : 'diubah ke menunggu'}.`,
                    });
                    // Refresh halaman untuk mendapat data terbaru
                    router.reload({ only: ['reviews'] });
                },
                onError: () => {
                    toast({
                        title: 'Gagal memperbarui status',
                        description: 'Terjadi kesalahan saat memperbarui status review.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const confirmDelete = (reviewId: string) => {
        setReviewToDelete(reviewId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteReview = () => {
        if (reviewToDelete) {
            router.delete(route('admin.reviews.destroy', reviewToDelete), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setReviewToDelete(null);
                    toast({
                        title: 'Review berhasil dihapus',
                        description: 'Review telah dihapus dari sistem.',
                    });
                    // Refresh halaman untuk mendapat data terbaru
                    router.reload({ only: ['reviews'] });
                },
                onError: () => {
                    toast({
                        title: 'Gagal menghapus review',
                        description: 'Terjadi kesalahan saat menghapus review.',
                        variant: 'destructive',
                    });
                },
            });
        }
    };

    // Menghitung statistik dari data real (gunakan dari backend jika ada, fallback ke frontend calculation)
    const totalReviews = statistics?.total_reviews || reviews.total || filteredReviews.length;
    const averageRating =
        statistics?.average_rating ||
        (filteredReviews.length > 0
            ? (filteredReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / filteredReviews.length).toFixed(1)
            : 0);
    const pendingReviews = statistics?.pending_reviews || filteredReviews.filter((review: Review) => review.status === 'pending').length;
    const approvedReviews = statistics?.approved_reviews || filteredReviews.filter((review: Review) => review.status === 'approved').length;

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'approved':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'rejected':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Disetujui';
            case 'pending':
                return 'Menunggu';
            case 'rejected':
                return 'Ditolak';
            default:
                return status;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'course':
                return 'Kursus';
            case 'institution':
                return 'Institusi';
            default:
                return type;
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Reviews" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Reviews</h1>
                    <p className="text-muted-foreground">Kelola ulasan kursus dan institusi dari pengguna</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter & Pencarian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Review</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan komentar atau nama pengguna..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    // Auto search ketika filter berubah
                                    setTimeout(handleSearch, 100);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipe</label>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value);
                                    // Auto search ketika filter berubah
                                    setTimeout(handleSearch, 100);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="course">Kursus</SelectItem>
                                    <SelectItem value="institution">Institusi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Rating</SelectItem>
                                    <SelectItem value="5">5 Bintang</SelectItem>
                                    <SelectItem value="4">4 Bintang</SelectItem>
                                    <SelectItem value="3">3 Bintang</SelectItem>
                                    <SelectItem value="2">2 Bintang</SelectItem>
                                    <SelectItem value="1">1 Bintang</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tombol Search Manual */}
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSearch} className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Cari
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Daftar Reviews ({filteredReviews.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Komentar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReviews.map((review: Review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{review.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{review.user.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{review.reviewable.title}</div>
                                            <Badge variant="outline" className="text-xs">
                                                {getTypeLabel(review.reviewable.type)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.rating)}
                                            <span className="ml-1 text-sm text-muted-foreground">({review.rating}/5)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs">
                                            <p className="line-clamp-2 text-sm">{review.comment}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusBadgeVariant(review.status)}>{getStatusLabel(review.status)}</Badge>
                                            <Select
                                                value={review.status}
                                                onValueChange={(value) => handleStatusChange(review.id, value)}
                                                disabled={router.processing}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Menunggu</SelectItem>
                                                    <SelectItem value="approved">Disetujui</SelectItem>
                                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog
                                                open={deleteDialogOpen && reviewToDelete === review.id}
                                                onOpenChange={(open) => {
                                                    if (!open) {
                                                        setDeleteDialogOpen(false);
                                                        setReviewToDelete(null);
                                                    }
                                                }}
                                            >
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => confirmDelete(review.id)}
                                                        disabled={router.processing}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Hapus Review</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apakah Anda yakin ingin menghapus review ini? Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel disabled={router.processing}>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleDeleteReview}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            disabled={router.processing}
                                                        >
                                                            {router.processing ? 'Menghapus...' : 'Hapus'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {reviews.links && reviews.links.length > 0 && (
                        <div className="mt-4">
                            <Pagination links={reviews.links} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReviews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total ulasan dari pengguna</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{typeof averageRating === 'string' ? averageRating : averageRating.toFixed(1)}</div>
                        <div className="mt-1 flex items-center gap-1">{renderStars(Math.round(Number(averageRating)))}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reviews Menunggu</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReviews}</div>
                        <p className="text-xs text-muted-foreground">Menunggu moderasi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reviews Disetujui</CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedReviews}</div>
                        <p className="text-xs text-muted-foreground">Sudah disetujui</p>
                    </CardContent>
                </Card>
            </div>

            {/* Info Box */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Kelola Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            • <strong>Pending:</strong> Review baru yang perlu dimoderasi
                        </p>
                        <p>
                            • <strong>Approved:</strong> Review yang telah disetujui dan akan ditampilkan
                        </p>
                        <p>
                            • <strong>Rejected:</strong> Review yang ditolak karena melanggar ketentuan
                        </p>
                        <p>• Gunakan filter untuk mencari review berdasarkan status, tipe, atau kata kunci</p>
                        <p>• Klik mata untuk melihat detail, atau tong sampah untuk menghapus review</p>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
