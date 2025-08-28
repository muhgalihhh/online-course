@extends('app')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
    <div class="max-w-md w-full px-6 py-8">
        <div class="text-center">
            <div class="relative">
                <h1 class="text-9xl font-bold text-red-100">500</h1>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-6xl">⚠️</div>
                </div>
            </div>
            
            <h2 class="mt-8 text-2xl font-semibold text-gray-900">
                Terjadi Kesalahan Server
            </h2>
            <p class="mt-4 text-gray-600">
                Maaf, terjadi kesalahan pada server kami. 
                Tim teknis kami telah diberitahu dan sedang menangani masalah ini.
            </p>
            
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button onclick="window.location.reload()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    🔄 Coba Lagi
                </button>
                <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    🏠 Ke Beranda
                </a>
            </div>
            
            <div class="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                <p class="text-xs font-mono text-gray-500">
                    Error Code: 500<br/>
                    Time: {{ now()->format('d/m/Y H:i:s') }}
                </p>
            </div>
            
            <div class="mt-8 text-sm text-gray-500">
                <p>Jika masalah berlanjut, silakan</p>
                <a href="mailto:support@example.com" class="text-blue-600 hover:underline">
                    Hubungi Support
                </a>
            </div>
        </div>
    </div>
</div>
@endsection