<?php

namespace Database\Seeders;

use App\Models\CourseReview;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;

class CourseReviewSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Ambil enrollments yang sudah ada untuk memastikan user sudah mengambil course
    $enrollments = Enrollment::with(['user', 'course'])->get();

    $reviewTemplates = [
      [
        'rating' => 5,
        'comments' => [
          'Course yang sangat bagus! Materi terstruktur dengan baik dan mudah dipahami.',
          'Excellent content! Instruktur menjelaskan dengan sangat detail dan clear.',
          'Perfect course untuk pemula. Step by step explanation yang mudah diikuti.',
          'Outstanding! Dapat langsung praktek dan implement di project real.',
          'Materi up-to-date dan sesuai dengan industry standard. Highly recommended!',
        ]
      ],
      [
        'rating' => 4,
        'comments' => [
          'Overall bagus, tapi ada beberapa video yang audio-nya kurang clear.',
          'Konten berkualitas tinggi. Hanya saja pace-nya agak cepat untuk pemula.',
          'Great course! Materi lengkap, assignment challenging, dan support bagus.',
          'Sangat informatif dan praktis. Ada beberapa section yang bisa lebih detail.',
          'Good value for money. Dapat banyak insight dan practical knowledge.',
        ]
      ],
      [
        'rating' => 3,
        'comments' => [
          'Course OK, tapi ada beberapa materi yang outdated dan perlu update.',
          'Decent content tapi delivery bisa lebih engaging dan interaktif.',
          'Materi cukup komprehensif tapi ada gap di beberapa topik advance.',
        ]
      ],
      [
        'rating' => 5,
        'comments' => [
          'Masterpiece! Course terbaik yang pernah saya ambil. Worth every penny.',
          'Incredible learning experience. Dari basic sampai advance dijelaskan dengan baik.',
          'Amazing course! Dapat certificate yang recognized dan portfolio project.',
          'Top-notch quality! Instruktur expert di bidangnya dan sangat helpful.',
        ]
      ],
      [
        'rating' => 4,
        'comments' => [
          'Solid course dengan practical approach. Assignment nya real-world applicable.',
          'Kualitas video bagus, materi terorganisir rapi. Community support juga aktif.',
          'Good progression dari basic ke advance. Bonus material juga valuable.',
        ]
      ]
    ];

    // Buat review untuk sebagian enrollments (sekitar 60% dari total enrollments)
    $enrollmentsToReview = $enrollments->random(min($enrollments->count(), (int) ($enrollments->count() * 0.6)));

    foreach ($enrollmentsToReview as $enrollment) {
      // Hanya buat review untuk enrollment yang sudah ada progress
      if ($enrollment->progress > 20) {
        $templateIndex = array_rand($reviewTemplates);
        $template = $reviewTemplates[$templateIndex];
        $comment = $template['comments'][array_rand($template['comments'])];

        // Rating bias: lebih tinggi untuk course yang progress nya tinggi
        $rating = $template['rating'];
        if ($enrollment->progress > 80) {
          $rating = max($rating, 4); // Minimal rating 4 untuk yang udah hampir selesai
        }

        CourseReview::create([
          'user_id' => $enrollment->user_id,
          'course_id' => $enrollment->course_id,
          'rating' => $rating,
          'comment' => $comment,
          'status' => 'approved',
          'created_at' => $enrollment->enrolled_at->addDays(rand(1, 30)),
        ]);
      }
    }

    // Tambahkan beberapa review khusus untuk course populer
    $popularCourses = Course::whereIn('title', [
      'Web Development dengan Laravel',
      'JavaScript ES6+ untuk Pemula',
      'React.js Complete Guide',
      'Digital Marketing Masterclass',
      'Data Science dengan Python'
    ])->get();

    $users = User::where('role', 'user')->get();

    foreach ($popularCourses as $course) {
      // Tambah 2-3 review lagi untuk course populer
      for ($i = 0; $i < rand(2, 3); $i++) {
        $user = $users->random();

        // Cek apakah user sudah review course ini
        if (!CourseReview::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
          $templateIndex = array_rand($reviewTemplates);
          $template = $reviewTemplates[$templateIndex];
          $comment = $template['comments'][array_rand($template['comments'])];

          CourseReview::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'rating' => $template['rating'],
            'comment' => $comment,
            'status' => 'approved',
            'created_at' => now()->subDays(rand(1, 60)),
          ]);
        }
      }
    }
  }
}
