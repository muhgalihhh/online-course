@extends('app')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
    <div class="max-w-md w-full px-6 py-8">
        <div class="text-center">
            <div class="relative">
                <h1 class="text-9xl font-bold text-purple-100">503</h1>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-6xl">🔧</div>
                </div>
            </div>
            
            <h2 class="mt-8 text-2xl font-semibold text-gray-900">
                Sedang Dalam Pemeliharaan
            </h2>
            <p class="mt-4 text-gray-600">
                Kami sedang melakukan pemeliharaan sistem untuk memberikan layanan yang lebih baik. 
                Silakan coba lagi dalam beberapa saat.
            </p>
            
            <div class="mt-6 p-3 bg-purple-100 rounded-lg">
                <p class="text-sm text-purple-800">
                    Sistem akan kembali normal dalam beberapa saat...
                </p>
            </div>
            
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button onclick="window.location.reload()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    🔄 Coba Sekarang
                </button>
                <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    🏠 Ke Beranda
                </a>
            </div>
            
            <div class="mt-12 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div class="flex items-center justify-center mb-2">
                    <span class="text-2xl">🔔</span>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2">
                    Apa yang sedang kami lakukan?
                </h3>
                <ul class="text-xs text-gray-600 space-y-1 text-left">
                    <li>• Meningkatkan performa sistem</li>
                    <li>• Menambahkan fitur baru</li>
                    <li>• Memperbaiki bug yang dilaporkan</li>
                    <li>• Meningkatkan keamanan</li>
                </ul>
            </div>
            
            <div class="mt-8 text-sm text-gray-500">
                <p>Ikuti update kami di</p>
                <div class="flex justify-center gap-4 mt-2">
                    <a href="#" class="text-blue-600 hover:underline">Twitter</a>
                    <span>•</span>
                    <a href="mailto:support@example.com" class="text-blue-600 hover:underline">Email</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Auto refresh setiap 30 detik
    setTimeout(function() {
        window.location.reload();
    }, 30000);
</script>
@endsection