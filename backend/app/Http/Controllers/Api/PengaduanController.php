<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuktiPengaduan;
use App\Models\Pengaduan;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    /**
     * GET /api/pengaduan
     * Daftar pengaduan milik warga yang sedang login.
     */
    public function index(Request $request)
    {
        $pengaduan = Pengaduan::with('kategori:id,nama_kategori')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => [
                'id'       => $p->id,
                'judul'    => $p->judul,
                'kategori' => $p->kategori->nama_kategori ?? '—',
                'status'   => $p->status,
                'tanggal'  => $p->created_at->format('d/m/Y'),
            ]);

        return response()->json(['data' => $pengaduan]);
    }

    /**
     * GET /api/pengaduan/{id}
     * Detail pengaduan beserta bukti dan tanggapan.
     */
    public function show(Request $request, int $id)
    {
        $pengaduan = Pengaduan::with([
            'kategori:id,nama_kategori',
            'bukti',
            'tanggapan.user:id,name,role',
        ])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => $pengaduan]);
    }

    /**
     * POST /api/pengaduan
     * Buat pengaduan baru (bisa sekaligus upload 1 bukti).
     */
    public function store(Request $request)
    {
        $request->validate([
            'kategori_aduan_id' => 'required|exists:kategori_aduan,id',
            'judul'             => 'required|string|max:255',
            'deskripsi'         => 'required|string',
            'bukti'             => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $pengaduan = Pengaduan::create([
            'user_id'           => $request->user()->id,
            'kategori_aduan_id' => $request->kategori_aduan_id,
            'judul'             => $request->judul,
            'deskripsi'         => $request->deskripsi,
            'status'            => 'menunggu',
        ]);

        if ($request->hasFile('bukti')) {
            $path = $request->file('bukti')->store("bukti_pengaduan/{$pengaduan->id}", 'public');
            BuktiPengaduan::create([
                'pengaduan_id' => $pengaduan->id,
                'path_file'    => $path,
            ]);
        }

        return response()->json([
            'message' => 'Pengaduan berhasil dikirim. Petugas akan segera menindaklanjuti.',
            'data'    => ['id' => $pengaduan->id, 'judul' => $pengaduan->judul, 'status' => $pengaduan->status],
        ], 201);
    }
}
