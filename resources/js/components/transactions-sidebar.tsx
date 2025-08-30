import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/utils';
import { type Transaction } from '@/types';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Clock, CreditCard, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TransactionsSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
}

export function TransactionsSidebar({ open, onOpenChange, userId }: TransactionsSidebarProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

    useEffect(() => {
        if (open) {
            fetchTransactions();
        }
    }, [open]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(route('api.transactions'), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            setTransactions(data);
        } catch (error: any) {
            toast.error('Gagal memuat transaksi');
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Berhasil
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="mr-1 h-3 w-3" />
                        Menunggu
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Diproses
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <XCircle className="mr-1 h-3 w-3" />
                        Gagal
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Dibatalkan
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {status}
                    </Badge>
                );
        }
    };

    const handleTransactionClick = (transaction: Transaction) => {
        // Close sidebar
        onOpenChange(false);
        
        // Navigate to payment page for the course
        if (transaction.transactionable_type === 'App\\Models\\Course' || transaction.transactionable_type === 'Course') {
            router.visit(route('payments.show', transaction.transactionable_id));
        } else {
            // For other transaction types, go to transaction detail
            router.visit(route('transactions.show', transaction.midtrans_order_id));
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true;
        if (filter === 'pending') return transaction.status === 'pending' || transaction.status === 'processing';
        return transaction.status === filter;
    });

    const getPaymentMethodIcon = (method: string | null) => {
        if (!method) return <CreditCard className="h-4 w-4" />;
        
        // You can customize icons based on payment method
        return <CreditCard className="h-4 w-4" />;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Riwayat Transaksi</SheetTitle>
                    <SheetDescription>
                        Daftar transaksi pembayaran kursus Anda
                    </SheetDescription>
                </SheetHeader>

                {/* Filter Buttons */}
                <div className="flex gap-2 mt-6 mb-4">
                    <Button
                        size="sm"
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                    >
                        Semua
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setFilter('pending')}
                    >
                        Menunggu
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        onClick={() => setFilter('completed')}
                    >
                        Berhasil
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'failed' ? 'default' : 'outline'}
                        onClick={() => setFilter('failed')}
                    >
                        Gagal
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600">
                                {filter === 'all' 
                                    ? 'Belum ada transaksi'
                                    : `Tidak ada transaksi ${filter === 'pending' ? 'yang menunggu' : filter === 'completed' ? 'yang berhasil' : 'yang gagal'}`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleTransactionClick(transaction)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm line-clamp-1">
                                                {transaction.course?.title || 'Pembayaran Kursus'}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Order ID: {transaction.midtrans_order_id}
                                            </p>
                                        </div>
                                        {getStatusBadge(transaction.status)}
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            {getPaymentMethodIcon(transaction.payment_method)}
                                            <span>
                                                {transaction.payment_method 
                                                    ? transaction.payment_method.replace(/_/g, ' ').toUpperCase()
                                                    : 'Menunggu pembayaran'
                                                }
                                            </span>
                                        </div>
                                        <p className="font-semibold text-sm">
                                            {formatRupiah(transaction.amount)}
                                        </p>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 mt-2">
                                        {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Summary */}
                {!isLoading && transactions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Transaksi:</span>
                            <span className="font-medium">{transactions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Berhasil:</span>
                            <span className="font-medium text-green-600">
                                {transactions.filter(t => t.status === 'completed').length}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Menunggu:</span>
                            <span className="font-medium text-yellow-600">
                                {transactions.filter(t => t.status === 'pending' || t.status === 'processing').length}
                            </span>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}