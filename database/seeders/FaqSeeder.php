<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $faqs = [
      [
        'question' => 'Bagaimana cara mendaftar di platform ini?',
        'answer' => 'Untuk mendaftar, klik tombol "Daftar" di pojok kanan atas halaman. Isi formulir dengan informasi pribadi Anda seperti nama, email, dan password. Setelah itu, Anda akan menerima email verifikasi. Klik link di email tersebut untuk mengaktifkan akun Anda.',
        'category' => 'account',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'question' => 'Apakah semua kursus berbayar?',
        'answer' => 'Tidak, kami menyediakan kursus gratis dan berbayar. Kursus gratis dapat diakses tanpa pembayaran, sedangkan kursus premium (Pro) memerlukan pembayaran untuk dapat mengakses seluruh materinya. Anda dapat melihat label "FREE" atau "PRO" pada setiap kursus.',
        'category' => 'course',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'question' => 'Metode pembayaran apa saja yang tersedia?',
        'answer' => 'Kami menerima berbagai metode pembayaran melalui Midtrans, termasuk:\n- Transfer bank (BCA, Mandiri, BNI, BRI, dan bank lainnya)\n- E-wallet (GoPay, OVO, Dana, ShopeePay)\n- Kartu kredit/debit (Visa, Mastercard)\n- Alfamart dan Indomaret\n- QRIS',
        'category' => 'payment',
        'sort_order' => 3,
        'is_active' => true,
      ],
      [
        'question' => 'Berapa lama akses kursus yang saya beli?',
        'answer' => 'Setelah Anda membeli kursus, Anda akan mendapatkan akses seumur hidup ke materi kursus tersebut. Anda dapat mengakses kapan saja tanpa batas waktu, termasuk update materi di masa depan.',
        'category' => 'course',
        'sort_order' => 4,
        'is_active' => true,
      ],
      [
        'question' => 'Bagaimana jika saya lupa password?',
        'answer' => 'Jika Anda lupa password, klik link "Lupa Password?" pada halaman login. Masukkan email yang terdaftar, dan kami akan mengirimkan link reset password ke email Anda. Ikuti petunjuk di email untuk membuat password baru.',
        'category' => 'account',
        'sort_order' => 5,
        'is_active' => true,
      ],
      [
        'question' => 'Apakah ada sertifikat setelah menyelesaikan kursus?',
        'answer' => 'Ya, Anda akan mendapatkan sertifikat digital setelah menyelesaikan seluruh materi kursus dan lulus ujian akhir (jika ada). Sertifikat dapat didownload dalam format PDF dan dapat digunakan untuk keperluan profesional.',
        'category' => 'course',
        'sort_order' => 6,
        'is_active' => true,
      ],
      [
        'question' => 'Apakah bisa refund jika tidak puas dengan kursus?',
        'answer' => 'Kami menyediakan garansi 30 hari uang kembali. Jika Anda tidak puas dengan kursus dalam 30 hari pertama setelah pembelian, Anda dapat mengajukan refund. Hubungi customer service kami dengan menyertakan alasan dan bukti pembelian.',
        'category' => 'payment',
        'sort_order' => 7,
        'is_active' => true,
      ],
      [
        'question' => 'Bagaimana cara menghubungi customer service?',
        'answer' => 'Anda dapat menghubungi customer service kami melalui:\n- Email: support@pareeducub.com\n- WhatsApp: +62 812-3456-7890\n- Live chat di website (jam operasional 09:00-17:00 WIB)\n- Form kontak di halaman "Hubungi Kami"',
        'category' => 'general',
        'sort_order' => 8,
        'is_active' => true,
      ],
      [
        'question' => 'Apakah ada aplikasi mobile?',
        'answer' => 'Ya, kami memiliki aplikasi mobile yang dapat didownload di Google Play Store dan Apple App Store. Dengan aplikasi mobile, Anda dapat mengakses kursus kapan saja dan di mana saja, bahkan dalam mode offline untuk video yang sudah didownload.',
        'category' => 'technical',
        'sort_order' => 9,
        'is_active' => true,
      ],
      [
        'question' => 'Video tidak bisa diputar, apa yang harus dilakukan?',
        'answer' => 'Jika video tidak bisa diputar, coba langkah-langkah berikut:\n1. Pastikan koneksi internet stabil\n2. Refresh halaman browser\n3. Coba browser lain (Chrome, Firefox, Safari)\n4. Disable extension browser yang mengblokir video\n5. Clear cache dan cookies browser\n\nJika masih bermasalah, hubungi customer service kami.',
        'category' => 'technical',
        'sort_order' => 10,
        'is_active' => true,
      ],
    ];

    foreach ($faqs as $faq) {
      Faq::create($faq);
    }
  }
}
