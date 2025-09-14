<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\Institution;
use Illuminate\Database\Seeder;

class AccommodationSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Pastikan ada institusi
    $institution = Institution::first();

    if (!$institution) {
      $institution = Institution::create([
        'name' => 'Hotel & Kursus Online',
        'phone' => '081234567890',
        'email' => 'info@hotelkursus.com',
        'address' => 'Jl. Pendidikan No. 123, Jakarta',
        'website' => 'https://hotelkursus.com',
      ]);
    }

    $accommodations = [
      [
        'name' => 'Kamar Standard',
        'description' => 'Kamar yang nyaman dengan fasilitas lengkap termasuk AC, TV, Wi-Fi gratis, dan kamar mandi dalam. Cocok untuk peserta kursus yang mencari kenyamanan dengan harga terjangkau.',
        'price_per_night' => 350000,
        'is_active' => true,
      ],
      [
        'name' => 'Kamar Deluxe',
        'description' => 'Kamar yang lebih luas dengan pemandangan yang bagus. Dilengkapi dengan AC, TV LCD 32 inch, Wi-Fi gratis, mini bar, dan balkon kecil. Ideal untuk peserta yang ingin lebih banyak ruang dan kenyamanan.',
        'price_per_night' => 500000,
        'is_active' => true,
      ],
      [
        'name' => 'Suite Executive',
        'description' => 'Kamar suite dengan ruang tamu terpisah, kamar mandi dengan bathtub, dan fasilitas premium lainnya. Termasuk sarapan gratis dan akses ke executive lounge. Perfect untuk peserta VIP atau kursus jangka panjang.',
        'price_per_night' => 750000,
        'is_active' => true,
      ],
      [
        'name' => 'Dormitory Shared',
        'description' => 'Kamar asrama dengan 4 tempat tidur, cocok untuk peserta dengan budget terbatas. Fasilitas bersama termasuk AC, Wi-Fi, dan kamar mandi bersih. Ideal untuk peserta kursus grup atau pelajar.',
        'price_per_night' => 150000,
        'is_active' => true,
      ],
      [
        'name' => 'Family Room',
        'description' => 'Kamar keluarga yang dapat menampung hingga 5 orang dengan 2 tempat tidur queen size dan 1 tempat tidur single. Fasilitas lengkap dengan area bermain anak kecil dan dapur kecil.',
        'price_per_night' => 650000,
        'is_active' => true,
      ],
    ];

    foreach ($accommodations as $accommodation) {
      Accommodation::create($accommodation);
    }
  }
}
