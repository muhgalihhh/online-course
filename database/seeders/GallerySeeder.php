<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $galleries = [
      [
        'title' => 'Suasana Belajar di Kelas',
        'description' => 'Siswa sedang aktif mengikuti pembelajaran di kelas dengan suasana yang kondusif dan interaktif.',
        'file_path' => 'gallery/learning-environment.jpg',
        'file_type' => 'image',
        'is_active' => true,
      ],
      [
        'title' => 'Praktik Bahasa Inggris',
        'description' => 'Kegiatan praktik speaking bahasa Inggris dengan metode yang menyenangkan dan efektif.',
        'file_path' => 'gallery/english-practice.jpg',
        'file_type' => 'image',
        'is_active' => true,
      ],
      [
        'title' => 'Fasilitas Modern',
        'description' => 'Fasilitas pembelajaran yang modern dan lengkap untuk mendukung proses belajar mengajar.',
        'file_path' => 'gallery/modern-facility.jpg',
        'file_type' => 'image',
        'is_active' => true,
      ],
      [
        'title' => 'Video Pembelajaran Interaktif',
        'description' => 'Video pembelajaran yang dibuat khusus untuk membantu pemahaman materi dengan lebih mudah.',
        'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'file_type' => 'video',
        'video_source' => 'youtube',
        'is_active' => true,
      ],
      [
        'title' => 'Aktivitas Outdoor Learning',
        'description' => 'Kegiatan pembelajaran di luar ruangan untuk memberikan pengalaman belajar yang berbeda.',
        'file_path' => 'gallery/outdoor-learning.jpg',
        'file_type' => 'image',
        'is_active' => true,
      ],
      [
        'title' => 'Wisuda dan Sertifikasi',
        'description' => 'Momen bahagia saat siswa menyelesaikan program dan menerima sertifikat kelulusan.',
        'file_path' => 'gallery/graduation.jpg',
        'file_type' => 'image',
        'is_active' => true,
      ],
    ];

    foreach ($galleries as $gallery) {
      Gallery::create($gallery);
    }
  }
}
