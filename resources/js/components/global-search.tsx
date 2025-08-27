import { useState, useEffect, useRef, forwardRef, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { router } from '@inertiajs/react';
import { 
    Search, 
    Users, 
    BookOpen, 
    FileText, 
    ShoppingCart,
    Settings,
    BarChart3,
    GraduationCap,
    Building,
    Building2,
    FolderOpen,
    Clock,
    TrendingUp,
    Star,
    BookOpenCheck,
    X,
    AlertCircle,
    Hash,
    Calendar,
    DollarSign,
    Filter,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    type: 'user' | 'course' | 'transaction' | 'material' | 'chapter' | 'institution' | 'category' | 'review' | 'page';
    url: string;
    icon?: React.ReactNode;
    meta?: string;
    badge?: string;
    highlight?: boolean;
}

interface GlobalSearchProps {
    isOpen?: boolean;
    onClose?: () => void;
    trigger?: React.ReactNode;
}

// Custom wrapper component to ensure proper click handling
interface ClickableCommandItemProps {
    children: React.ReactNode;
    onItemClick: () => void;
    className?: string;
    value: string;
}

const ClickableCommandItem = forwardRef<HTMLDivElement, ClickableCommandItemProps>(
    ({ children, onItemClick, className, value }, ref) => {
        const handleClick = (e: React.MouseEvent | React.PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onItemClick();
        };

        const handleSelect = () => {
            onItemClick();
        };

        return (
            <CommandItem
                ref={ref}
                className={className}
                value={value}
                onSelect={handleSelect}
                onClick={handleClick}
                onMouseDown={(e) => e.preventDefault()}
                style={{ cursor: 'pointer' }}
            >
                {children}
            </CommandItem>
        );
    }
);

ClickableCommandItem.displayName = 'ClickableCommandItem';

export function GlobalSearch({ isOpen: controlledIsOpen, onClose, trigger }: GlobalSearchProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Use controlled state if provided
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : open;
    const handleOpen = controlledIsOpen !== undefined ? onClose : () => setOpen(!open);

    // Search filters
    const searchFilters = [
        { id: 'all', label: 'Semua', icon: <Sparkles className="h-3 w-3" /> },
        { id: 'users', label: 'Pengguna', icon: <Users className="h-3 w-3" /> },
        { id: 'courses', label: 'Kursus', icon: <BookOpen className="h-3 w-3" /> },
        { id: 'transactions', label: 'Transaksi', icon: <ShoppingCart className="h-3 w-3" /> },
        { id: 'materials', label: 'Materi', icon: <FileText className="h-3 w-3" /> },
        { id: 'reviews', label: 'Ulasan', icon: <Star className="h-3 w-3" /> },
    ];

    // Quick access pages - memoized to prevent recreation
    const quickAccess: SearchResult[] = useMemo(() => [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'page',
            url: route('admin.dashboard'),
            icon: <BarChart3 className="h-4 w-4" />,
            description: 'Lihat statistik dan ringkasan',
        },
        {
            id: 'users',
            title: 'Manajemen Pengguna',
            type: 'page',
            url: route('admin.users.index'),
            icon: <Users className="h-4 w-4" />,
            description: 'Kelola pengguna sistem',
        },
        {
            id: 'courses',
            title: 'Manajemen Kursus',
            type: 'page',
            url: route('admin.courses.index'),
            icon: <BookOpen className="h-4 w-4" />,
            description: 'Kelola kursus dan konten',
        },
        {
            id: 'transactions',
            title: 'Transaksi',
            type: 'page',
            url: route('admin.transactions.index'),
            icon: <ShoppingCart className="h-4 w-4" />,
            description: 'Lihat riwayat transaksi',
        },
        {
            id: 'categories',
            title: 'Kategori',
            type: 'page',
            url: route('admin.categories.index'),
            icon: <FolderOpen className="h-4 w-4" />,
            description: 'Kelola kategori kursus',
        },
        {
            id: 'institutions',
            title: 'Institusi',
            type: 'page',
            url: route('admin.institutions.index'),
            icon: <Building2 className="h-4 w-4" />,
            description: 'Kelola data institusi',
        },
        {
            id: 'reviews',
            title: 'Ulasan',
            type: 'page',
            url: route('admin.reviews'),
            icon: <Star className="h-4 w-4" />,
            description: 'Kelola ulasan kursus',
        },
        {
            id: 'settings',
            title: 'Pengaturan',
            type: 'page',
            url: route('admin.settings'),
            icon: <Settings className="h-4 w-4" />,
            description: 'Konfigurasi sistem',
        },
    ], []);

    // Helper function to get icon based on type
    const getIconForType = (type: SearchResult['type']) => {
        switch (type) {
            case 'user':
                return <Users className="h-4 w-4" />;
            case 'course':
                return <BookOpen className="h-4 w-4" />;
            case 'transaction':
                return <ShoppingCart className="h-4 w-4" />;
            case 'material':
                return <FileText className="h-4 w-4" />;
            case 'chapter':
                return <BookOpenCheck className="h-4 w-4" />;
            case 'institution':
                return <Building className="h-4 w-4" />;
            case 'category':
                return <FolderOpen className="h-4 w-4" />;
            case 'review':
                return <Star className="h-4 w-4" />;
            case 'page':
                return <BarChart3 className="h-4 w-4" />;
            default:
                return <Search className="h-4 w-4" />;
        }
    };

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const withIcons = parsed.map((item: any) => ({
                    ...item,
                    icon: getIconForType(item.type)
                }));
                setRecentSearches(withIcons.slice(0, 5));
            } catch (e) {
                console.error('Failed to parse recent searches', e);
                setRecentSearches([]);
            }
        }
    }, []);

    // Keyboard shortcut to open search (Cmd/Ctrl + K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                
                if (controlledIsOpen !== undefined && onClose) {
                    if (!controlledIsOpen) {
                        // Controlled by parent
                    } else {
                        onClose();
                    }
                } else {
                    setOpen((open) => !open);
                }
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [controlledIsOpen, onClose]);

    // Helper to build admin search URL with a safe fallback
    const getAdminSearchUrl = () => {
        try {
            return route('admin.search');
        } catch (e) {
            return '/admin/search';
        }
    };

    // Search function with API call
    const performSearch = useCallback(async (query: string, filter: string = 'all') => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch(getAdminSearchUrl(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    query,
                    filter: filter !== 'all' ? filter : undefined 
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Search API error:', errorData);
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Handle error response
            if (data.error) {
                throw new Error(data.message || data.error);
            }
            
            // Transform API results to SearchResult format
            const results: SearchResult[] = [];

            // Process users
            if (data.users && (filter === 'all' || filter === 'users')) {
                data.users.forEach((user: any) => {
                    results.push({
                        id: `user-${user.id}`,
                        title: user.name,
                        description: user.email,
                        type: 'user',
                        url: route('admin.users.edit', { user: user.id }),
                        icon: <Users className="h-4 w-4" />,
                        meta: user.formatted_role || user.role,
                        badge: user.phone ? 'Verified' : undefined,
                    });
                });
            }

            // Process courses
            if (data.courses && (filter === 'all' || filter === 'courses')) {
                data.courses.forEach((course: any) => {
                    const studentCount = course.students_count || 0;
                    const chapterCount = course.chapters_count || 0;
                    
                    results.push({
                        id: `course-${course.id}`,
                        title: course.title,
                        description: course.description,
                        type: 'course',
                        url: route('admin.courses.show', { course: course.id }),
                        icon: <BookOpen className="h-4 w-4" />,
                        meta: `${studentCount} siswa • ${chapterCount} bab`,
                        badge: course.is_pro ? 'Pro' : 'Free',
                        highlight: course.is_pro,
                    });
                });
            }

            // Process categories
            if (data.categories && (filter === 'all' || filter === 'categories')) {
                data.categories.forEach((category: any) => {
                    results.push({
                        id: `category-${category.id}`,
                        title: category.name,
                        description: category.description,
                        type: 'category',
                        url: route('admin.categories.edit', { category: category.id }),
                        icon: <FolderOpen className="h-4 w-4" />,
                        meta: `${category.courses_count || 0} kursus`,
                    });
                });
            }

            // Process chapters
            if (data.chapters && (filter === 'all' || filter === 'materials')) {
                data.chapters.forEach((chapter: any) => {
                    let chapterUrl;
                    try {
                        chapterUrl = route('admin.chapters.edit', { chapter: chapter.id });
                    } catch (e) {
                        chapterUrl = `/admin/chapters/${chapter.id}/edit`;
                    }
                    
                    results.push({
                        id: `chapter-${chapter.id}`,
                        title: chapter.title,
                        description: chapter.description,
                        type: 'chapter',
                        url: chapterUrl,
                        icon: <BookOpenCheck className="h-4 w-4" />,
                        meta: chapter.course_title,
                        badge: chapter.is_free ? 'Free' : 'Locked',
                    });
                });
            }

            // Process institutions
            if (data.institutions && (filter === 'all' || filter === 'institutions')) {
                data.institutions.forEach((institution: any) => {
                    results.push({
                        id: `institution-${institution.id}`,
                        title: institution.name,
                        description: institution.description,
                        type: 'institution',
                        url: route('admin.institutions.edit'),
                        icon: <Building2 className="h-4 w-4" />,
                        meta: institution.address,
                        badge: `${institution.courses_count || 0} kursus`,
                    });
                });
            }

            // Process course materials
            if (data.course_materials && (filter === 'all' || filter === 'materials')) {
                data.course_materials.forEach((material: any) => {
                    let materialUrl;
                    try {
                        materialUrl = route('admin.materials.show', { material: material.id });
                    } catch (e) {
                        try {
                            materialUrl = route('admin.materials.edit', { material: material.id });
                        } catch (e2) {
                            materialUrl = `/admin/materials/${material.id}`;
                        }
                    }
                    
                    const typeIcon = material.type === 'video' ? '🎥' : '📄';
                    
                    results.push({
                        id: `material-${material.id}`,
                        title: `${typeIcon} ${material.title}`,
                        description: material.chapter_title ? `Bab: ${material.chapter_title}` : material.course_title,
                        type: 'material',
                        url: materialUrl,
                        icon: <FileText className="h-4 w-4" />,
                        meta: material.type,
                        badge: material.is_preview ? 'Preview' : undefined,
                    });
                });
            }

            // Process reviews (both institution and course reviews)
            if (data.reviews && (filter === 'all' || filter === 'reviews')) {
                data.reviews.forEach((review: any) => {
                    let reviewUrl;
                    const reviewType = review.type || 'course';
                    
                    try {
                        if (reviewType === 'institution') {
                            reviewUrl = route('admin.institutions.index');
                            reviewUrl += `?highlight_review=${review.id}`;
                        } else {
                            reviewUrl = route('admin.reviews');
                            reviewUrl += `?highlight=${review.id}`;
                        }
                    } catch (e) {
                        if (reviewType === 'institution') {
                            reviewUrl = `/admin/institutions?highlight_review=${review.id}`;
                        } else {
                            reviewUrl = `/admin/reviews?highlight=${review.id}`;
                        }
                    }
                    
                    const targetInfo = review.target_name || review.course_title || 'Unknown';
                    const targetType = review.target_type || 'Course';
                    const stars = '⭐'.repeat(Math.min(review.rating, 5));
                    
                    results.push({
                        id: `review-${review.id}`,
                        title: `Ulasan oleh ${review.user_name}`,
                        description: review.comment,
                        type: 'review',
                        url: reviewUrl,
                        icon: <Star className="h-4 w-4" />,
                        meta: `${stars} ${targetType}: ${targetInfo}`,
                        badge: review.status === 'pending' ? 'Pending' : undefined,
                    });
                });
            }

            // Process transactions
            if (data.transactions && (filter === 'all' || filter === 'transactions')) {
                data.transactions.forEach((transaction: any) => {
                    let transactionUrl;
                    try {
                        transactionUrl = route('admin.transactions.show', { transaction: transaction.id });
                    } catch (e) {
                        try {
                            transactionUrl = route('admin.transactions.index');
                            transactionUrl += `?highlight=${transaction.id}`;
                        } catch (e2) {
                            transactionUrl = `/admin/transactions?highlight=${transaction.id}`;
                        }
                    }
                    
                    const amount = transaction.amount ? `Rp ${new Intl.NumberFormat('id-ID').format(transaction.amount)}` : '';
                    const statusIcon = transaction.status === 'success' ? '✅' : 
                                     transaction.status === 'pending' ? '⏳' : '❌';
                    
                    results.push({
                        id: `transaction-${transaction.id}`,
                        title: `Transaksi #${transaction.id}`,
                        description: `${transaction.user_name} - ${transaction.course_title}`,
                        type: 'transaction',
                        url: transactionUrl,
                        icon: <ShoppingCart className="h-4 w-4" />,
                        meta: `${statusIcon} ${amount}`,
                        badge: transaction.payment_method,
                        highlight: transaction.status === 'pending',
                    });
                });
            }

            // Add matching quick access items
            if (filter === 'all') {
                quickAccess.forEach(item => {
                    const searchLower = query.toLowerCase();
                    if (item.title.toLowerCase().includes(searchLower) || 
                        item.description?.toLowerCase().includes(searchLower)) {
                        results.push(item);
                    }
                });
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Pencarian gagal. Silakan coba lagi.');
            
            // Still show Quick Access matches even if API fails
            if (filter === 'all') {
                const quickMatches = quickAccess.filter(item =>
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.description?.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(quickMatches);
            } else {
                setSearchResults([]);
            }
        } finally {
            setIsSearching(false);
        }
    }, [quickAccess]);

    // Debounced search
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (searchQuery.trim()) {
            searchTimeout.current = setTimeout(() => {
                performSearch(searchQuery, selectedFilter);
            }, 300);
        } else {
            setSearchResults([]);
            setSearchError(null);
        }

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery, selectedFilter, performSearch]);

    const handleSelect = useCallback((result: SearchResult) => {
        if (!result || !result.url) {
            return;
        }
        
        // Save to recent searches
        const cleanResult = {
            id: result.id,
            title: result.title,
            description: result.description,
            type: result.type,
            url: result.url,
            meta: result.meta
        };
        
        const newRecent = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
        setRecentSearches(newRecent);
        
        // Store clean version in localStorage
        const cleanRecentForStorage = newRecent.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type,
            url: r.url,
            meta: r.meta
        }));
        localStorage.setItem('recentSearches', JSON.stringify(cleanRecentForStorage));

        // Clear search and close dialog
        setSearchQuery('');
        setSearchResults([]);
        setSearchError(null);
        
        // Close dialog first
        if (controlledIsOpen !== undefined && onClose) {
            onClose();
        } else {
            setOpen(false);
        }
        
        // Navigate using Inertia
        setTimeout(() => {
            try {
                router.visit(result.url, {
                    preserveState: false,
                    preserveScroll: false,
                    onError: () => {
                        window.location.href = result.url;
                    }
                });
            } catch (error) {
                window.location.href = result.url;
            }
        }, 100);
    }, [controlledIsOpen, onClose, recentSearches]);

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'user':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'course':
                return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'category':
                return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
            case 'chapter':
                return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
            case 'institution':
                return 'bg-pink-500/10 text-pink-600 dark:text-pink-400';
            case 'transaction':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
            case 'material':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
            case 'review':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
            case 'page':
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <>
            {trigger !== undefined ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                controlledIsOpen === undefined && (
                    <Button
                        variant="outline"
                        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                        onClick={() => setOpen(true)}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        <span className="hidden lg:inline-flex">Cari apapun...</span>
                        <span className="inline-flex lg:hidden">Cari...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                )
            )}

            <Dialog open={isOpen} onOpenChange={handleOpen}>
                <DialogContent 
                    className="max-w-3xl p-0 overflow-hidden" 
                    aria-describedby="global-search-description"
                >
                    <VisuallyHidden>
                        <DialogTitle>Pencarian Global Admin</DialogTitle>
                    </VisuallyHidden>
                    <DialogDescription id="global-search-description" className="sr-only">
                        Cari pengguna, kursus, kategori, bab, materi, ulasan, transaksi, dan halaman di seluruh sistem admin
                    </DialogDescription>
                    
                    <div className="flex flex-col">
                        {/* Search Input */}
                        <div className="border-b">
                            <div className="flex items-center px-3">
                                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                                <input
                                    type="text"
                                    placeholder="Cari pengguna, kursus, transaksi, atau apapun..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 py-3 text-sm outline-none placeholder:text-muted-foreground bg-transparent"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchResults([]);
                                            setSearchError(null);
                                        }}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            {/* Filter Pills */}
                            <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto">
                                {searchFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedFilter(filter.id)}
                                        className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                                            selectedFilter === filter.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        {filter.icon}
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {searchError && (
                                <div className="flex items-center gap-2 px-4 py-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {searchError}
                                </div>
                            )}
                            
                            {isSearching ? (
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : searchQuery && searchResults.length === 0 && !searchError ? (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada hasil untuk "{searchQuery}"
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Coba kata kunci lain atau periksa ejaan
                                    </p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-3 pb-1">
                                        <p className="text-xs text-muted-foreground">
                                            {searchResults.length} hasil ditemukan
                                        </p>
                                    </div>
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSelect(result)}
                                            className={cn(
                                                "w-full flex items-start gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left",
                                                result.highlight && "bg-accent/50"
                                            )}
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
                                                {result.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{result.title}</span>
                                                    <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                                                        {result.type}
                                                    </Badge>
                                                    {result.badge && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {result.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                        {result.description}
                                                    </p>
                                                )}
                                                {result.meta && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {result.meta}
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {recentSearches.length > 0 && (
                                        <div className="py-2">
                                            <div className="flex items-center justify-between px-3 pb-1">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Pencarian Terakhir
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearRecentSearches}
                                                    className="h-6 text-xs"
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                            {recentSearches.map((result) => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleSelect(result)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-sm">{result.title}</span>
                                                    </div>
                                                    <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                                                        {result.type}
                                                    </Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="py-2">
                                        <div className="px-3 pb-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Akses Cepat
                                            </p>
                                        </div>
                                        {quickAccess.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{item.title}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="border-t px-3 py-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                                        Select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
                                        Close
                                    </span>
                                </div>
                                <span>
                                    Tip: Gunakan <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd> untuk membuka pencarian
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}