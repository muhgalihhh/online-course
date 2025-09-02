<?php

namespace Database\Seeders;

use App\Models\OtherInstitution;
use Illuminate\Database\Seeder;

class OtherInstitutionDataSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $institutions = [
      [
        'name' => 'Universitas Indonesia',
        'phone' => '021-7270011',
        'email' => 'info@ui.ac.id',
        'address' => 'Kampus UI Depok, Pondok Cina, Beji, Kota Depok, Jawa Barat 16424',
        'website' => 'https://ui.ac.id',
        'logo_path' => null,
      ],
      [
        'name' => 'Institut Teknologi Bandung',
        'phone' => '022-2500935',
        'email' => 'info@itb.ac.id',
        'address' => 'Jl. Ganesha No.10, Lb. Siliwangi, Coblong, Kota Bandung, Jawa Barat 40132',
        'website' => 'https://itb.ac.id',
        'logo_path' => null,
      ],
      [
        'name' => 'Universitas Gadjah Mada',
        'phone' => '0274-588688',
        'email' => 'info@ugm.ac.id',
        'address' => 'Bulaksumur, Caturtunggal, Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281',
        'website' => 'https://ugm.ac.id',
        'logo_path' => null,
      ],
      [
        'name' => 'Binar Academy',
        'phone' => '021-22501010',
        'email' => 'hello@binaracademy.com',
        'address' => 'Jl. Kemang Timur No.22, RT.14/RW.8, Bangka, Mampang Prpt., Kota Jakarta Selatan 12560',
        'website' => 'https://binaracademy.com',
        'logo_path' => null,
      ],
      [
        'name' => 'Dicoding Indonesia',
        'phone' => '022-20505611',
        'email' => 'info@dicoding.com',
        'address' => 'Jl. Batik Kumeli No.50, Sukaluyu, Cibeunying Kaler, Kota Bandung, Jawa Barat 40123',
        'website' => 'https://dicoding.com',
        'logo_path' => null,
      ],
      [
        'name' => 'Hacktiv8',
        'phone' => '021-2205-0058',
        'email' => 'hello@hacktiv8.com',
        'address' => 'Jl. Sultanahmet No.47, RT.1/RW.3, Menteng, Kec. Menteng, Kota Jakarta Pusat 10310',
        'website' => 'https://hacktiv8.com',
        'logo_path' => null,
      ],
      [
        'name' => 'Algoritma Data Science School',
        'phone' => '021-2939-2399',
        'email' => 'hello@algorit.ma',
        'address' => 'Jl. Wijaya IX No.23, Kebayoran Baru, Jakarta Selatan 12160',
        'website' => 'https://algorit.ma',
        'logo_path' => null,
      ],
      [
        'name' => 'FIKTI (Forum Industri Kreatif Teknologi Informasi)',
        'phone' => '021-3929-4646',
        'email' => 'info@fikti.org',
        'address' => 'Jl. Gatot Subroto Kav. 53, Jakarta Selatan 12950',
        'website' => 'https://fikti.org',
        'logo_path' => null,
      ],
      [
        'name' => 'Purwadhika Digital Technology School',
        'phone' => '021-2788-6633',
        'email' => 'info@purwadhika.com',
        'address' => 'Jl. Prof. DR. Satrio Kav. C4, Kuningan, Jakarta Selatan 12950',
        'website' => 'https://purwadhika.com',
        'logo_path' => null,
      ],
      [
        'name' => 'Refactory',
        'phone' => '021-2270-7916',
        'email' => 'hello@refactory.id',
        'address' => 'Jl. Radio Dalam Raya No.10A, Kebayoran Baru, Jakarta Selatan 12140',
        'website' => 'https://refactory.id',
        'logo_path' => null,
      ],
      [
        'name' => 'Digitalent Kominfo',
        'phone' => '021-3504013',
        'email' => 'digitalent@kominfo.go.id',
        'address' => 'Jl. Medan Merdeka Barat No. 8, Jakarta Pusat 10110',
        'website' => 'https://digitalent.kominfo.go.id',
        'logo_path' => null,
      ],
      [
        'name' => 'MySkill.id',
        'phone' => '021-50959595',
        'email' => 'hello@myskill.id',
        'address' => 'Gedung Kadin Indonesia, Jl. H. R. Rasuna Said X-5 No.Kav 2-3, Jakarta 12950',
        'website' => 'https://myskill.id',
        'logo_path' => null,
      ],
    ];

    foreach ($institutions as $institution) {
      OtherInstitution::create($institution);
    }
  }
}
