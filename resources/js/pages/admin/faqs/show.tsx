import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/admin-layout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Hash, Tag } from 'lucide-react';

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
    faq: Faq;
}

export default function FaqShow() {
    const { faq } = usePage<PageProps>().props;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.faqs.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Detail FAQ</h1>
                            <p className="text-muted-foreground">Lihat informasi lengkap FAQ</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.faqs.edit', faq.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit FAQ
                        </Link>
                    </Button>
                </div>

                {/* FAQ Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="mb-2 text-xl">{faq.question}</CardTitle>
                                        <div className="mb-4 flex items-center gap-2">
                                            <Badge variant={faq.is_active ? 'default' : 'secondary'}>{faq.is_active ? 'Aktif' : 'Tidak Aktif'}</Badge>
                                            <Badge variant="outline">
                                                <Tag className="mr-1 h-3 w-3" />
                                                {faq.category_name}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-3 text-lg font-semibold">Jawaban</h3>
                                        <div className="prose prose-gray max-w-none">
                                            {faq.answer.split('\n').map(
                                                (paragraph, index) =>
                                                    paragraph.trim() && (
                                                        <p key={index} className="mb-3 leading-relaxed text-gray-700">
                                                            {paragraph}
                                                        </p>
                                                    ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* FAQ Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi FAQ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">ID</p>
                                        <p className="text-sm text-muted-foreground">{faq.id}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Kategori</p>
                                        <p className="text-sm text-muted-foreground">{faq.category_name}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-3">
                                    <div className="flex h-4 w-4 items-center justify-center text-muted-foreground">
                                        <div className="text-xs">#</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Urutan</p>
                                        <p className="text-sm text-muted-foreground">{faq.sort_order}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Dibuat</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(faq.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Diperbarui</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(faq.updated_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" asChild>
                                    <Link href={route('admin.faqs.edit', faq.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit FAQ
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={route('admin.faqs.index')}>Kembali ke Daftar</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
