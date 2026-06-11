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
        $limit     = min((int) ($request->query('per_page', 50)), 100);
        $pengaduan = Pengaduan::with('kategori:id,nama_kategori')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit($limit)
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

        // Transform agar konsisten dengan field yang dipakai mobile
        $tanggapan = $pengaduan->tanggapan->map(fn ($t) => [
            'id'         => $t->id,
            'isi'        => $t->isi_tanggapan,
            'created_at' => $t->created_at,
            'user'       => [
                'name' => $t->user?->name ?? 'Petugas',
                'role' => $t->user?->role ?? 'staff',
            ],
        ]);

        return response()->json([
            'data' => [
                'id'         => $pengaduan->id,
                'judul'      => $pengaduan->judul,
                'deskripsi'  => $pengaduan->deskripsi,
                'status'     => $pengaduan->status,
                'created_at' => $pengaduan->created_at,
                'kategori'   => $pengaduan->kategori
                    ? ['id' => $pengaduan->kategori->id, 'nama_kategori' => $pengaduan->kategori->nama_kategori]
                    : null,
                'bukti'      => $pengaduan->bukti->map(fn ($b) => [
                    'id'        => $b->id,
                    'path_file' => $b->path_file,
                ]),
                'tanggapan'  => $tanggapan,
            ],
        ]);
    }

    /**
     * POST /api/pengaduan
     * Buat pengaduan baru (bisa sekaligus upload hingga 3 foto bukti).
     */
    public function store(Request $request)
    {
        $request->validate([
            'kategori_aduan_id' => 'required|exists:kategori_aduan,id',
            'judul'             => 'required|string|max:255',
            'deskripsi'         => 'required|string',
            // Mendukung bukti tunggal (bukti) dan array (bukti.*)
            'bukti'             => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'bukti.*'           => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $pengaduan = Pengaduan::create([
            'user_id'           => $request->user()->id,
            'kategori_aduan_id' => $request->kategori_aduan_id,
            'judul'             => $request->judul,
            'deskripsi'         => $request->deskripsi,
            'status'            => 'menunggu',
        ]);

        // Kumpulkan semua file bukti (tunggal atau array)
        $files = [];
        if ($request->hasFile('bukti')) {
            $raw = $request->file('bukti');
            $files = is_array($raw) ? array_slice($raw, 0, 3) : [$raw];
        }

        foreach ($files as $file) {
            $path = $file->store("bukti_pengaduan/{$pengaduan->id}", 'public');
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
