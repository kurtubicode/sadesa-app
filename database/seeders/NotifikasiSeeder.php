<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seed notifikasi dummy untuk warga aktif.
 *
 * Format kolom tabel `notifications` (Laravel database channel):
 *   id             — UUID
 *   type           — FQCN notification class
 *   notifiable_type — App\Models\User
 *   notifiable_id  — user id
 *   data           — JSON (payload toDatabase())
 *   read_at        — nullable timestamp
 *   created_at
 *   updated_at
 */
class NotifikasiSeeder extends Seeder
{
    public function run(): void
    {
        // Target: semua warga aktif yang ada di seeder
        $wargas = User::where('role', 'warga')->where('status', 'aktif')->get();

        if ($wargas->isEmpty()) {
            $this->command->warn('Tidak ada warga aktif — NotifikasiSeeder dilewati.');
            return;
        }

        // Hapus notifikasi lama agar idempoten
        DB::table('notifications')
            ->whereIn('notifiable_id', $wargas->pluck('id'))
            ->where('notifiable_type', User::class)
            ->delete();

        $rows = [];
        $now  = now();

        foreach ($wargas as $warga) {
            // ── 1. Verifikasi akun disetujui ─────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\VerifikasiStatusNotification',
                data: [
                    'type'       => 'verifikasi',
                    'title'      => 'Akun Berhasil Diverifikasi',
                    'body'       => 'Selamat! Akun Anda telah diverifikasi oleh admin. Anda kini dapat mengakses seluruh layanan desa.',
                    'action_url' => null,
                ],
                readAt: $now->copy()->subDays(6),
                createdAt: $now->copy()->subDays(6)->subHours(2),
            );

            // ── 2. Pengajuan surat diterima ───────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\StatusSuratNotification',
                data: [
                    'type'       => 'surat',
                    'title'      => 'Status Surat: Pengajuan Diterima',
                    'body'       => 'Surat Keterangan Domisili — Pengajuan Anda telah diterima dan sedang menunggu verifikasi berkas.',
                    'action_url' => '/pengajuan/1',
                ],
                readAt: $now->copy()->subDays(5),
                createdAt: $now->copy()->subDays(5)->subHours(1),
            );

            // ── 3. Berkas diverifikasi ────────────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\StatusSuratNotification',
                data: [
                    'type'       => 'surat',
                    'title'      => 'Status Surat: Berkas Diverifikasi',
                    'body'       => 'Surat Keterangan Domisili — Berkas Anda telah diverifikasi dan diteruskan ke Kepala Desa.',
                    'action_url' => '/pengajuan/1',
                ],
                readAt: $now->copy()->subDays(4),
                createdAt: $now->copy()->subDays(4)->subHours(3),
            );

            // ── 4. Informasi: pengumuman ──────────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\InformasiDesaNotification',
                data: [
                    'type'       => 'informasi',
                    'title'      => 'Pengumuman Terbaru',
                    'body'       => 'Pengumuman Jadwal Pelayanan KTP & KK — Pelayanan administrasi kependudukan dibuka setiap Senin–Jumat pukul 08.00–14.00 WIB.',
                    'action_url' => '/informasi/pengumuman-jadwal-pelayanan',
                ],
                readAt: $now->copy()->subDays(3),
                createdAt: $now->copy()->subDays(3)->subHours(5),
            );

            // ── 5. Surat disetujui kepala desa ────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\StatusSuratNotification',
                data: [
                    'type'       => 'surat',
                    'title'      => 'Status Surat: Disetujui Kepala Desa',
                    'body'       => 'Surat Keterangan Domisili — Pengajuan Anda telah disetujui oleh Kepala Desa.',
                    'action_url' => '/pengajuan/1',
                ],
                readAt: $now->copy()->subDays(2),
                createdAt: $now->copy()->subDays(2)->subHours(1),
            );

            // ── 6. Tanggapan pengaduan ────────────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\PengaduanTanggapanNotification',
                data: [
                    'type'       => 'pengaduan',
                    'title'      => 'Pengaduan Anda Mendapat Tanggapan',
                    'body'       => 'Staff Pelayanan: "Terima kasih atas laporan Anda. Tim kami sedang menindaklanjuti permasalahan jalan rusak di RT 03..."',
                    'action_url' => '/pengaduan/1',
                ],
                readAt: $now->copy()->subDay(),
                createdAt: $now->copy()->subDay()->subHours(4),
            );

            // ── 7. Informasi: berita desa ─────────────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\InformasiDesaNotification',
                data: [
                    'type'       => 'informasi',
                    'title'      => 'Berita Desa Terbaru',
                    'body'       => 'Gotong Royong Perbaikan Jalan Desa RT 03 — Warga RT 03 bersama perangkat desa melaksanakan kegiatan gotong royong perbaikan jalan.',
                    'action_url' => '/informasi/gotong-royong-perbaikan-jalan',
                ],
                readAt: $now->copy()->subHours(10),
                createdAt: $now->copy()->subHours(12),
            );

            // ── 8. Surat selesai (BELUM DIBACA) ──────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\StatusSuratNotification',
                data: [
                    'type'       => 'surat',
                    'title'      => 'Status Surat: Surat Siap Diunduh',
                    'body'       => 'Surat Keterangan Domisili — Surat Anda telah selesai dan siap untuk diunduh.',
                    'action_url' => '/pengajuan/1',
                ],
                readAt: null,                          // ← belum dibaca
                createdAt: $now->copy()->subHours(3),
            );

            // ── 9. Pengumuman baru (BELUM DIBACA) ────────────────────────────
            $rows[] = $this->row(
                notifiable: $warga,
                type: 'App\Notifications\InformasiDesaNotification',
                data: [
                    'type'       => 'informasi',
                    'title'      => 'Pengumuman Terbaru',
                    'body'       => 'Imbauan Ketertiban Lingkungan — Kepala Desa menghimbau seluruh warga untuk menjaga kebersihan dan ketertiban lingkungan menjelang musim hujan.',
                    'action_url' => '/informasi/imbauan-ketertiban-lingkungan',
                ],
                readAt: null,                          // ← belum dibaca
                createdAt: $now->copy()->subHours(1),
            );

            // ── 10. Notif verifikasi ditolak (BELUM DIBACA) ───────────────────
            // Hanya untuk warga pertama — biar tidak semua dapat notif ditolak
            if ($warga->is($wargas->first())) {
                $rows[] = $this->row(
                    notifiable: $warga,
                    type: 'App\Notifications\VerifikasiStatusNotification',
                    data: [
                        'type'       => 'verifikasi',
                        'title'      => 'Verifikasi Ditolak — Perlu Upload Ulang',
                        'body'       => 'Foto KTP yang Anda upload kurang jelas. Silakan upload ulang dengan foto yang lebih terang dan terbaca.',
                        'action_url' => null,
                    ],
                    readAt: null,                      // ← belum dibaca
                    createdAt: $now->copy()->subMinutes(30),
                );
            }
        }

        DB::table('notifications')->insert($rows);

        $total = count($rows);
        $this->command->info("NotifikasiSeeder: {$total} notifikasi berhasil dibuat untuk {$wargas->count()} warga.");
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function row(
        User   $notifiable,
        string $type,
        array  $data,
        ?\Illuminate\Support\Carbon $readAt,
        \Illuminate\Support\Carbon  $createdAt,
    ): array {
        return [
            'id'              => Str::uuid()->toString(),
            'type'            => $type,
            'notifiable_type' => User::class,
            'notifiable_id'   => $notifiable->id,
            'data'            => json_encode($data),
            'read_at'         => $readAt,
            'created_at'      => $createdAt,
            'updated_at'      => $createdAt,
        ];
    }
}
