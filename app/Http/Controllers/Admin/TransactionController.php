<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Menampilkan daftar semua transaksi dengan paginasi.
     */
    public function index(Request $request): Response
    {
        $query = Transaction::with(['user', 'transactionable']);

        // Filter by search (user name, email, order id, flip bill id)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('midtrans_order_id', 'like', "%{$search}%")
                    ->orWhere('flip_bill_id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by payment gateway
        if ($request->filled('gateway')) {
            $query->where('payment_gateway', $request->get('gateway'));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->get('payment_method'));
        }

        // Filter by amount range
        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->get('amount_min'));
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->get('amount_max'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $transactions = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'payment_method', 'amount_min', 'amount_max', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Tampilkan detail transaksi.
     */
    public function show(Transaction $transaction): Response
    {
        return Inertia::render('admin/transactions/show', [
            'transaction' => $transaction->load(['user', 'transactionable']),
        ]);
    }
}
