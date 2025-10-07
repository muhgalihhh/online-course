<?php

// Lokasi folder storage asli Anda
$target = __DIR__ . '/storage/app/public';

// Lokasi link yang akan dibuat di dalam folder public
// Ganti 'public' dengan 'public_html' jika nama folder Anda berbeda
$link = __DIR__ . '/public/storage';

// Periksa apakah link sudah ada
if (file_exists($link)) {
    echo "Symbolic link sudah ada!";
} else {
    // Coba buat symbolic link
    if (symlink($target, $link)) {
        echo "Symbolic link berhasil dibuat!";
    } else {
        echo "Gagal membuat symbolic link. Periksa kembali path dan perizinan folder.";
    }
}

?>

