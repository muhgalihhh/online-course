import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps, PaginatedData } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, DollarSign } from 'lucide-react';
import { Pagination } from '@/components/pagination';

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
    user: User;
    transactionable: Transactionable;
}

interface TransactionIndexProps extends PageProps {
    transactions: PaginatedData<Transaction>;
}

export default function TransactionIndex({ transactions }: TransactionIndexProps) {
    const { patch } = useForm();

    const handleStatusChange = (transactionId: number, newStatus: string) => {
        patch(route('admin.transactions.update-status', transactionId), {
            data: { status: newStatus },
        });
    };

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
            ]}
        >
            <Head title="Manage Transactions" />

            <div className="">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Daftar Transaksi</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Transaksi</TableHead>
                                    <TableHead>Pengguna</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Metode Pembayaran</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">#{transaction.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{transaction.user.name}</div>
                                                <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{transaction.transactionable.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {transaction.amount.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>{transaction.payment_method}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={transaction.status}
                                                onValueChange={(value) => handleStatusChange(transaction.id, value)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Menunggu</SelectItem>
                                                    <SelectItem value="completed">Selesai</SelectItem>
                                                    <SelectItem value="failed">Gagal</SelectItem>
                                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Link href={route('admin.transactions.show', transaction.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {transactions.links && transactions.links.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={transactions.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}