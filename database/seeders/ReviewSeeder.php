<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\User;
use App\Models\Institution;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $users = User::where('role', 'user')->get();
    $institution = Institution::first();

    if (!$institution) {
      return;
    }

    $reviewTexts = [
      [
        'rating' => 5,
        'comment' => 'Institusi yang sangat baik! Materi pembelajaran berkualitas tinggi dan instruktur yang berpengalaman. Sangat puas dengan layanan yang diberikan.',
      ],
      [
        'rating' => 5,
        'comment' => 'Excellent service! Pembelajaran yang interaktif dan mudah dipahami. Platform yang user-friendly dan support yang responsif.',
      ],
      [
        'rating' => 4,
        'comment' => 'Overall sangat bagus. Konten materi lengkap dan up-to-date. Hanya saja ada beberapa video yang buffering saat peak hours.',
      ],
      [
        'rating' => 5,
        'comment' => 'Terbaik! Saya sudah mengambil beberapa course di sini dan semuanya berkualitas. Instruktur profesional dan materi selalu update.',
      ],
      [
        'rating' => 4,
        'comment' => 'Kualitas pembelajaran bagus, materi terstruktur dengan baik. Support tim juga helpful. Recommended untuk yang ingin upgrade skill.',
      ],
      [
        'rating' => 5,
        'comment' => 'Sangat puas dengan kualitas course yang ditawarkan. Metode pembelajaran yang efektif dan portfolio project yang menarik.',
      ],
      [
        'rating' => 4,
        'comment' => 'Great learning experience! Materi mudah dipahami, assignment menantang, dan certificate yang diakui industri.',
      ],
      [
        'rating' => 3,
        'comment' => 'Secara umum bagus, tapi ada beberapa materi yang bisa lebih detail. User interface juga bisa diperbaiki lagi.',
      ],
      [
        'rating' => 5,
        'comment' => 'Perfect! Dari segi konten, delivery, dan platform semuanya excellent. Worth every penny yang saya bayar.',
      ],
      [
        'rating' => 4,
        'comment' => 'Kualitas materi bagus dan instruktur berpengalaman. Suka dengan fitur diskusi dan Q&A session yang interaktif.',
      ],
      [
        'rating' => 5,
        'comment' => 'Institusi terpercaya dengan track record yang baik. Pembelajaran praktis dan langsung applicable di dunia kerja.',
      ],
      [
        'rating' => 4,
        'comment' => 'Good value for money. Materi comprehensive dan ada career guidance juga. Sangat membantu untuk career development.',
      ],
    ];

    // Buat review dari sebagian users
    $reviewers = $users->random(min($users->count(), count($reviewTexts)));

    foreach ($reviewers as $index => $user) {
      if (isset($reviewTexts[$index])) {
        Review::create([
          'user_id' => $user->id,
          'institution_id' => $institution->id,
          'rating' => $reviewTexts[$index]['rating'],
          'comment' => $reviewTexts[$index]['comment'],
          'status' => 'approved',
          'created_at' => now()->subDays(rand(1, 90)),
        ]);
      }
    }
  }
}
