<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Models\PengajuanSurat;
use App\Models\VerifikasiBerkas;
use Illuminate\Http\Request;

class VerifikasiController extends Controller
{
    /**
     * GET /api/staff/pengajuan
     * Semua pengajuan yang masuk (kecuali dibatalkan).
     */
    public function index(Request $request)
    {
        $status  = $request->query('status');
        $query   = PengajuanSurat::with([
                'user:id,nik,name,phone',
                'masterSurat:id,kode,nama_surat',
            ])
            ->whereNotIn('status', ['dibatalkan'])
            ->orderByDesc('created_at');

        if ($status) {
            $query->where('status', $status);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * GET /api/staff/pengajuan/{id}
     * Detail pengajuan lengkap termasuk semua dokumen.
     */
    public function show(int $id)
    {
        $pengajuan = PengajuanSurat::with([
            'user:id,nik,name,phone,email',
            'masterSurat:id,kode,nama_surat,persyaratan',
            'dokumenPersyaratan',
            'verifikasiBerkas.staff:id,name',
        ])->findOrFail($id);

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * POST /api/staff/pengajuan/{id}/verifikasi
     * Staff memverifikasi berkas — bisa: disetujui | ditolak | revisi.
     */
    public function verifikasi(Request $request, int $id)
    {
        $request->validate([
            'status'  => 'required|in:disetujui,ditolak,revisi',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $pengajuan = PengajuanSurat::whereIn('status', ['menunggu', 'diproses'])
            ->findOrFail($id);

        // Catat verifikasi
        VerifikasiBerkas::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'staff_id' => $request->user()->id,
                'status'   => $request->status,
                'catatan'  => $request->catatan,
            ]
        );

        // Update status pengajuan
        $statusBaru = match ($request->status) {
            'disetujui' => 'menunggu_pengesahan',
            'ditolak'   => 'ditolak_staff',
            'revisi'    => 'diproses',
        };

        $pengajuan->update([
            'status'  => $statusBaru,
            'catatan' => $request->catatan,
        ]);

        // Kirim notifikasi ke warga
        Notifikasi::create([
            'user_id' => $pengajuan->user_id,
            'judul'   => 'Update Status Pengajuan Surat',
            'pesan'   => $this->pesanNotifikasi($request->status, $pengajuan->no_pengajuan, $request->catatan),
            'type'    => 'pengajuan',
        ]);

        return response()->json([
            'message' => 'Verifikasi berhasil disimpan.',
            'data'    => [
                'no_pengajuan' => $pengajuan->no_pengajuan,
                'status_baru'  => $statusBaru,
            ],
        ]);
    }

    private function pesanNotifikasi(string $status, string $noPengajuan, ?string $catatan): string
    {
        return match ($status) {
            'disetujui' => "Pengajuan {$noPengajuan} telah diverifikasi dan menunggu pengesahan Kepala Desa.",
            'ditolak'   => "Pengajuan {$noPengajuan} ditolak oleh petugas." . ($catatan ? " Alasan: {$catatan}" : ''),
            'revisi'    => "Pengajuan {$noPengajuan} memerlukan revisi dokumen." . ($catatan ? " Catatan: {$catatan}" : ''),
            default     => "Status pengajuan {$noPengajuan} telah diperbarui.",
        };
    }
}
