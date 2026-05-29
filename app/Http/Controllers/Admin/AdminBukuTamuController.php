<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BukuTamu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminBukuTamuController extends Controller
{
    public function index(Request $request): Response
    {
        $tanggal = $request->input('tanggal', '');
        $search  = $request->input('search', '');

        $query = BukuTamu::latest('waktu_kunjungan');

        if ($tanggal) {
            $query->whereDate('waktu_kunjungan', $tanggal);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_pengunjung', 'like', "%{$search}%")
                  ->orWhere('instansi',      'like', "%{$search}%")
                  ->orWhere('keperluan',     'like', "%{$search}%");
            });
        }

        return Inertia::render('admin/buku-tamu', [
            'entries' => $query->paginate(25)->withQueryString(),
            'filters' => compact('tanggal', 'search'),
            'stats'   => [
                'hari_ini'  => BukuTamu::whereDate('waktu_kunjungan', today())->count(),
                'bulan_ini' => BukuTamu::whereMonth('waktu_kunjungan', now()->month)
                                        ->whereYear('waktu_kunjungan', now()->year)
                                        ->count(),
                'total'     => BukuTamu::count(),
            ],
        ]);
    }
}
