<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VerifikasiStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $aksi,       // 'disetujui' | 'ditolak'
        private ?string $catatan = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        if ($this->aksi === 'disetujui') {
            return [
                'type'  => 'verifikasi',
                'title' => 'Akun Berhasil Diverifikasi',
                'body'  => 'Selamat! Identitas Anda telah diverifikasi. Akun SADESA Anda sekarang aktif dan dapat mengakses semua layanan.',
                'action_url' => '/home',
            ];
        }

        return [
            'type'  => 'verifikasi',
            'title' => 'Verifikasi Ditolak',
            'body'  => 'Dokumen identitas Anda ditolak.'
                . ($this->catatan ? " Alasan: {$this->catatan}" : ' Silakan upload ulang dokumen yang valid.'),
            'action_url' => '/verifikasi',
        ];
    }
}
