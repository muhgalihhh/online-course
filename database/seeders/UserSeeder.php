<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin users
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@onlinecourse.com',
            'phone' => '081234567890',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'bio' => 'Administrator sistem platform pembelajaran online.',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
            'city' => 'Jakarta',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Admin Materi',
            'email' => 'admin.materi@onlinecourse.com',
            'phone' => '081234567891',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'bio' => 'Administrator yang mengelola konten dan materi pembelajaran.',
            'birth_date' => '1988-05-15',
            'gender' => 'female',
            'city' => 'Bandung',
            'email_verified_at' => now(),
        ]);

        // Regular users
        $users = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@gmail.com',
                'phone' => '081234567892',
                'bio' => 'Fresh graduate yang ingin mengembangkan skill di bidang teknologi.',
                'birth_date' => '1998-03-22',
                'gender' => 'male',
                'city' => 'Surabaya',
            ],
            [
                'name' => 'Sari Dewi',
                'email' => 'sari.dewi@gmail.com',
                'phone' => '081234567893',
                'bio' => 'Mahasiswa tingkat akhir yang tertarik dengan digital marketing.',
                'birth_date' => '1999-08-10',
                'gender' => 'female',
                'city' => 'Yogyakarta',
            ],
            [
                'name' => 'Ahmad Rahman',
                'email' => 'ahmad.rahman@gmail.com',
                'phone' => '081234567894',
                'bio' => 'Entrepreneur muda yang ingin belajar tentang bisnis dan manajemen.',
                'birth_date' => '1995-11-05',
                'gender' => 'male',
                'city' => 'Medan',
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya.sari@gmail.com',
                'phone' => '081234567895',
                'bio' => 'Desainer grafis yang ingin mengembangkan skill UI/UX.',
                'birth_date' => '1996-07-18',
                'gender' => 'female',
                'city' => 'Bali',
            ],
            [
                'name' => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@gmail.com',
                'phone' => '081234567896',
                'bio' => 'Data analyst yang ingin mendalami machine learning.',
                'birth_date' => '1993-12-30',
                'gender' => 'male',
                'city' => 'Semarang',
            ],
            [
                'name' => 'Linda Kusuma',
                'email' => 'linda.kusuma@gmail.com',
                'phone' => '081234567897',
                'bio' => 'Marketing manager yang ingin upgrade skill digital marketing.',
                'birth_date' => '1991-04-25',
                'gender' => 'female',
                'city' => 'Makassar',
            ],
            [
                'name' => 'Dika Pratama',
                'email' => 'dika.pratama@gmail.com',
                'phone' => '081234567898',
                'bio' => 'Software developer yang ingin belajar framework terbaru.',
                'birth_date' => '1997-09-14',
                'gender' => 'male',
                'city' => 'Palembang',
            ],
            [
                'name' => 'Rina Wati',
                'email' => 'rina.wati@gmail.com',
                'phone' => '081234567899',
                'bio' => 'Akuntan yang ingin mempelajari financial technology.',
                'birth_date' => '1992-06-08',
                'gender' => 'female',
                'city' => 'Batam',
            ],
        ];

        foreach ($users as $userData) {
            User::create(array_merge($userData, [
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]));
        }
    }
}
