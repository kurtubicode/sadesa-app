<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengajuanSurat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPengajuanController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PengajuanSurat::with([
            'user:id,name,nik',
            'masterSurat:id,nama,kode',
        ])->select('id', 'no_pengajuan', 'user_id', 'master_surat_id', 'status', 'catatan', 'created_at', 'updated_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('no_pengajuan', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }

        $pengajuan = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/pengajuan', [
            'pengajuan' => $pengajuan,
            'filters'   => $request->only('status', 'search'),
        ]);
    }

    public function show(PengajuanSurat $pengajuan): Response
    {
        $pengajuan->load([
            'user:id,name,nik,email,phone',
            'masterSurat:id,nama,kode,persyaratan',
            'dokumenPersyaratan:id,pengajuan_id,nama_file,tipe,created_at',
            'verifikasiBerkas.staff:id,name',
            'pengesahanPermohonan.kepalaDesa:id,name',
        ]);

        return Inertia::render('admin/pengajuan-detail', [
            'pengajuan' => $pengajuan,
        ]);
    }
}
