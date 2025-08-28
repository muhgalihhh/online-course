@extends('app')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
    <div class="max-w-md w-full px-6 py-8">
        <div class="text-center">
            <div class="relative">
                <h1 class="text-9xl font-bold text-yellow-100">403</h1>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-6xl">🚫</div>
                </div>
            </div>
            
            <h2 class="mt-8 text-2xl font-semibold text-gray-900">
                Akses Ditolak
            </h2>
            <p class="mt-4 text-gray-600">
                Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
                Silakan login dengan akun yang memiliki akses atau hubungi administrator.
            </p>
            
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/login" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    🔑 Login
                </a>
                <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    🏠 Ke Beranda
                </a>
            </div>
            
            <div class="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-sm text-yellow-800">
                    Jika Anda yakin seharusnya memiliki akses ke halaman ini, 
                    silakan hubungi administrator sistem.
                </p>
            </div>
            
            <div class="mt-8 text-sm text-gray-500">
                <a href="mailto:support@example.com" class="text-blue-600 hover:underline">
                    Hubungi Support
                </a>
            </div>
        </div>
    </div>
</div>
@endsection