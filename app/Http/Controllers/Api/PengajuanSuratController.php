<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DokumenPersyaratan;
use App\Models\MasterSurat;
use App\Models\Notifikasi;
use App\Models\PengajuanSurat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PengajuanSuratController extends Controller
{
    /**
     * GET /api/master-surat
     * Daftar jenis surat yang tersedia (publik, tidak perlu login).
     */
    public function masterSurat()
    {
        $data = MasterSurat::aktif()
            ->select('id', 'kode', 'nama_surat', 'persyaratan')
            ->orderBy('nama_surat')
            ->get();

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/pengajuan
     * Riwayat pengajuan milik warga yang sedang login.
     */
    public function index(Request $request)
    {
        $pengajuan = PengajuanSurat::with(['masterSurat:id,kode,nama_surat'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => [
                'id'           => $p->id,
                'no_pengajuan' => $p->no_pengajuan,
                'jenis_surat'  => $p->masterSurat->nama_surat,
                'status'       => $p->status,
                'catatan'      => $p->catatan,
                'tanggal'      => $p->created_at->format('d/m/Y'),
            ]);

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * GET /api/pengajuan/{id}
     * Detail pengajuan beserta dokumen yang sudah diupload.
     */
    public function show(Request $request, int $id)
    {
        $pengajuan = PengajuanSurat::with([
            'masterSurat:id,kode,nama_surat,persyaratan',
            'dokumenPersyaratan',
            'verifikasiBerkas.staff:id,name',
            'pengesahanPermohonan.kepalaDesa:id,name',
            'suratOutput',
        ])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * POST /api/pengajuan
     * Buat pengajuan surat baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'master_surat_id' => 'required|exists:master_surat,id',
            'data_formulir'   => 'nullable|array',
        ]);

        $pengajuan = PengajuanSurat::create([
            'no_pengajuan'    => PengajuanSurat::generateNoPengajuan(),
            'user_id'         => $request->user()->id,
            'master_surat_id' => $request->master_surat_id,
            'data_formulir'   => $request->data_formulir,
            'status'          => 'menunggu',
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil dibuat. Silakan upload dokumen persyaratan.',
            'data'    => [
                'id'           => $pengajuan->id,
                'no_pengajuan' => $pengajuan->no_pengajuan,
                'status'       => $pengajuan->status,
            ],
        ], 201);
    }

    /**
     * POST /api/pengajuan/{id}/dokumen
     * Upload dokumen persyaratan (bisa dipanggil berkali-kali untuk tiap file).
     */
    public function uploadDokumen(Request $request, int $id)
    {
        $request->validate([
            'file'           => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // maks 5 MB
            'jenis_dokumen'  => 'required|string|max:100',
        ]);

        $pengajuan = PengajuanSurat::where('user_id', $request->user()->id)
            ->whereIn('status', ['menunggu', 'diproses'])
            ->findOrFail($id);

        $file = $request->file('file');
        $path = $file->store("dokumen/{$pengajuan->id}", 'public');

        $dokumen = DokumenPersyaratan::create([
            'pengajuan_id'  => $pengajuan->id,
            'nama_file'     => $file->getClientOriginalName(),
            'path_file'     => $path,
            'jenis_dokumen' => $request->jenis_dokumen,
        ]);

        return response()->json([
            'message' => 'Dokumen berhasil diupload.',
            'data'    => $dokumen,
        ], 201);
    }

    /**
     * DELETE /api/pengajuan/{id}
     * Batalkan pengajuan (hanya jika masih berstatus 'menunggu').
     */
    public function batalkan(Request $request, int $id)
    {
        $pengajuan = PengajuanSurat::where('user_id', $request->user()->id)
            ->findOrFail($id);

        if ($pengajuan->status !== 'menunggu') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat dibatalkan karena sudah diproses.',
            ], 422);
        }

        $pengajuan->update(['status' => 'dibatalkan']);

        return response()->json(['message' => 'Pengajuan berhasil dibatalkan.']);
    }
}
