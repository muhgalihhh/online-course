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
     * Update status transaksi dan handle enrollment otomatis.
     */
    public function updateStatus(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,cancelled',
        ]);

        $oldStatus = $transaction->status;
        $transaction->update($validated);

        // Jika status berubah menjadi completed dan transaksinya untuk course
        if ($validated['status'] === 'completed' && $oldStatus !== 'completed') {
            if ($transaction->transactionable_type === 'App\\Models\\Course') {
                $user = $transaction->user;
                $course = $transaction->transactionable;
                
                // Pastikan user belum terdaftar di kursus
                if ($user && $course && !$user->courses()->where('course_id', $course->id)->exists()) {
                    $user->courses()->attach($course->id, ['created_at' => now(), 'updated_at' => now()]);
                }
            }
        }

        return redirect()->route('admin.transactions.show', $transaction)
            ->with('success', 'Status transaksi berhasil diperbarui.');
    }
}