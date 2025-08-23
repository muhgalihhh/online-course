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
    public function index(): Response
    {
        return Inertia::render('admin/transactions/index', [
            'transactions' => Transaction::with(['user', 'transactionable'])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
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

    /**
     * Update status transaksi.
     */
    public function updateStatus(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,cancelled',
        ]);

        $transaction->update($validated);

        return redirect()->route('admin.transactions.index')
            ->with('success', 'Status transaksi berhasil diperbarui.');
    }

    /**
     * Hapus transaksi dari database.
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return redirect()->route('admin.transactions.index')
            ->with('success', 'Transaksi berhasil dihapus.');
    }
}