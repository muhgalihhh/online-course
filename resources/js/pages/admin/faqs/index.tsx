import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, Eye, MoreHorizontal, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Faq {
    id: number;
    question: string;
    answer: string;
    category: string;
    category_name: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    faqs: {
        data: Faq[];
        links: Array<{ url?: string; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
    };
    categories: Record<string, string>;
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function FaqIndex() {
    const { faqs, categories, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedFaqs, setSelectedFaqs] = useState<number[]>([]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.faqs.index'),
            {
                search,
                category: filters.category,
                status: filters.status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('admin.faqs.index'),
            {
                search: filters.search,
                category: key === 'category' ? value : filters.category,
                status: key === 'status' ? value : filters.status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePagination = (url: string) => {
        router.get(
            url,
            {
                search: filters.search,
                category: filters.category,
                status: filters.status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleToggleStatus = (faq: Faq) => {
        router.post(
            route('admin.faqs.toggle-status', faq.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (faq: Faq) => {
        if (confirm(`Apakah Anda yakin ingin menghapus FAQ "${faq.question}"?`)) {
            router.delete(route('admin.faqs.destroy', faq.id), {
                preserveScroll: true,
            });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedFaqs(faqs.data.map((faq) => faq.id));
        } else {
            setSelectedFaqs([]);
        }
    };

    const handleSelectFaq = (faqId: number, checked: boolean) => {
        if (checked) {
            setSelectedFaqs([...selectedFaqs, faqId]);
        } else {
            setSelectedFaqs(selectedFaqs.filter((id) => id !== faqId));
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedFaqs.length === 0) {
            alert('Pilih setidaknya satu FAQ.');
            return;
        }

        let message = '';
        switch (action) {
            case 'activate':
                message = 'mengaktifkan';
                break;
            case 'deactivate':
                message = 'menonaktifkan';
                break;
            case 'delete':
                message = 'menghapus';
                break;
        }

        if (confirm(`Apakah Anda yakin ingin ${message} ${selectedFaqs.length} FAQ yang dipilih?`)) {
            router.post(
                route('admin.faqs.bulk-action'),
                {
                    action,
                    faq_ids: selectedFaqs,
                },
                {
                    onSuccess: () => setSelectedFaqs([]),
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">FAQ Management</h1>
                        <p className="text-muted-foreground">Kelola pertanyaan yang sering ditanyakan</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.faqs.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah FAQ
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Cari FAQ..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                </div>
                            </form>

                            {/* Category Filter */}
                            <Select
                                value={filters.category || 'all'}
                                onValueChange={(value) => handleFilter('category', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {Object.entries(categories).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedFaqs.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">{selectedFaqs.length} FAQ dipilih</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                                        Aktifkan
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                                        Nonaktifkan
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* FAQ Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="w-12 p-4">
                                            <Checkbox
                                                checked={selectedFaqs.length === faqs.data.length && faqs.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4">Pertanyaan</th>
                                        <th className="p-4">Kategori</th>
                                        <th className="p-4">Urutan</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Tanggal Dibuat</th>
                                        <th className="w-24 p-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faqs.data.map((faq) => (
                                        <tr key={faq.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <Checkbox
                                                    checked={selectedFaqs.includes(faq.id)}
                                                    onCheckedChange={(checked) => handleSelectFaq(faq.id, !!checked)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="max-w-xs">
                                                    <p className="line-clamp-2 font-medium">{faq.question}</p>
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{faq.answer}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline">{faq.category_name || faq.category || 'Tidak Dikategorikan'}</Badge>
                                            </td>
                                            <td className="p-4">{faq.sort_order}</td>
                                            <td className="p-4">
                                                <button onClick={() => handleToggleStatus(faq)} className="flex items-center gap-2">
                                                    {faq.is_active ? (
                                                        <ToggleRight className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                                                    )}
                                                    <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                                                        {faq.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <time className="text-sm text-muted-foreground">
                                                    {new Date(faq.created_at).toLocaleDateString('id-ID')}
                                                </time>
                                            </td>
                                            <td className="p-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.faqs.show', faq.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.faqs.edit', faq.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(faq)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {faqs.data.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-muted-foreground">Tidak ada FAQ ditemukan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {faqs.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            {faqs.links.map((link, index) => {
                                if (!link.url) {
                                    return <Button key={index} variant="ghost" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />;
                                }

                                if (link.label.includes('Previous')) {
                                    return (
                                        <Button key={index} variant="outline" size="sm" onClick={() => handlePagination(link.url!)}>
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                    );
                                }

                                if (link.label.includes('Next')) {
                                    return (
                                        <Button key={index} variant="outline" size="sm" onClick={() => handlePagination(link.url!)}>
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePagination(link.url!)}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
