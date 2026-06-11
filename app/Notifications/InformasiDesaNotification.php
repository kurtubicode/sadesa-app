<?php

namespace App\Notifications;

use App\Models\KontenDesa;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InformasiDesaNotification extends Notification
{
    use Queueable;

    private static array $tipeLabel = [
        'berita'      => 'Berita Desa',
        'pengumuman'  => 'Pengumuman',
        'agenda'      => 'Agenda Desa',
    ];

    public function __construct(
        private KontenDesa $konten
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $tipeLabel = self::$tipeLabel[$this->konten->tipe] ?? 'Informasi Desa';

        return [
            'type'       => 'informasi',
            'title'      => "{$tipeLabel} Terbaru",
            'body'       => $this->konten->judul,
            'action_id'  => $this->konten->id,
            'action_url' => "/informasi/{$this->konten->slug}",
        ];
    }
}
