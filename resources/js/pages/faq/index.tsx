import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GuestLayout from '@/layouts/guest-layout';
import { router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, HelpCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface Faq {
    id: number;
    question: string;
    answer: string;
    category: string;
    category_name: string;
    sort_order: number;
}

interface PageProps {
    faqs: Faq[];
    faqsByCategory: Record<string, Faq[]>;
    categories: Record<string, string>;
    filters: {
        search?: string;
        category?: string;
    };
}

interface FaqItemProps {
    faq: Faq;
    isOpen: boolean;
    onToggle: () => void;
}

function FaqItem({ faq, isOpen, onToggle }: FaqItemProps) {
    return (
        <Card className="transition-shadow duration-200 hover:shadow-md">
            <Collapsible open={isOpen} onOpenChange={onToggle}>
                <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-6 text-left transition-colors duration-200 hover:bg-gray-50">
                        <div className="flex-1">
                            <h3 className="pr-4 text-lg font-semibold text-gray-900">{faq.question}</h3>
                        </div>
                        <div className="flex-shrink-0">
                            {isOpen ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-6">
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
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export default function FaqIndex() {
    const { faqs, faqsByCategory, categories, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('faq.index'),
            {
                search,
                category: filters.category,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilter = (category: string) => {
        router.get(
            route('faq.index'),
            {
                search: filters.search,
                category: category === 'all' ? '' : category,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const toggleItem = (faqId: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(faqId)) {
            newOpenItems.delete(faqId);
        } else {
            newOpenItems.add(faqId);
        }
        setOpenItems(newOpenItems);
    };

    const toggleAll = () => {
        if (openItems.size === faqs.length) {
            setOpenItems(new Set());
        } else {
            setOpenItems(new Set(faqs.map((faq) => faq.id)));
        }
    };

    return (
        <GuestLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="border-b bg-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <HelpCircle className="h-8 w-8" />
                            </div>
                            <h1 className="mb-4 text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
                            <p className="mx-auto max-w-2xl text-lg text-gray-600">
                                Temukan jawaban untuk pertanyaan yang sering ditanyakan seputar platform, kursus, dan layanan kami
                            </p>
                        </div>

                        {/* Search and Filter */}
                        <div className="mx-auto max-w-2xl space-y-4">
                            <form onSubmit={handleSearch} className="relative">
                                <Input
                                    type="text"
                                    placeholder="Cari pertanyaan atau topik..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-12 pr-4 pl-10 text-lg"
                                />
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 transform" size="sm">
                                    Cari
                                </Button>
                            </form>

                            <div className="flex items-center justify-between">
                                <Select value={filters.category || 'all'} onValueChange={handleFilter}>
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

                                <Button variant="outline" onClick={toggleAll} className="text-sm">
                                    {openItems.size === faqs.length ? 'Tutup Semua' : 'Buka Semua'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="container mx-auto px-4 py-8">
                    {faqs.length === 0 ? (
                        <div className="py-16 text-center">
                            <HelpCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">Tidak ada FAQ ditemukan</h3>
                            <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
                        </div>
                    ) : filters.category ? (
                        // Show filtered results
                        <div className="mx-auto max-w-4xl">
                            <div className="space-y-4">
                                {faqs.map((faq) => (
                                    <FaqItem key={faq.id} faq={faq} isOpen={openItems.has(faq.id)} onToggle={() => toggleItem(faq.id)} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Show grouped by category
                        <div className="mx-auto max-w-4xl">
                            <div className="space-y-8">
                                {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                                    <div key={category}>
                                        <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
                                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                <HelpCircle className="h-5 w-5" />
                                            </div>
                                            {categories[category] || category}
                                            <span className="ml-3 rounded-full bg-gray-100 px-2 py-1 text-sm font-normal text-gray-500">
                                                {categoryFaqs.length} pertanyaan
                                            </span>
                                        </h2>
                                        <div className="space-y-4">
                                            {categoryFaqs.map((faq) => (
                                                <FaqItem key={faq.id} faq={faq} isOpen={openItems.has(faq.id)} onToggle={() => toggleItem(faq.id)} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    {faqs.length > 0 && (
                        <div className="mx-auto mt-16 max-w-4xl">
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="p-8 text-center">
                                    <h3 className="mb-4 text-xl font-semibold text-gray-900">Tidak menemukan jawaban yang Anda cari?</h3>
                                    <p className="mb-6 text-gray-600">Tim customer service kami siap membantu Anda dengan pertanyaan apapun.</p>
                                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                            Hubungi Customer Service
                                        </Button>
                                        <Button variant="outline" size="lg">
                                            Kirim Pertanyaan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
