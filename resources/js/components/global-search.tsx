import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Building2,
    FolderOpen,
    Clock,
    TrendingUp,
    X
} from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    type: 'user' | 'course' | 'transaction' | 'material' | 'chapter' | 'institution' | 'category' | 'page';
    url: string;
    icon?: React.ReactNode;
    meta?: string;
}

interface GlobalSearchProps {
    isOpen?: boolean;
    onClose?: () => void;
    trigger?: React.ReactNode;
}

export function GlobalSearch({ isOpen: controlledIsOpen, onClose, trigger }: GlobalSearchProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout>();

    // Use controlled state if provided
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : open;
    const handleOpen = controlledIsOpen !== undefined ? onClose : () => setOpen(!open);

    // Quick access pages
    const quickAccess: SearchResult[] = [
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
    ];

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Keyboard shortcut to open search (Cmd/Ctrl + K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Search function with API call
    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            // Make API call to search endpoint
            const response = await fetch(route('admin.search'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
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
                        url: route('admin.users.show', { user: user.id }),
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

            // Process materials
            if (data.materials) {
                data.materials.forEach((material: any) => {
                    results.push({
                        id: `material-${material.id}`,
                        title: material.title,
                        description: material.description,
                        type: 'material',
                        url: route('admin.materials.show', { material: material.id }),
                        icon: <FileText className="h-4 w-4" />,
                        meta: material.type,
                    });
                });
            }

            // Process transactions
            if (data.transactions) {
                data.transactions.forEach((transaction: any) => {
                    results.push({
                        id: `transaction-${transaction.id}`,
                        title: `Transaction #${transaction.id}`,
                        description: `${transaction.user_name} - ${transaction.course_title}`,
                        type: 'transaction',
                        url: route('admin.transactions.show', { transaction: transaction.id }),
                        icon: <ShoppingCart className="h-4 w-4" />,
                        meta: transaction.status,
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
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery]);

    const handleSelect = (result: SearchResult) => {
        // Save to recent searches
        const newRecent = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));

        // Navigate to the result
        router.visit(result.url);
        handleOpen?.();
        setSearchQuery('');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'user':
                return 'bg-blue-500/10 text-blue-500';
            case 'course':
                return 'bg-green-500/10 text-green-500';
            case 'transaction':
                return 'bg-purple-500/10 text-purple-500';
            case 'material':
                return 'bg-orange-500/10 text-orange-500';
            case 'page':
                return 'bg-gray-500/10 text-gray-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    variant="outline"
                    className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                    onClick={() => setOpen(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline-flex">Search...</span>
                    <span className="inline-flex lg:hidden">Search...</span>
                    <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={handleOpen}>
                <DialogContent className="max-w-2xl p-0">
                    <Command className="rounded-lg border-0">
                        <CommandInput 
                            placeholder="Search users, courses, transactions..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList className="max-h-[400px] overflow-y-auto p-2">
                            {isSearching ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Searching...
                                </div>
                            ) : searchQuery && searchResults.length === 0 ? (
                                <CommandEmpty className="py-6 text-center text-sm">
                                    No results found for "{searchQuery}"
                                </CommandEmpty>
                            ) : searchResults.length > 0 ? (
                                <CommandGroup heading="Search Results">
                                    {searchResults.map((result) => (
                                        <CommandItem
                                            key={result.id}
                                            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                                            onSelect={() => handleSelect(result)}
                                            onClick={() => handleSelect(result)}
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
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ) : (
                                <>
                                    {recentSearches.length > 0 && (
                                        <>
                                            <CommandGroup heading="Recent">
                                                {recentSearches.map((result) => (
                                                    <CommandItem
                                                        key={result.id}
                                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                                                        onSelect={() => handleSelect(result)}
                                                        onClick={() => handleSelect(result)}
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
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )}
                                    <CommandGroup heading="Quick Access">
                                        {quickAccess.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                                                onSelect={() => handleSelect(item)}
                                                onClick={() => handleSelect(item)}
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium">{item.title}</span>
                                            </CommandItem>
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