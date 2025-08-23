import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, DollarSign, User, Calendar, CreditCard } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Transactionable {
    id: number;
    title: string;
}

interface Transaction {
    id: number;
    amount: number;
    status: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
    user: User;
    transactionable: Transactionable;
}

interface TransactionShowProps extends PageProps {
    transaction: Transaction;
}

export default function TransactionShow({ transaction }: TransactionShowProps) {
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            case 'cancelled':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Selesai';
            case 'pending':
                return 'Menunggu';
            case 'failed':
                return 'Gagal';
            case 'cancelled':
                return 'Dibatalkan';
            default:
                return status;
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: route('admin.dashboard') },
                { title: 'Transactions', href: route('admin.transactions.index') },
                { title: 'Detail', href: route('admin.transactions.show', transaction.id) },
            ]}
        >
            <Head title="Transaction Detail" />

            <div className="">
                <div className="flex items-center mb-6">
                    <Link href={route('admin.transactions.index')}>
                        <Button variant="ghost" size="sm" className="mr-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Detail Transaksi #{transaction.id}</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Informasi Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">ID Transaksi:</span>
                                <span className="text-sm">#{transaction.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Jumlah:</span>
                                <span className="text-sm font-bold">Rp {transaction.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Status:</span>
                                <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                    {getStatusLabel(transaction.status)}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Metode Pembayaran:</span>
                                <span className="text-sm">{transaction.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Tanggal Dibuat:</span>
                                <span className="text-sm">{new Date(transaction.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Terakhir Diupdate:</span>
                                <span className="text-sm">{new Date(transaction.updated_at).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Informasi Pengguna
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Nama:</span>
                                <span className="text-sm">{transaction.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Email:</span>
                                <span className="text-sm">{transaction.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">ID Pengguna:</span>
                                <span className="text-sm">#{transaction.user.id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Informasi Item
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Judul Item:</span>
                                <span className="text-sm font-medium">{transaction.transactionable.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">ID Item:</span>
                                <span className="text-sm">#{transaction.transactionable.id}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}