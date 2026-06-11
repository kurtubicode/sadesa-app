<?php

namespace App\Notifications;

use App\Models\Pengaduan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PengaduanTanggapanNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Pengaduan $pengaduan,
        private string $isiTanggapan,
        private string $namaPetugas
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'pengaduan',
            'title'      => 'Tanggapan Pengaduan',
            'body'       => "{$this->namaPetugas} menanggapi laporan \"{$this->pengaduan->judul}\": "
                          . mb_substr($this->isiTanggapan, 0, 80)
                          . (mb_strlen($this->isiTanggapan) > 80 ? '…' : ''),
            'action_id'  => $this->pengaduan->id,
            'action_url' => "/pengaduan/{$this->pengaduan->id}",
        ];
    }
}
