<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting database seeding...');

        // Seed institutions first (required for courses)
        $this->command->info('Seeding institutions...');
        $this->call([
            InstitutionSeeder::class,
            OtherInstitutionSeeder::class,
            OtherInstitutionDataSeeder::class,
        ]);

        // Seed categories (required for courses)
        $this->command->info('Seeding categories...');
        $this->call([
            CategorySeeder::class,
        ]);

        // Seed users (required for enrollments, transactions, reviews)
        $this->command->info('Seeding users...');
        $this->call([
            UserSeeder::class,
        ]);

        // Seed courses (requires institutions and categories)
        $this->command->info('Seeding courses...');
        $this->call([
            CourseSeeder::class,
        ]);

        // Seed chapters (requires courses)
        $this->command->info('Seeding chapters...');
        $this->call([
            ChapterSeeder::class,
        ]);

        // Seed enrollments (requires users and courses)
        $this->command->info('Seeding enrollments...');
        $this->call([
            EnrollmentSeeder::class,
        ]);

        // Seed transactions (requires users and courses)
        $this->command->info('Seeding transactions...');
        $this->call([
            TransactionSeeder::class,
        ]);

        // Seed reviews (requires users and institutions)
        $this->command->info('Seeding institution reviews...');
        $this->call([
            ReviewSeeder::class,
        ]);

        // Seed course reviews (requires users, courses, and enrollments)
        $this->command->info('Seeding course reviews...');
        $this->call([
            CourseReviewSeeder::class,
        ]);

        // Seed progress tracking (requires enrollments, chapters, and materials)
        $this->command->info('Seeding chapter progress...');
        $this->call([
            ChapterProgressSeeder::class,
        ]);

        $this->command->info('Seeding material progress...');
        $this->call([
            MaterialProgressSeeder::class,
        ]);

        // Legacy test user
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        $this->command->info('Database seeding completed successfully!');

        // Display summary
        $this->displaySeedingSummary();
    }

    private function displaySeedingSummary()
    {
        $this->command->info('=== SEEDING SUMMARY ===');
        $this->command->info('Users: ' . \App\Models\User::count());
        $this->command->info('Institutions: ' . \App\Models\Institution::count());
        $this->command->info('Other Institutions: ' . \App\Models\OtherInstitution::count());
        $this->command->info('Categories: ' . \App\Models\Category::count());
        $this->command->info('Courses: ' . \App\Models\Course::count());
        $this->command->info('Chapters: ' . \App\Models\Chapter::count());
        $this->command->info('Enrollments: ' . \App\Models\Enrollment::count());
        $this->command->info('Transactions: ' . \App\Models\Transaction::count());
        $this->command->info('Institution Reviews: ' . \App\Models\Review::count());
        $this->command->info('Course Reviews: ' . \App\Models\CourseReview::count());
        $this->command->info('Chapter Progress: ' . \App\Models\ChapterProgress::count());
        $this->command->info('Material Progress: ' . \App\Models\MaterialProgress::count());
        $this->command->info('======================');
    }
}
