<?php

namespace App\Notifications;

use App\Models\PengajuanSurat;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StatusSuratNotification extends Notification
{
    use Queueable;

    private static array $statusLabel = [
        'menunggu'            => 'Pengajuan Diterima',
        'diproses'            => 'Sedang Diproses',
        'diverifikasi'        => 'Berkas Diverifikasi',
        'menunggu_pengesahan' => 'Menunggu Pengesahan',
        'disetujui'           => 'Disetujui Kepala Desa',
        'ditolak_staff'       => 'Ditolak Petugas',
        'ditolak_kepala'      => 'Ditolak Kepala Desa',
        'selesai'             => 'Surat Siap Diunduh',
        'dibatalkan'          => 'Pengajuan Dibatalkan',
    ];

    private static array $statusBody = [
        'diproses'            => 'Berkas pengajuan Anda sedang diproses oleh petugas desa.',
        'diverifikasi'        => 'Berkas Anda telah diverifikasi dan diteruskan ke Kepala Desa.',
        'menunggu_pengesahan' => 'Dokumen Anda menunggu pengesahan Kepala Desa.',
        'disetujui'           => 'Pengajuan Anda telah disetujui oleh Kepala Desa.',
        'ditolak_staff'       => 'Pengajuan Anda ditolak oleh petugas. Periksa catatan untuk detail.',
        'ditolak_kepala'      => 'Pengajuan Anda ditolak oleh Kepala Desa. Periksa catatan untuk detail.',
        'selesai'             => 'Surat Anda telah selesai dan siap untuk diunduh.',
        'dibatalkan'          => 'Pengajuan Anda telah dibatalkan.',
    ];

    public function __construct(
        private PengajuanSurat $pengajuan
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $status = $this->pengajuan->status;
        $label  = self::$statusLabel[$status] ?? 'Status Diperbarui';
        $body   = self::$statusBody[$status]
            ?? "Status pengajuan {$this->pengajuan->jenis_surat} telah diperbarui.";

        return [
            'type'       => 'surat',
            'title'      => "Status Surat: {$label}",
            'body'       => "{$this->pengajuan->jenis_surat} — {$body}",
            'action_id'  => $this->pengajuan->id,
            'action_url' => "/pengajuan/{$this->pengajuan->id}",
        ];
    }
}
