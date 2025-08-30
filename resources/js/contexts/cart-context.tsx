import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Transaction {
    id: number;
    midtrans_order_id: string;
    amount: number;
    status: string;
    payment_method?: string;
    created_at: string;
    course?: {
        id: number;
        title: string;
        price: number;
        thumbnail: string | null;
    };
}

interface CartItem {
    id: number;
    title: string;
    price: number;
    thumbnail: string | null;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';
    transaction?: Transaction;
}

interface CartContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    cartItems: CartItem[];
    transactions: Transaction[];
    loadTransactions: () => Promise<void>;
    isLoading: boolean;
    toggleCart: () => void;
    clearCart: () => void;
    getTotalAmount: () => number;
    getPendingCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadTransactions = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/transactions', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Raw transactions data:', data); // Debug log
                setTransactions(data);

                // Convert transactions to cart items
                const items: CartItem[] = data
                    .filter((t: Transaction) => {
                        const hasEligibleCourse = t.course && t.course.id;
                        console.log('Transaction filter check:', {
                            id: t.id,
                            status: t.status,
                            hasCourse: !!t.course,
                            hasEligibleCourse,
                        }); // Debug log
                        return hasEligibleCourse;
                    })
                    .map((t: Transaction) => {
                        // Map expired status to failed for display
                        let displayStatus = t.status as CartItem['status'];
                        if (displayStatus === 'expired') {
                            displayStatus = 'failed';
                        }

                        const cartItem = {
                            id: t.course!.id,
                            title: t.course!.title,
                            price: t.course!.price,
                            thumbnail: t.course!.thumbnail,
                            status: displayStatus,
                            transaction: t,
                        };

                        console.log('Created cart item:', cartItem); // Debug log
                        return cartItem;
                    });

                console.log('Final cart items:', items); // Debug log
                setCartItems(items);
            } else {
                console.error('API response not ok:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Load transactions when component mounts
        loadTransactions();
    }, []);

    const toggleCart = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Reload transactions when opening cart
            loadTransactions();
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalAmount = () => {
        return cartItems.filter((item) => item.status === 'pending').reduce((total, item) => total + item.price, 0);
    };

    const getPendingCount = () => {
        return cartItems.filter((item) => item.status === 'pending').length;
    };

    const value: CartContextType = {
        isOpen,
        setIsOpen,
        cartItems,
        transactions,
        loadTransactions,
        isLoading,
        toggleCart,
        clearCart,
        getTotalAmount,
        getPendingCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
