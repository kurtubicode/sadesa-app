<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Models\PengesahanPermohonan;
use App\Models\PengajuanSurat;
use Illuminate\Http\Request;

class PengesahanController extends Controller
{
    /**
     * GET /api/kepala-desa/pengajuan
     * Daftar pengajuan yang sudah diverifikasi staff & siap disahkan.
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'menunggu_pengesahan');

        $pengajuan = PengajuanSurat::with([
            'user:id,nik,name',
            'masterSurat:id,kode,nama_surat',
            'verifikasiBerkas.staff:id,name',
        ])
            ->where('status', $status)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * GET /api/kepala-desa/pengajuan/{id}
     * Detail lengkap sebelum membuat keputusan.
     */
    public function show(int $id)
    {
        $pengajuan = PengajuanSurat::with([
            'user:id,nik,name,phone,email',
            'masterSurat:id,kode,nama_surat,persyaratan',
            'dokumenPersyaratan',
            'verifikasiBerkas.staff:id,name',
            'pengesahanPermohonan.kepalaDesa:id,name',
        ])->findOrFail($id);

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * POST /api/kepala-desa/pengajuan/{id}/pengesahan
     * Kepala desa menyetujui atau menolak pengajuan.
     */
    public function pengesahan(Request $request, int $id)
    {
        $request->validate([
            'status'  => 'required|in:disetujui,ditolak',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $pengajuan = PengajuanSurat::where('status', 'menunggu_pengesahan')
            ->findOrFail($id);

        // Catat pengesahan
        PengesahanPermohonan::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'kepala_desa_id' => $request->user()->id,
                'status'         => $request->status,
                'catatan'        => $request->catatan,
            ]
        );

        // Update status pengajuan
        $statusBaru = $request->status === 'disetujui' ? 'disetujui' : 'ditolak_kepala';
        $pengajuan->update([
            'status'  => $statusBaru,
            'catatan' => $request->catatan,
        ]);

        // Kirim notifikasi ke warga
        $pesan = $request->status === 'disetujui'
            ? "Selamat! Pengajuan {$pengajuan->no_pengajuan} telah disetujui oleh Kepala Desa. Surat Anda sedang disiapkan."
            : "Pengajuan {$pengajuan->no_pengajuan} tidak disetujui oleh Kepala Desa." . ($request->catatan ? " Alasan: {$request->catatan}" : '');

        Notifikasi::create([
            'user_id' => $pengajuan->user_id,
            'judul'   => 'Hasil Pengesahan Pengajuan Surat',
            'pesan'   => $pesan,
            'type'    => 'pengajuan',
        ]);

        return response()->json([
            'message' => 'Pengesahan berhasil disimpan.',
            'data'    => [
                'no_pengajuan' => $pengajuan->no_pengajuan,
                'status_baru'  => $statusBaru,
            ],
        ]);
    }
}
