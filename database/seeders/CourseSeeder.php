<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Category;
use App\Models\Institution;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $institution = Institution::first();

        $courses = [
            // Teknologi Informasi (category_id: 1)
            [
                'title' => 'Web Development dengan Laravel',
                'description' => 'Pelajari framework Laravel dari dasar hingga advanced untuk membangun aplikasi web modern.',
                'price' => 299000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 1,
            ],
            [
                'title' => 'JavaScript ES6+ untuk Pemula',
                'description' => 'Kuasai JavaScript modern dengan fitur-fitur ES6+ untuk development front-end yang efektif.',
                'price' => 199000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 1,
            ],
            [
                'title' => 'React.js Complete Guide',
                'description' => 'Panduan lengkap React.js dari konsep dasar hingga state management dengan Redux.',
                'price' => 349000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 1,
            ],
            [
                'title' => 'PHP Dasar untuk Pemula',
                'description' => 'Belajar PHP dari nol hingga mampu membuat aplikasi web dinamis.',
                'price' => 0,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 1,
            ],

            // Bisnis & Manajemen (category_id: 2)
            [
                'title' => 'Digital Business Strategy',
                'description' => 'Strategi bisnis digital untuk era modern dan transformasi digital perusahaan.',
                'price' => 399000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 2,
            ],
            [
                'title' => 'Manajemen Proyek Agile',
                'description' => 'Metodologi Agile dan Scrum untuk manajemen proyek yang efektif.',
                'price' => 279000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 2,
            ],
            [
                'title' => 'Entrepreneurship 101',
                'description' => 'Dasar-dasar kewirausahaan dan cara memulai bisnis dari nol.',
                'price' => 0,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 2,
            ],

            // Desain & Kreatif (category_id: 3)
            [
                'title' => 'UI/UX Design Fundamentals',
                'description' => 'Prinsip-prinsip dasar desain UI/UX untuk aplikasi mobile dan web.',
                'price' => 329000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 3,
            ],
            [
                'title' => 'Adobe Illustrator untuk Desain Logo',
                'description' => 'Belajar membuat logo profesional menggunakan Adobe Illustrator.',
                'price' => 249000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 3,
            ],
            [
                'title' => 'Figma untuk Prototyping',
                'description' => 'Menggunakan Figma untuk membuat prototype dan wireframe yang interaktif.',
                'price' => 0,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 3,
            ],

            // Bahasa (category_id: 4)
            [
                'title' => 'English for Business Communication',
                'description' => 'Bahasa Inggris praktis untuk komunikasi bisnis dan presentasi.',
                'price' => 199000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 4,
            ],
            [
                'title' => 'Mandarin untuk Pemula',
                'description' => 'Belajar bahasa Mandarin dari dasar dengan metode yang mudah dipahami.',
                'price' => 299000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 4,
            ],

            // Marketing & Digital (category_id: 5)
            [
                'title' => 'Digital Marketing Masterclass',
                'description' => 'Strategi digital marketing lengkap meliputi SEO, SEM, social media, dan content marketing.',
                'price' => 449000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 5,
            ],
            [
                'title' => 'Social Media Marketing',
                'description' => 'Cara memanfaatkan media sosial untuk marketing yang efektif.',
                'price' => 179000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 5,
            ],
            [
                'title' => 'Google Ads & Facebook Ads',
                'description' => 'Menguasai platform iklan digital Google Ads dan Facebook Ads.',
                'price' => 0,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 5,
            ],

            // Keuangan & Akuntansi (category_id: 6)
            [
                'title' => 'Personal Finance Management',
                'description' => 'Mengelola keuangan pribadi dan perencanaan investasi jangka panjang.',
                'price' => 229000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 6,
            ],
            [
                'title' => 'Akuntansi untuk UKM',
                'description' => 'Sistem akuntansi praktis untuk usaha kecil dan menengah.',
                'price' => 189000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 6,
            ],

            // Pengembangan Diri (category_id: 7)
            [
                'title' => 'Leadership & Team Management',
                'description' => 'Keterampilan kepemimpinan dan manajemen tim yang efektif.',
                'price' => 349000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 7,
            ],
            [
                'title' => 'Public Speaking & Presentation',
                'description' => 'Teknik presentasi dan public speaking yang percaya diri.',
                'price' => 0,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 7,
            ],

            // Data & Analytics (category_id: 8)
            [
                'title' => 'Data Science dengan Python',
                'description' => 'Analisis data dan machine learning menggunakan Python dan library populer.',
                'price' => 499000,
                'is_pro' => true,
                'status' => 'published',
                'category_id' => 8,
            ],
            [
                'title' => 'Excel untuk Data Analysis',
                'description' => 'Menggunakan Microsoft Excel untuk analisis data dan visualisasi.',
                'price' => 149000,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 8,
            ],
            [
                'title' => 'SQL Database Fundamentals',
                'description' => 'Dasar-dasar SQL dan manajemen database relational.',
                'price' => 0,
                'is_pro' => false,
                'status' => 'published',
                'category_id' => 8,
            ],
        ];

        foreach ($courses as $courseData) {
            Course::create(array_merge($courseData, [
                'institution_id' => $institution->id,
            ]));
        }
    }
}
