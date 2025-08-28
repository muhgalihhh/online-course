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
import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';

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
    filters: {
        search: string;
        status: string;
        payment_method: string;
        amount_min: string;
        amount_max: string;
        date_from: string;
        date_to: string;
        sort_by: string;
        sort_order: string;
    };
}

export default function TransactionIndex({ transactions, filters }: TransactionIndexProps) {
    const { patch } = useForm();

    const filterConfig: FilterConfig = {
        search: {
            placeholder: "Search by user name, email, or order ID...",
        },
        select: {
            status: {
                label: "Status",
                options: [
                    { value: "pending", label: "Pending" },
                    { value: "settlement", label: "Settlement" },
                    { value: "capture", label: "Capture" },
                    { value: "expire", label: "Expired" },
                    { value: "cancel", label: "Cancelled" },
                    { value: "deny", label: "Denied" },
                    { value: "failure", label: "Failed" },
                    { value: "refund", label: "Refunded" }
                ],
                placeholder: "All Status"
            },
            payment_method: {
                label: "Payment Method",
                options: [
                    { value: "credit_card", label: "Credit Card" },
                    { value: "bank_transfer", label: "Bank Transfer" },
                    { value: "gopay", label: "GoPay" },
                    { value: "ovo", label: "OVO" },
                    { value: "dana", label: "DANA" }
                ],
                placeholder: "All Payment Methods"
            }
        },
        numberRange: {
            amount: {
                label: "Amount Range",
                min: 0,
                step: 1000
            }
        },
        dateRange: {
            enabled: true,
            label: "Transaction Date"
        },
        sort: {
            enabled: true,
            options: [
                { value: "created_at", label: "Transaction Date" },
                { value: "amount", label: "Amount" },
                { value: "status", label: "Status" }
            ],
            defaultSort: "created_at",
            defaultOrder: "desc"
        }
    };

    const handleStatusChange = (transactionId: number, newStatus: string) => {
        patch(route('admin.transactions.update-status', transactionId), {
            data: { status: newStatus },
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'settlement':
            case 'capture':
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'expire':
            case 'cancel':
            case 'deny':
            case 'failure':
            case 'failed':
                return 'destructive';
            case 'refund':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'settlement':
                return 'Berhasil';
            case 'capture':
                return 'Diproses';
            case 'completed':
                return 'Selesai';
            case 'pending':
                return 'Menunggu';
            case 'expire':
                return 'Kedaluwarsa';
            case 'cancel':
                return 'Dibatalkan';
            case 'deny':
                return 'Ditolak';
            case 'failure':
            case 'failed':
                return 'Gagal';
            case 'refund':
                return 'Dikembalikan';
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

            <div className="space-y-4">
                <AdminFilter 
                    config={filterConfig}
                    filters={filters}
                    route="admin.transactions.index"
                />

                <div className="flex justify-between items-center">
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