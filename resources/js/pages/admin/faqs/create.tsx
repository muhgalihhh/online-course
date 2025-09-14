import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface PageProps {
    categories: Record<string, string>;
}

export default function FaqCreate() {
    const { categories } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        answer: '',
        category: 'general',
        sort_order: 0,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.faqs.store'));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('admin.faqs.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Tambah FAQ Baru</h1>
                        <p className="text-muted-foreground">Buat pertanyaan yang sering ditanyakan baru</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi FAQ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Question */}
                            <div className="space-y-2">
                                <Label htmlFor="question">Pertanyaan *</Label>
                                <Input
                                    id="question"
                                    type="text"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    placeholder="Masukkan pertanyaan yang sering ditanyakan"
                                    required
                                />
                                {errors.question && <p className="text-sm text-red-600">{errors.question}</p>}
                            </div>

                            {/* Answer */}
                            <div className="space-y-2">
                                <Label htmlFor="answer">Jawaban *</Label>
                                <Textarea
                                    id="answer"
                                    value={data.answer}
                                    onChange={(e) => setData('answer', e.target.value)}
                                    placeholder="Masukkan jawaban lengkap"
                                    rows={6}
                                    required
                                />
                                {errors.answer && <p className="text-sm text-red-600">{errors.answer}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(categories).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                </div>

                                {/* Sort Order */}
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Urutan</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        placeholder="Urutan tampilan (0 = paling atas)"
                                    />
                                    {errors.sort_order && <p className="text-sm text-red-600">{errors.sort_order}</p>}
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                                <Label htmlFor="is_active">Aktif</Label>
                            </div>
                            {errors.is_active && <p className="text-sm text-red-600">{errors.is_active}</p>}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan FAQ'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('admin.faqs.index')}>Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
