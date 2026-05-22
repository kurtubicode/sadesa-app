<?php

namespace Database\Seeders;

use App\Models\BuktiPengaduan;
use App\Models\KategoriAduan;
use App\Models\Pengaduan;
use App\Models\TanggapanPengaduan;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seed pengaduan / laporan warga dengan berbagai status:
 *   menunggu → diproses → selesai
 *          └─→ ditolak
 *
 * Masing-masing dilengkapi bukti_pengaduan dan tanggapan_pengaduan
 * yang realistis sesuai alur prosesnya.
 */
class PengaduanSeeder extends Seeder
{
    public function run(): void
    {
        // ── Aktor ─────────────────────────────────────────────────────────────
        $warga = User::where('role', 'warga')->where('status', 'aktif')->firstOrFail();
        $staff = User::where('role', 'staff')->firstOrFail();
        $admin = User::where('role', 'admin')->firstOrFail();

        // ── Kategori ──────────────────────────────────────────────────────────
        $katInfra     = KategoriAduan::where('nama_kategori', 'Infrastruktur')->firstOrFail();
        $katBersih    = KategoriAduan::where('nama_kategori', 'Kebersihan')->firstOrFail();
        $katKeamanan  = KategoriAduan::where('nama_kategori', 'Keamanan')->firstOrFail();
        $katPelayanan = KategoriAduan::where('nama_kategori', 'Pelayanan Publik')->firstOrFail();
        $katPenerang  = KategoriAduan::where('nama_kategori', 'Penerangan')->firstOrFail();
        $katLain      = KategoriAduan::where('nama_kategori', 'Lain-lain')->firstOrFail();

        // Bersihkan data lama
        Pengaduan::where('user_id', $warga->id)->each(function ($p) {
            $p->tanggapan()->delete();
            $p->bukti()->delete();
            $p->delete();
        });

        // ─────────────────────────────────────────────────────────────────────
        // 1. MENUNGGU — Jalan rusak, baru dilaporkan
        // ─────────────────────────────────────────────────────────────────────
        $l1 = Pengaduan::create([
            'user_id'          => $warga->id,
            'kategori_aduan_id'=> $katInfra->id,
            'judul'            => 'Jalan Rusak Berlubang di RT 03 Depan SDN Cirangkong',
            'deskripsi'        => "Kondisi jalan di depan SDN Cirangkong RT 03 sangat rusak parah. Terdapat lebih dari 5 lubang besar dengan diameter sekitar 30-50 cm dan kedalaman 10-15 cm. Kondisi ini sangat membahayakan pengendara, terutama saat hujan karena lubang tergenang air sehingga tidak terlihat.\n\nSudah ada 2 kali motor terjatuh dalam 2 minggu terakhir akibat kondisi ini. Mohon segera ditindaklanjuti untuk perbaikan jalan tersebut demi keselamatan warga.",
            'status'           => 'menunggu',
            'created_at'       => now()->subDays(2),
            'updated_at'       => now()->subDays(2),
        ]);
        $this->seedBukti($l1->id, 3, now()->subDays(2));

        // ─────────────────────────────────────────────────────────────────────
        // 2. DIPROSES — Sampah menumpuk, sudah ada tanggapan awal
        // ─────────────────────────────────────────────────────────────────────
        $l2 = Pengaduan::create([
            'user_id'          => $warga->id,
            'kategori_aduan_id'=> $katBersih->id,
            'judul'            => 'Tumpukan Sampah di Pinggir Jalan Raya Cirangkong Tidak Diangkut',
            'deskripsi'        => "Sudah lebih dari 1 minggu tumpukan sampah di pinggir Jalan Raya Cirangkong (depan warung Pak Eko) tidak diangkut oleh petugas kebersihan. Sampah sudah menggunung dan mengeluarkan bau tidak sedap, serta mulai mengundang lalat dan tikus.\n\nKami sangat khawatir dengan dampak kesehatan, terutama bagi anak-anak dan lansia yang tinggal di sekitar lokasi. Mohon segera dikoordinasikan dengan dinas kebersihan untuk pengangkutan rutin.",
            'status'           => 'diproses',
            'created_at'       => now()->subDays(7),
            'updated_at'       => now()->subDays(5),
        ]);
        $this->seedBukti($l2->id, 2, now()->subDays(7));
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l2->id,
            'user_id'       => $staff->id,
            'isi_tanggapan' => 'Terima kasih atas laporan Bapak/Ibu. Kami telah menerima pengaduan ini dan segera berkoordinasi dengan petugas kebersihan desa untuk penanganan. Pengangkutan sampah akan dijadwalkan dalam 2-3 hari kerja ke depan.',
            'created_at'    => now()->subDays(5),
            'updated_at'    => now()->subDays(5),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 3. DIPROSES — Lampu jalan mati, sudah ada beberapa tanggapan
        // ─────────────────────────────────────────────────────────────────────
        $l3 = Pengaduan::create([
            'user_id'          => $warga->id,
            'kategori_aduan_id'=> $katPenerang->id,
            'judul'            => '3 Lampu Jalan di Gang Mawar Mati Sudah 2 Minggu',
            'deskripsi'        => "Terdapat 3 titik lampu jalan di Gang Mawar (RT 02/RW 01) yang sudah mati selama kurang lebih 2 minggu. Kondisi ini membuat suasana gang sangat gelap di malam hari dan warga merasa tidak aman.\n\nLokasi tepatnya: (1) Di depan rumah No. 12, (2) Di persimpangan gang menuju RT 03, (3) Di ujung gang dekat kolam. Mohon segera dilakukan pengecekan dan penggantian lampu.",
            'status'           => 'diproses',
            'created_at'       => now()->subDays(14),
            'updated_at'       => now()->subDays(10),
        ]);
        $this->seedBukti($l3->id, 2, now()->subDays(14));
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l3->id,
            'user_id'       => $staff->id,
            'isi_tanggapan' => 'Laporan sudah kami terima. Tim teknis akan melakukan pengecekan ke lokasi dalam 3 hari kerja. Terima kasih atas laporan yang disertai titik lokasi yang jelas, sangat membantu tim kami.',
            'created_at'    => now()->subDays(12),
            'updated_at'    => now()->subDays(12),
        ]);
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l3->id,
            'user_id'       => $staff->id,
            'isi_tanggapan' => 'Update: Tim sudah melakukan pengecekan lapangan. Kerusakan pada 2 titik sudah teridentifikasi (bohlam putus). Untuk 1 titik lainnya terdapat kerusakan pada kabel, memerlukan penanganan lebih lanjut. Estimasi perbaikan 3-5 hari kerja.',
            'created_at'    => now()->subDays(10),
            'updated_at'    => now()->subDays(10),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 4. SELESAI — Gangguan keamanan, sudah ditangani
        // ─────────────────────────────────────────────────────────────────────
        $l4 = Pengaduan::create([
            'user_id'          => $warga->id,
            'kategori_aduan_id'=> $katKeamanan->id,
            'judul'            => 'Laporan Orang Tidak Dikenal Mondar-mandir di Perumahan RT 04',
            'deskripsi'        => "Beberapa hari ini ada orang tidak dikenal yang sering mondar-mandir di sekitar perumahan RT 04, terutama pada jam-jam sepi (siang dan larut malam). Sudah ditanya oleh warga, tapi yang bersangkutan tidak bisa menjelaskan tujuannya dengan jelas.\n\nMohon bantuan RT/RW dan pihak terkait untuk meningkatkan pengawasan demi keamanan warga.",
            'status'           => 'selesai',
            'created_at'       => now()->subDays(20),
            'updated_at'       => now()->subDays(15),
        ]);
        $this->seedBukti($l4->id, 1, now()->subDays(20));
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l4->id,
            'user_id'       => $staff->id,
            'isi_tanggapan' => 'Laporan sudah diteruskan kepada Ketua RT 04 dan Babinsa setempat untuk dilakukan pengecekan dan penguatan ronda malam.',
            'created_at'    => now()->subDays(19),
            'updated_at'    => now()->subDays(19),
        ]);
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l4->id,
            'user_id'       => $admin->id,
            'isi_tanggapan' => 'Berdasarkan hasil pengecekan Babinsa dan Ketua RT 04, orang tersebut telah diidentifikasi sebagai pekerja bangunan rumah No. 21 yang sedang dalam proses renovasi. Situasi sudah kondusif. Terima kasih atas kewaspadaan dan laporan Bapak/Ibu. Pengaduan ini kami tutup.',
            'created_at'    => now()->subDays(15),
            'updated_at'    => now()->subDays(15),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 5. SELESAI — Pelayanan lambat, sudah ada respons positif
        // ─────────────────────────────────────────────────────────────────────
        $l5 = Pengaduan::create([
            'user_id'          => $warga->id,
            'kategori_aduan_id'=> $katPelayanan->id,
            'judul'            => 'Proses Pengajuan Surat Keterangan Tidak Mampu Terlalu Lama',
            'deskripsi'        => "Saya mengajukan SKTM sejak 3 minggu lalu untuk keperluan beasiswa anak, namun sampai sekarang belum ada kejelasan statusnya. Saya sudah datang ke kantor desa 2 kali tapi informasi yang diberikan tidak jelas.\n\nMohon ada kejelasan proses dan kepastian waktu penyelesaian pengajuan surat keterangan.",
            'status'           => 'selesai',
            'created_at'       => now()->subDays(30),
            'updated_at'       => now()->subDays(25),
        ]);
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l5->id,
            'user_id'       => $admin->id,
            'isi_tanggapan' => 'Mohon maaf atas ketidaknyamanan ini. Kami telah melakukan evaluasi internal dan menemukan bahwa pengajuan Bapak/Ibu tertunda karena kekurangan dokumen yang tidak ter-notifikasi dengan baik. Pengajuan sudah kami proses prioritas dan akan selesai dalam 2 hari kerja. Ke depan kami akan meningkatkan sistem notifikasi agar warga dapat memantau status pengajuan secara real-time melalui aplikasi SADESA.',
            'created_at'    => now()->subDays(28),
            'updated_at'    => now()->subDays(28),
        ]);
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l5->id,
            'user_id'       => $staff->id,
            'isi_tanggapan' => '[Status diubah ke SELESAI] Surat SKTM sudah selesai diproses dan dapat diambil di kantor desa pada jam pelayanan. Sekali lagi kami mohon maaf atas keterlambatan.',
            'created_at'    => now()->subDays(25),
            'updated_at'    => now()->subDays(25),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 6. DITOLAK — Pengaduan di luar kewenangan desa
        // ─────────────────────────────────────────────────────────────────────
        $l6 = Pengaduan::create([
            'user_id'          => $warga->id,
            'kategori_aduan_id'=> $katLain->id,
            'judul'            => 'Permintaan Penurunan Harga Sembako di Pasar',
            'deskripsi'        => "Harga sembako di pasar desa belakangan ini naik sangat signifikan, terutama beras, minyak goreng, dan cabai. Kenaikannya mencapai 30-40% dibandingkan bulan lalu.\n\nMohon pemerintah desa dapat turun tangan untuk menstabilkan harga kebutuhan pokok warga, misalnya dengan operasi pasar murah atau subsidi.",
            'status'           => 'ditolak',
            'created_at'       => now()->subDays(10),
            'updated_at'       => now()->subDays(8),
        ]);
        TanggapanPengaduan::create([
            'pengaduan_id'  => $l6->id,
            'user_id'       => $admin->id,
            'isi_tanggapan' => 'Terima kasih atas kepedulian Bapak/Ibu terhadap kondisi perekonomian warga. Namun perlu kami sampaikan bahwa kebijakan penetapan dan stabilisasi harga sembako merupakan kewenangan Pemerintah Kabupaten/Kota dan Kementerian Perdagangan, di luar kewenangan pemerintah desa. Kami menyarankan Bapak/Ibu untuk menyampaikan aspirasi ini kepada DPRD atau dinas terkait di tingkat kabupaten. Pengaduan ini kami tutup karena di luar kewenangan desa.',
            'created_at'    => now()->subDays(8),
            'updated_at'    => now()->subDays(8),
        ]);

        $this->command->info('PengaduanSeeder: 6 pengaduan berhasil dibuat (menunggu×1, diproses×2, selesai×2, ditolak×1).');
    }

    // ── Helper: buat dummy foto bukti pengaduan ───────────────────────────────

    private function seedBukti(int $pengaduanId, int $jumlah, \Illuminate\Support\Carbon $at): void
    {
        for ($i = 1; $i <= $jumlah; $i++) {
            BuktiPengaduan::create([
                'pengaduan_id' => $pengaduanId,
                'path_file'    => "bukti-pengaduan/{$pengaduanId}/foto-{$i}.jpg",
                'created_at'   => $at,
                'updated_at'   => $at,
            ]);
        }
    }
}
