<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FlipService
{
    public function createBill(User $user, Course $course)
    {
        $secretKey = config('services.flip.secret_key');
        $baseUrl = config('services.flip.base_url');

        // Buat Order ID internal (opsional, untuk tracking di payload)
        // Flip akan generate ID sendiri (link_id/bill_id)
        $internalRef = 'FLIP-' . time() . '-' . $user->id;

        $payload = [
            'title' => 'Course: ' . Str::limit($course->title, 40),
            'amount' => (int) $course->price,
            'type' => 'SINGLE',
            'expired_date' => now()->addDay()->format('Y-m-d H:i'), // Expire 24 jam
            'redirect_url' => route('courses.learn', $course->id), // Redirect setelah sukses
            'is_address_required' => 0,
            'is_phone_number_required' => 0,
            'step' => 3, // Langsung ke halaman pilih metode pembayaran
            'sender_name' => $user->name,
            'sender_email' => $user->email,
        ];

        Log::info('Creating Flip Bill', $payload);

        // API Call ke Flip
        $response = Http::withBasicAuth($secretKey, '')
            ->asForm()
            ->post($baseUrl . '/pwf/bill', $payload);

        if ($response->successful()) {
            $data = $response->json();
            Log::info('Flip Bill Created', ['id' => $data['link_id']]);
            return $data;
        }

        Log::error('Flip API Error', [
            'status' => $response->status(),
            'body' => $response->body()
        ]);

        throw new \Exception('Gagal membuat tagihan pembayaran via Flip.');
    }

    /**
     * Mapping status dari Webhook Flip ke status aplikasi kita
     */
    public function mapStatus(string $flipStatus): string
    {
        return match ($flipStatus) {
            'SUCCESSFUL' => 'completed',
            'PROCESSED' => 'processing', // Sedang diproses bank
            'FAILED' => 'failed',
            'CANCELLED' => 'cancelled', // Flip menggunakan double L biasanya
            default => 'pending',
        };
    }
}
