@extends('app')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <div class="max-w-md w-full px-6 py-8">
        <div class="text-center">
            <div class="relative">
                <h1 class="text-9xl font-bold text-blue-100">419</h1>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-6xl">⏱️</div>
                </div>
            </div>
            
            <h2 class="mt-8 text-2xl font-semibold text-gray-900">
                Sesi Telah Berakhir
            </h2>
            <p class="mt-4 text-gray-600">
                Sesi Anda telah berakhir karena tidak ada aktivitas. 
                Silakan refresh halaman untuk melanjutkan.
            </p>
            
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button onclick="window.location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    🔄 Refresh Halaman
                </button>
                <a href="/" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    🏠 Ke Beranda
                </a>
            </div>
            
            <div class="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                    💡 Tip: Sesi berakhir otomatis untuk menjaga keamanan akun Anda. 
                    Pastikan untuk logout jika menggunakan komputer publik.
                </p>
            </div>
            
            <div class="mt-8 text-sm text-gray-500">
                <p>Mengalami masalah?</p>
                <a href="mailto:support@example.com" class="text-blue-600 hover:underline">
                    Hubungi Support
                </a>
            </div>
        </div>
    </div>
</div>
@endsection