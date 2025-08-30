import React, { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    ShoppingCart,
    X,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    CreditCard,
    Loader2,
    Trash2,
    Lock,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function CartSidebar() {
    const {
        isOpen,
        setIsOpen,
        cartItems,
        isLoading,
        getTotalAmount,
        getPendingCount,
        loadTransactions,
    } = useCart();
    const { isAuthenticated } = useAuth();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Menunggu Pembayaran
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Berhasil
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Gagal
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Dibatalkan
                    </Badge>
                );
            default:
                return null;
        }
    };

    const handleContinuePayment = (item: any) => {
        // Always navigate to the payment page for the course
        if (item.id) {
            router.visit(`/payments/courses/${item.id}`);
        }
    };

    const handleViewCourse = (courseId: number) => {
        router.visit(`/courses/${courseId}`);
    };

    const handleDeleteClick = (item: any) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete || !itemToDelete.transaction?.midtrans_order_id) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/transactions/${itemToDelete.transaction.midtrans_order_id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                if (result.deleted) {
                    toast.success('Transaksi berhasil dihapus. Anda dapat membuat transaksi baru.');
                } else {
                    toast.success('Transaksi berhasil dibatalkan');
                }
                // Reload transactions to update the list
                await loadTransactions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Gagal membatalkan transaksi');
            }
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            toast.error('Terjadi kesalahan saat membatalkan transaksi');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const pendingItems = cartItems.filter(item => item.status === 'pending');
    const completedItems = cartItems.filter(item => item.status === 'completed');
    const failedItems = cartItems.filter(item => item.status === 'failed' || item.status === 'cancelled' || item.status === 'expired');

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Keranjang Kursus
                        </SheetTitle>
                        <SheetDescription>
                            {!isAuthenticated 
                                ? 'Silakan login untuk melihat keranjang'
                                : cartItems.length > 0
                                    ? `${cartItems.length} kursus dalam keranjang`
                                    : 'Keranjang Anda kosong'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 flex-1">
                        {!isAuthenticated ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">
                                    Anda harus login terlebih dahulu untuk melihat keranjang
                                </p>
                                <Button
                                    variant="default"
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.visit('/login');
                                    }}
                                >
                                    Login Sekarang
                                </Button>
                            </div>
                        ) : isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Belum ada kursus dalam keranjang
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                    setIsOpen(false);
                                    router.visit('/courses');
                                }}
                            >
                                Jelajahi Kursus
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            {/* Pending Transactions */}
                            {pendingItems.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-sm mb-3 text-yellow-700">
                                        Menunggu Pembayaran ({pendingItems.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {pendingItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 p-3 rounded-lg border bg-yellow-50/50 border-yellow-200"
                                            >
                                                {item.thumbnail ? (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="h-16 w-20 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-20 bg-gray-200 rounded flex items-center justify-center">
                                                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-sm font-semibold text-yellow-700">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {getStatusIcon(item.status)}
                                                        <span className="text-xs text-yellow-600">
                                                            Menunggu pembayaran
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="text-xs"
                                                        onClick={() => handleContinuePayment(item)}
                                                    >
                                                        <CreditCard className="h-3 w-3 mr-1" />
                                                        Bayar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="text-xs"
                                                        onClick={() => handleDeleteClick(item)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completed Transactions */}
                            {completedItems.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-sm mb-3 text-green-700">
                                        Pembayaran Berhasil ({completedItems.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {completedItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 p-3 rounded-lg border bg-green-50/50 border-green-200"
                                            >
                                                {item.thumbnail ? (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="h-16 w-20 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-20 bg-gray-200 rounded flex items-center justify-center">
                                                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-sm font-semibold text-green-700">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {getStatusIcon(item.status)}
                                                        <span className="text-xs text-green-600">
                                                            Sudah dibayar
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs"
                                                        onClick={() => handleViewCourse(item.id)}
                                                    >
                                                        Lihat
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed/Cancelled/Expired Transactions */}
                            {failedItems.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-sm mb-3 text-red-700">
                                        Pembayaran Gagal/Expired ({failedItems.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {failedItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 p-3 rounded-lg border bg-red-50/50 border-red-200"
                                            >
                                                {item.thumbnail ? (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="h-16 w-20 object-cover rounded opacity-50"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-20 bg-gray-200 rounded flex items-center justify-center">
                                                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate line-through text-gray-500">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-sm font-semibold text-red-700">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {getStatusIcon(item.status)}
                                                        <span className="text-xs text-red-600">
                                                            {item.status === 'cancelled' ? 'Dibatalkan' : 
                                                             item.status === 'expired' ? 'Expired' : 'Gagal'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs"
                                                        onClick={() => handleContinuePayment(item)}
                                                    >
                                                        Beli Lagi
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>

                {pendingItems.length > 0 && (
                    <SheetFooter className="border-t pt-4">
                        <div className="w-full space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Total Belum Dibayar:
                                </span>
                                <span className="text-lg font-bold text-yellow-700">
                                    {formatPrice(getTotalAmount())}
                                </span>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => loadTransactions()}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memuat...
                                    </>
                                ) : (
                                    'Refresh Status'
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Batalkan Transaksi?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin membatalkan transaksi untuk kursus "{itemToDelete?.title}"? 
                        Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Tidak, Pertahankan
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Membatalkan...
                            </>
                        ) : (
                            'Ya, Batalkan'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}