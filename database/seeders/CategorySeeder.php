<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Teknologi Informasi',
                'slug' => 'teknologi-informasi',
                'description' => 'Kategori untuk kursus-kursus yang berkaitan dengan teknologi informasi, programming, web development, dan lainnya.',
            ],
            [
                'name' => 'Bisnis & Manajemen',
                'slug' => 'bisnis-manajemen',
                'description' => 'Kategori untuk kursus-kursus bisnis, entrepreneurship, dan manajemen.',
            ],
            [
                'name' => 'Desain & Kreatif',
                'slug' => 'desain-kreatif',
                'description' => 'Kategori untuk kursus-kursus desain grafis, UI/UX, fotografi, dan kreativitas.',
            ],
            [
                'name' => 'Bahasa',
                'slug' => 'bahasa',
                'description' => 'Kategori untuk kursus-kursus pembelajaran bahasa asing dan lokal.',
            ],
            [
                'name' => 'Marketing & Digital',
                'slug' => 'marketing-digital',
                'description' => 'Kategori untuk kursus-kursus digital marketing, social media, dan strategi pemasaran.',
            ],
            [
                'name' => 'Keuangan & Akuntansi',
                'slug' => 'keuangan-akuntansi',
                'description' => 'Kategori untuk kursus-kursus yang berkaitan dengan keuangan, akuntansi, dan investasi.',
            ],
            [
                'name' => 'Pengembangan Diri',
                'slug' => 'pengembangan-diri',
                'description' => 'Kategori untuk kursus-kursus soft skills, leadership, dan pengembangan personal.',
            ],
            [
                'name' => 'Data & Analytics',
                'slug' => 'data-analytics',
                'description' => 'Kategori untuk kursus-kursus data science, machine learning, dan analisis data.',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
