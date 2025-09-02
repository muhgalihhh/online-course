<?php

namespace Database\Seeders;

use App\Models\CourseMaterial;
use App\Models\Chapter;
use Illuminate\Database\Seeder;

class CourseMaterialSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $chapters = Chapter::all();

    foreach ($chapters as $chapter) {
      $this->createMaterialsForChapter($chapter);
    }
  }

  private function createMaterialsForChapter(Chapter $chapter)
  {
    // Template materi berdasarkan course
    $courseTitle = $chapter->course->title;

    $materialTemplates = [
      'Web Development dengan Laravel' => [
        'Pengenalan Laravel' => [
          ['title' => 'Sejarah dan Filosofi Laravel', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Arsitektur MVC dalam Laravel', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Slide Pengenalan Laravel', 'type' => 'document', 'file_path' => 'materials/laravel-intro.pdf', 'is_preview' => false],
        ],
        'Installation & Setup' => [
          ['title' => 'Install PHP dan Composer', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Setup Laravel Project', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Konfigurasi Environment', 'type' => 'document', 'file_path' => 'materials/laravel-config.pdf', 'is_preview' => false],
        ],
        'Routing & Controllers' => [
          ['title' => 'Basic Routing', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Route Parameters', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Creating Controllers', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Resource Controllers', 'type' => 'document', 'file_path' => 'materials/laravel-controllers.pdf', 'is_preview' => false],
        ],
      ],

      'JavaScript ES6+ untuk Pemula' => [
        'JavaScript Fundamentals' => [
          ['title' => 'Variables dan Data Types', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Functions dan Scope', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Latihan JavaScript Dasar', 'type' => 'document', 'file_path' => 'materials/js-basics-exercise.pdf', 'is_preview' => false],
        ],
        'ES6+ Features' => [
          ['title' => 'Arrow Functions', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Destructuring Assignment', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Template Literals', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
        ],
      ],

      'React.js Complete Guide' => [
        'React Fundamentals' => [
          ['title' => 'Apa itu React?', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'JSX Syntax', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Components dan Props', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
        ],
        'State & Lifecycle' => [
          ['title' => 'Class Components vs Functional', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'State Management', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Lifecycle Methods', 'type' => 'document', 'file_path' => 'materials/react-lifecycle.pdf', 'is_preview' => false],
        ],
      ],

      'Digital Marketing Masterclass' => [
        'Digital Marketing Foundation' => [
          ['title' => 'Evolution of Digital Marketing', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Digital Marketing Channels', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Creating Marketing Strategy', 'type' => 'document', 'file_path' => 'materials/digital-marketing-strategy.pdf', 'is_preview' => false],
        ],
        'SEO & Content Strategy' => [
          ['title' => 'On-Page SEO Techniques', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Keyword Research', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Content Calendar Template', 'type' => 'document', 'file_path' => 'materials/content-calendar.pdf', 'is_preview' => false],
        ],
      ],

      'Data Science dengan Python' => [
        'Python for Data Science' => [
          ['title' => 'Python Environment Setup', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'NumPy Fundamentals', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => true],
          ['title' => 'Python Data Science Cheatsheet', 'type' => 'document', 'file_path' => 'materials/python-ds-cheatsheet.pdf', 'is_preview' => false],
        ],
        'Data Manipulation with Pandas' => [
          ['title' => 'Pandas DataFrame Basics', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Data Cleaning Techniques', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => false],
          ['title' => 'Pandas Exercise Dataset', 'type' => 'document', 'file_path' => 'materials/pandas-exercises.csv', 'is_preview' => false],
        ],
      ],
    ];

    // Default materials untuk chapter yang tidak ada template khusus
    $defaultMaterials = [
      ['title' => 'Video Pembelajaran', 'type' => 'video', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'is_preview' => $chapter->is_free],
      ['title' => 'Materi Pendukung', 'type' => 'document', 'file_path' => 'materials/default-material.pdf', 'is_preview' => false],
      ['title' => 'Latihan Soal', 'type' => 'quiz', 'file_path' => 'materials/quiz.pdf', 'is_preview' => false],
    ];

    $materials = $materialTemplates[$courseTitle][$chapter->title] ?? $defaultMaterials;

    foreach ($materials as $index => $materialData) {
      CourseMaterial::create(array_merge($materialData, [
        'chapter_id' => $chapter->id,
        'order' => $index + 1,
      ]));
    }
  }
}
