<?php

namespace Database\Seeders;

use App\Models\OtherInstitution;
use Illuminate\Database\Seeder;

class OtherInstitutionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $otherInstitutions = [
            [
                'name' => 'Universitas Indonesia',
                'phone' => '021-7863333',
                'email' => 'info@ui.ac.id',
                'address' => 'Depok, Jawa Barat 16424, Indonesia',
                'website' => 'https://www.ui.ac.id',
                'logo_path' => null,
            ],
            [
                'name' => 'Institut Teknologi Bandung',
                'phone' => '022-2500935',
                'email' => 'info@itb.ac.id',
                'address' => 'Jl. Ganesha No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132',
                'website' => 'https://www.itb.ac.id',
                'logo_path' => null,
            ],
            [
                'name' => 'Universitas Gadjah Mada',
                'phone' => '0274-588688',
                'email' => 'info@ugm.ac.id',
                'address' => 'Bulaksumur, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281',
                'website' => 'https://www.ugm.ac.id',
                'logo_path' => null,
            ],
            [
                'name' => 'Universitas Brawijaya',
                'phone' => '0341-575777',
                'email' => 'info@ub.ac.id',
                'address' => 'Jl. Veteran, Ketawanggede, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145',
                'website' => 'https://www.ub.ac.id',
                'logo_path' => null,
            ],
            [
                'name' => 'Binus University',
                'phone' => '021-5345830',
                'email' => 'info@binus.edu',
                'address' => 'Jl. Kebon Jeruk Raya No.27, Kebon Jeruk, Jakarta Barat 11530',
                'website' => 'https://www.binus.ac.id',
                'logo_path' => null,
            ],
        ];

        foreach ($otherInstitutions as $institution) {
            OtherInstitution::create($institution);
        }
    }
}
