<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update the single institution
        Institution::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Pare EduHub',
                'description' => 'Platform pembelajaran online personal yang menyediakan kursus berkualitas dari dasar hingga advanced. Dapatkan akses ke materi pembelajaran terbaik dengan harga terjangkau.',
                'phone' => '+62 812-3456-7890',
                'email' => 'info@pareeduhub.com',
                'address' => 'Jl. Brawijaya No. 123, Pare, Kediri, Jawa Timur 64212',
                'website' => 'https://pareeduhub.com',
                'photo_path' => null,
            ]
        );
    }
}