<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPengaduanController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Pengaduan::with([
            'user:id,name',
            'kategori:id,nama_kategori',
        ])->select('id', 'user_id', 'kategori_aduan_id', 'judul', 'status', 'created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('judul', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }

        $pengaduan = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/pengaduan', [
            'pengaduan' => $pengaduan,
            'filters'   => $request->only('status', 'search'),
        ]);
    }

    public function show(Pengaduan $pengaduan): Response
    {
        $pengaduan->load([
            'user:id,name,nik,phone',
            'kategori:id,nama_kategori',
            'bukti:id,pengaduan_id,path_file',
            'tanggapan.user:id,name,role',
        ]);

        return Inertia::render('admin/pengaduan-detail', [
            'pengaduan' => $pengaduan,
        ]);
    }
}
