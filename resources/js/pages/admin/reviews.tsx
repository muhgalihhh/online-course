// resources/js/pages/admin/reviews.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type PaginatedData } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { MessageSquare, Star, Filter, Search, Eye, Trash2, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
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
    id: number;
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
}

export default function Reviews({ reviews }: ReviewsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const { patch, delete: destroy } = useForm();

    const handleStatusChange = (reviewId: number, newStatus: string) => {
        patch(route('admin.reviews.update-status', reviewId), {
            data: { status: newStatus },
        });
    };

    const handleDeleteReview = (reviewId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus review ini?')) {
            destroy(route('admin.reviews.destroy', reviewId));
        }
    };

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
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Reviews" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Reviews</h1>
                    <p className="text-muted-foreground">
                        Kelola ulasan kursus dan institusi dari pengguna
                    </p>
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
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan komentar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                            <Select>
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
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Daftar Reviews ({reviews.data.length})
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
                            {reviews.data.map((review) => (
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
                                            <span className="text-sm text-muted-foreground ml-1">
                                                ({review.rating}/5)
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs">
                                            <p className="text-sm line-clamp-2">{review.comment}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={review.status}
                                            onValueChange={(value) => handleStatusChange(review.id, value)}
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
                                    </TableCell>
                                    <TableCell>
                                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDeleteReview(review.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
                        <div className="text-2xl font-bold">1,247</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2</div>
                        <div className="flex items-center gap-1 mt-1">
                            {renderStars(4)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">23</div>
                        <p className="text-xs text-muted-foreground">
                            Menunggu moderasi
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reported Reviews</CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">
                            Perlu investigasi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Aktivitas Review Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Review disetujui</p>
                                <p className="text-xs text-muted-foreground">Review untuk "React Fundamentals" telah disetujui</p>
                            </div>
                            <span className="text-xs text-muted-foreground">2 menit yang lalu</span>
                        </div>

                        <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ThumbsDown className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Review ditolak</p>
                                <p className="text-xs text-muted-foreground">Review untuk "Node.js Backend" telah ditolak</p>
                            </div>
                            <span className="text-xs text-muted-foreground">1 jam yang lalu</span>
                        </div>

                        <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Flag className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Review dilaporkan</p>
                                <p className="text-xs text-muted-foreground">Review untuk "UI/UX Design" telah dilaporkan</p>
                            </div>
                            <span className="text-xs text-muted-foreground">3 jam yang lalu</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}