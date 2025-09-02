<?php

namespace Database\Seeders;

use App\Models\Chapter;
use App\Models\Course;
use Illuminate\Database\Seeder;

class ChapterSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Ambil semua courses
    $courses = Course::all();

    foreach ($courses as $course) {
      $this->createChaptersForCourse($course);
    }
  }

  private function createChaptersForCourse(Course $course)
  {
    $chapterTemplates = [
      'Web Development dengan Laravel' => [
        ['title' => 'Pengenalan Laravel', 'description' => 'Sejarah dan konsep dasar Laravel framework', 'duration' => 45, 'is_free' => true],
        ['title' => 'Installation & Setup', 'description' => 'Cara install dan setup Laravel development environment', 'duration' => 30, 'is_free' => true],
        ['title' => 'Routing & Controllers', 'description' => 'Memahami sistem routing dan controller dalam Laravel', 'duration' => 60, 'is_free' => false],
        ['title' => 'Database & Eloquent ORM', 'description' => 'Bekerja dengan database menggunakan Eloquent ORM', 'duration' => 90, 'is_free' => false],
        ['title' => 'Authentication & Authorization', 'description' => 'Implementasi sistem login dan hak akses', 'duration' => 75, 'is_free' => false],
        ['title' => 'Building RESTful API', 'description' => 'Membuat API dengan Laravel untuk aplikasi modern', 'duration' => 120, 'is_free' => false],
      ],

      'JavaScript ES6+ untuk Pemula' => [
        ['title' => 'JavaScript Fundamentals', 'description' => 'Dasar-dasar JavaScript dan syntax modern', 'duration' => 40, 'is_free' => true],
        ['title' => 'ES6+ Features', 'description' => 'Arrow functions, destructuring, dan template literals', 'duration' => 50, 'is_free' => true],
        ['title' => 'Async JavaScript', 'description' => 'Promises, async/await, dan fetch API', 'duration' => 65, 'is_free' => false],
        ['title' => 'DOM Manipulation', 'description' => 'Mengontrol HTML elements dengan JavaScript', 'duration' => 55, 'is_free' => false],
        ['title' => 'Project: Todo App', 'description' => 'Membuat aplikasi todo list dengan vanilla JavaScript', 'duration' => 90, 'is_free' => false],
      ],

      'React.js Complete Guide' => [
        ['title' => 'React Fundamentals', 'description' => 'Components, JSX, dan props dalam React', 'duration' => 50, 'is_free' => true],
        ['title' => 'State & Lifecycle', 'description' => 'Mengelola state dan lifecycle methods', 'duration' => 60, 'is_free' => false],
        ['title' => 'Hooks & Context', 'description' => 'useState, useEffect, dan Context API', 'duration' => 70, 'is_free' => false],
        ['title' => 'React Router', 'description' => 'Navigasi dan routing dalam aplikasi React', 'duration' => 45, 'is_free' => false],
        ['title' => 'State Management with Redux', 'description' => 'Mengelola state global dengan Redux', 'duration' => 85, 'is_free' => false],
        ['title' => 'Testing React Components', 'description' => 'Unit testing dengan Jest dan React Testing Library', 'duration' => 60, 'is_free' => false],
      ],

      'PHP Dasar untuk Pemula' => [
        ['title' => 'Pengenalan PHP', 'description' => 'Sejarah dan kegunaan PHP dalam web development', 'duration' => 30, 'is_free' => true],
        ['title' => 'Syntax & Variables', 'description' => 'Sintaks dasar PHP dan penggunaan variabel', 'duration' => 40, 'is_free' => true],
        ['title' => 'Control Structures', 'description' => 'If/else, loops, dan switch statements', 'duration' => 45, 'is_free' => true],
        ['title' => 'Functions & Arrays', 'description' => 'Membuat fungsi dan manipulasi array', 'duration' => 50, 'is_free' => false],
        ['title' => 'Working with Forms', 'description' => 'Menangani form HTML dengan PHP', 'duration' => 55, 'is_free' => false],
      ],

      'Digital Business Strategy' => [
        ['title' => 'Digital Transformation Overview', 'description' => 'Memahami transformasi digital dalam bisnis', 'duration' => 45, 'is_free' => true],
        ['title' => 'Customer Journey Mapping', 'description' => 'Analisis perjalanan pelanggan di era digital', 'duration' => 60, 'is_free' => false],
        ['title' => 'Digital Business Models', 'description' => 'Model bisnis digital yang sukses', 'duration' => 70, 'is_free' => false],
        ['title' => 'Technology Integration', 'description' => 'Integrasi teknologi dalam operasional bisnis', 'duration' => 65, 'is_free' => false],
        ['title' => 'Case Studies', 'description' => 'Studi kasus transformasi digital perusahaan', 'duration' => 50, 'is_free' => false],
      ],

      'UI/UX Design Fundamentals' => [
        ['title' => 'Design Thinking Process', 'description' => 'Metodologi design thinking dalam UX', 'duration' => 40, 'is_free' => true],
        ['title' => 'User Research Methods', 'description' => 'Teknik riset pengguna dan analisis kebutuhan', 'duration' => 55, 'is_free' => false],
        ['title' => 'Wireframing & Prototyping', 'description' => 'Membuat wireframe dan prototype interaktif', 'duration' => 70, 'is_free' => false],
        ['title' => 'Visual Design Principles', 'description' => 'Prinsip-prinsip desain visual yang efektif', 'duration' => 60, 'is_free' => false],
        ['title' => 'Usability Testing', 'description' => 'Metode testing dan evaluasi desain', 'duration' => 45, 'is_free' => false],
      ],

      'Digital Marketing Masterclass' => [
        ['title' => 'Digital Marketing Foundation', 'description' => 'Dasar-dasar pemasaran digital modern', 'duration' => 50, 'is_free' => true],
        ['title' => 'SEO & Content Strategy', 'description' => 'Optimasi mesin pencari dan strategi konten', 'duration' => 80, 'is_free' => false],
        ['title' => 'PPC & Paid Advertising', 'description' => 'Google Ads, Facebook Ads, dan platform iklan lainnya', 'duration' => 90, 'is_free' => false],
        ['title' => 'Social Media Marketing', 'description' => 'Strategi pemasaran di berbagai platform media sosial', 'duration' => 70, 'is_free' => false],
        ['title' => 'Email Marketing & Automation', 'description' => 'Campaign email dan marketing automation', 'duration' => 60, 'is_free' => false],
        ['title' => 'Analytics & Reporting', 'description' => 'Mengukur ROI dan analisis performa campaign', 'duration' => 55, 'is_free' => false],
      ],

      'Data Science dengan Python' => [
        ['title' => 'Python for Data Science', 'description' => 'Dasar Python dan library untuk data science', 'duration' => 60, 'is_free' => true],
        ['title' => 'Data Manipulation with Pandas', 'description' => 'Mengolah data menggunakan Pandas library', 'duration' => 75, 'is_free' => false],
        ['title' => 'Data Visualization', 'description' => 'Visualisasi data dengan Matplotlib dan Seaborn', 'duration' => 65, 'is_free' => false],
        ['title' => 'Statistical Analysis', 'description' => 'Analisis statistik untuk data science', 'duration' => 80, 'is_free' => false],
        ['title' => 'Machine Learning Basics', 'description' => 'Algoritma machine learning dengan Scikit-learn', 'duration' => 100, 'is_free' => false],
        ['title' => 'Deep Learning Introduction', 'description' => 'Pengenalan neural networks dan TensorFlow', 'duration' => 90, 'is_free' => false],
      ],
    ];

    // Default chapters untuk course yang tidak ada template khusus
    $defaultChapters = [
      ['title' => 'Pengenalan', 'description' => 'Pengenalan dan overview materi', 'duration' => 30, 'is_free' => true],
      ['title' => 'Dasar-dasar', 'description' => 'Konsep dan teori dasar', 'duration' => 45, 'is_free' => true],
      ['title' => 'Praktik Dasar', 'description' => 'Latihan dan praktik basic', 'duration' => 60, 'is_free' => false],
      ['title' => 'Tingkat Menengah', 'description' => 'Materi intermediate dan studi kasus', 'duration' => 75, 'is_free' => false],
      ['title' => 'Proyek Akhir', 'description' => 'Implementasi project dan evaluasi', 'duration' => 90, 'is_free' => false],
    ];

    $chapters = $chapterTemplates[$course->title] ?? $defaultChapters;

    foreach ($chapters as $index => $chapterData) {
      Chapter::create(array_merge($chapterData, [
        'course_id' => $course->id,
        'order' => $index + 1,
      ]));
    }
  }
}
