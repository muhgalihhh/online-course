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
    X
} from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    type: 'user' | 'course' | 'transaction' | 'material' | 'chapter' | 'institution' | 'category' | 'review' | 'page';
    url: string;
    icon?: React.ReactNode;
    meta?: string;
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
            // onSelect receives a string value, not an event
            // We just call our onItemClick directly
            onItemClick();
        };

        return (
            <CommandItem
                ref={ref}
                className={className}
                value={value}
                onSelect={handleSelect}
                onClick={handleClick}
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
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
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Use controlled state if provided
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : open;
    const handleOpen = controlledIsOpen !== undefined ? onClose : () => setOpen(!open);

    // Quick access pages - memoized to prevent recreation
    const quickAccess: SearchResult[] = useMemo(() => [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'page',
            url: route('admin.dashboard'),
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            id: 'users',
            title: 'Users',
            type: 'page',
            url: route('admin.users.index'),
            icon: <Users className="h-4 w-4" />,
        },
        {
            id: 'courses',
            title: 'Courses',
            type: 'page',
            url: route('admin.courses.index'),
            icon: <BookOpen className="h-4 w-4" />,
        },
        {
            id: 'transactions',
            title: 'Transactions',
            type: 'page',
            url: route('admin.transactions.index'),
            icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
            id: 'settings',
            title: 'Settings',
            type: 'page',
            url: route('admin.settings'),
            icon: <Settings className="h-4 w-4" />,
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
            const parsed = JSON.parse(saved);
            // Restore icons for saved searches
            const withIcons = parsed.map((item: any) => ({
                ...item,
                icon: getIconForType(item.type)
            }));
            setRecentSearches(withIcons);
        }
    }, []);

    // Keyboard shortcut to open search (Cmd/Ctrl + K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                
                // Handle both controlled and uncontrolled state
                if (controlledIsOpen !== undefined && onClose) {
                    // For controlled state (mobile), only open if currently closed
                    if (!controlledIsOpen) {
                        // Since this is controlled, we can't directly set it open
                        // The parent component should handle this shortcut
                        // Keyboard shortcut triggered, but this is controlled by parent
                    } else {
                        onClose();
                    }
                } else {
                    // For uncontrolled state (desktop)
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
            // Prefer Ziggy route if available
            return route('admin.search');
        } catch (e) {
            // Fallback to hardcoded path if Ziggy route is missing
            return '/admin/search';
        }
    };

    // Search function with API call
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                // CSRF token not found
                throw new Error('CSRF token not found');
            }

            // Make API call to search endpoint
            const response = await fetch(getAdminSearchUrl(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                // Search API error
                throw new Error(`Search failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform API results to SearchResult format
            const results: SearchResult[] = [];

            // Process users
            if (data.users) {
                data.users.forEach((user: any) => {
                    results.push({
                        id: `user-${user.id}`,
                        title: user.name,
                        description: user.email,
                        type: 'user',
                        url: route('admin.users.edit', { user: user.id }),
                        icon: <Users className="h-4 w-4" />,
                        meta: user.role,
                    });
                });
            }

            // Process courses
            if (data.courses) {
                data.courses.forEach((course: any) => {
                    results.push({
                        id: `course-${course.id}`,
                        title: course.title,
                        description: course.description,
                        type: 'course',
                        url: route('admin.courses.show', { course: course.id }),
                        icon: <BookOpen className="h-4 w-4" />,
                        meta: `${course.students_count || 0} students`,
                    });
                });
            }

            // Process categories
            if (data.categories) {
                data.categories.forEach((category: any) => {
                    results.push({
                        id: `category-${category.id}`,
                        title: category.name,
                        description: category.description,
                        type: 'category',
                        url: route('admin.categories.edit', { category: category.id }),
                        icon: <FolderOpen className="h-4 w-4" />,
                        meta: `${category.courses_count || 0} courses`,
                    });
                });
            }

            // Process chapters
            if (data.chapters) {
                data.chapters.forEach((chapter: any) => {
                    // Build proper URL for chapter edit
                    let chapterUrl;
                    try {
                        chapterUrl = route('admin.chapters.edit', { chapter: chapter.id });
                    } catch (e) {
                        // Fallback URL if route is not available
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
                    });
                });
            }

            // Process institutions
            if (data.institutions) {
                data.institutions.forEach((institution: any) => {
                    results.push({
                        id: `institution-${institution.id}`,
                        title: institution.name,
                        description: institution.description,
                        type: 'institution',
                        url: route('admin.institutions.edit'),
                        icon: <Building2 className="h-4 w-4" />,
                        meta: institution.address,
                    });
                });
            }

            // Process course materials
            if (data.course_materials) {
                data.course_materials.forEach((material: any) => {
                    // Build proper URL for material
                    let materialUrl;
                    try {
                        materialUrl = route('admin.materials.show', { material: material.id });
                    } catch (e) {
                        try {
                            // Try edit route as fallback
                            materialUrl = route('admin.materials.edit', { material: material.id });
                        } catch (e2) {
                            // Final fallback
                            materialUrl = `/admin/materials/${material.id}`;
                        }
                    }
                    
                    results.push({
                        id: `material-${material.id}`,
                        title: material.title,
                        description: material.chapter_title ? `Chapter: ${material.chapter_title}` : '',
                        type: 'material',
                        url: materialUrl,
                        icon: <FileText className="h-4 w-4" />,
                        meta: `${material.type}${material.chapter_title ? ` - ${material.chapter_title}` : ''}`,
                    });
                });
            }

            // Process reviews (both institution and course reviews)
            if (data.reviews) {
                data.reviews.forEach((review: any) => {
                    // Determine the appropriate URL based on review type
                    let reviewUrl;
                    const reviewType = review.type || 'course'; // Default to course if type not specified
                    
                    try {
                        if (reviewType === 'institution') {
                            reviewUrl = route('admin.institutions.index');
                            reviewUrl += `?highlight_review=${review.id}`;
                        } else {
                            // Course reviews
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
                    
                    results.push({
                        id: `review-${review.id}`,
                        title: `Review by ${review.user_name}`,
                        description: review.comment,
                        type: 'review',
                        url: reviewUrl,
                        icon: <Star className="h-4 w-4" />,
                        meta: `${review.rating}/5 - ${targetType}: ${targetInfo}${review.status ? ` (${review.status})` : ''}`,
                    });
                });
            }

            // Process transactions
            if (data.transactions) {
                data.transactions.forEach((transaction: any) => {
                    // Build proper URL for transaction
                    let transactionUrl;
                    try {
                        transactionUrl = route('admin.transactions.show', { transaction: transaction.id });
                    } catch (e) {
                        // Fallback to index with highlight
                        try {
                            transactionUrl = route('admin.transactions.index');
                            transactionUrl += `?highlight=${transaction.id}`;
                        } catch (e2) {
                            transactionUrl = `/admin/transactions?highlight=${transaction.id}`;
                        }
                    }
                    
                    const amount = transaction.amount ? `Rp ${new Intl.NumberFormat('id-ID').format(transaction.amount)}` : '';
                    const paymentMethod = transaction.payment_method ? ` - ${transaction.payment_method}` : '';
                    
                    results.push({
                        id: `transaction-${transaction.id}`,
                        title: `Transaction #${transaction.id}`,
                        description: `${transaction.user_name} - ${transaction.course_title}`,
                        type: 'transaction',
                        url: transactionUrl,
                        icon: <ShoppingCart className="h-4 w-4" />,
                        meta: `${transaction.status}${amount}${paymentMethod}`,
                    });
                });
            }

            // Add matching quick access items
            quickAccess.forEach(item => {
                if (item.title.toLowerCase().includes(query.toLowerCase())) {
                    results.push(item);
                }
            });

            setSearchResults(results);
        } catch (error) {
            // Search error
            // Still show Quick Access matches even if API fails
            const quickMatches = quickAccess.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(quickMatches);
            
            // Show user-friendly error message
            if (error instanceof Error) {
                if (error.message.includes('CSRF')) {
                    // CSRF token issue. Please refresh the page.
                } else if (error.message.includes('404')) {
                    // Search endpoint not found. Please check the route.
                } else {
                    // Search failed. Please try again.
                }
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
                performSearch(searchQuery);
            }, 300);
        } else {
            setSearchResults([]);
        }

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery]);

    const handleSelect = useCallback((result: SearchResult) => {
        // Prevent multiple calls
        if (!result || !result.url) {
            return;
        }
        
        // Save to recent searches - create a clean version without React nodes
        const cleanResult = {
            id: result.id,
            title: result.title,
            description: result.description,
            type: result.type,
            url: result.url,
            meta: result.meta
            // Intentionally omitting icon as it contains React nodes that can't be serialized
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

        // Clear search and close dialog immediately for better UX
        setSearchQuery('');
        setSearchResults([]);
        
        // Close dialog first
        if (controlledIsOpen !== undefined && onClose) {
            onClose();
        } else {
            setOpen(false);
        }
        
        // Navigate using Inertia after dialog is closed
        // Small timeout to ensure dialog close animation doesn't interfere
        setTimeout(() => {
            try {
                router.visit(result.url, {
                    preserveState: false,
                    preserveScroll: false,
                    onError: () => {
                        // Fallback: try direct window navigation
                        window.location.href = result.url;
                    }
                });
            } catch (error) {
                // Fallback: try direct window navigation
                window.location.href = result.url;
            }
        }, 100);
    }, [controlledIsOpen, onClose, recentSearches]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'user':
                return 'bg-blue-500/10 text-blue-500';
            case 'course':
                return 'bg-green-500/10 text-green-500';
            case 'category':
                return 'bg-indigo-500/10 text-indigo-500';
            case 'chapter':
                return 'bg-teal-500/10 text-teal-500';
            case 'institution':
                return 'bg-pink-500/10 text-pink-500';
            case 'transaction':
                return 'bg-purple-500/10 text-purple-500';
            case 'material':
                return 'bg-orange-500/10 text-orange-500';
            case 'review':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'page':
                return 'bg-gray-500/10 text-gray-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
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
                        <span className="hidden lg:inline-flex">Cari...</span>
                        <span className="inline-flex lg:hidden">Cari...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                )
            )}

            <Dialog open={isOpen} onOpenChange={handleOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden" aria-describedby="global-search-description">
                    <VisuallyHidden>
                        <DialogTitle>Pencarian Global</DialogTitle>
                    </VisuallyHidden>
                    <DialogDescription id="global-search-description" className="sr-only">
                        Cari pengguna, kursus, kategori, bab, materi, ulasan, dan transaksi di seluruh sistem
                    </DialogDescription>
                    <Command className="rounded-lg border-0" shouldFilter={false}>
                        <CommandInput 
                            placeholder="Cari pengguna, kursus, kategori, bab, materi, ulasan, transaksi..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            autoFocus
                        />
                        <CommandList className="max-h-[400px] overflow-y-auto p-2">
                            {isSearching ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Mencari...
                                </div>
                            ) : searchQuery && searchResults.length === 0 ? (
                                <CommandEmpty className="py-6 text-center text-sm">
                                    Tidak ada hasil untuk "{searchQuery}"
                                </CommandEmpty>
                            ) : searchResults.length > 0 ? (
                                <CommandGroup heading="Hasil Pencarian">
                                    {searchResults.map((result) => (
                                        <ClickableCommandItem
                                            key={result.id}
                                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors data-[selected]:bg-accent data-[selected]:text-accent-foreground"
                                            value={result.title}
                                            onItemClick={() => handleSelect(result)}
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                {result.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{result.title}</span>
                                                    <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                                                        {result.type}
                                                    </Badge>
                                                    {result.meta && (
                                                        <span className="text-xs text-muted-foreground">{result.meta}</span>
                                                    )}
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-muted-foreground">{result.description}</p>
                                                )}
                                            </div>
                                        </ClickableCommandItem>
                                    ))}
                                </CommandGroup>
                            ) : (
                                <>
                                    {recentSearches.length > 0 && (
                                        <>
                                            <CommandGroup heading="Pencarian Terakhir">
                                                {recentSearches.map((result) => (
                                                    <ClickableCommandItem
                                                        key={result.id}
                                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors data-[selected]:bg-accent data-[selected]:text-accent-foreground"
                                                        value={result.title}
                                                        onItemClick={() => handleSelect(result)}
                                                    >
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                            <Clock className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{result.title}</span>
                                                                <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                                                                    {result.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </ClickableCommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )}
                                    <CommandGroup heading="Akses Cepat">
                                        {quickAccess.map((item) => (
                                            <ClickableCommandItem
                                                key={item.id}
                                                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors data-[selected]:bg-accent data-[selected]:text-accent-foreground"
                                                value={item.title}
                                                onItemClick={() => handleSelect(item)}
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium">{item.title}</span>
                                            </ClickableCommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}