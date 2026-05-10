<?php

namespace App\Http\Controllers;

use App\Models\PengajuanSurat;
use App\Models\Pengaduan;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return match ($user->role) {
            'admin'       => $this->admin($request),
            'kepala_desa' => $this->kepalaDesa($request),
            'staff'       => $this->staff($request),
            default       => Inertia::render('dashboard/warga'),
        };
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    private function admin(Request $request): Response
    {
        $totalUsers       = User::count();
        $totalPengajuan   = PengajuanSurat::count();
        $pengajuanHariIni = PengajuanSurat::whereDate('created_at', today())->count();
        $pengaduanBaru    = Pengaduan::where('status', 'menunggu')->count();

        $recentLogs = AuditLog::with('user:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'action', 'created_at']);

        return Inertia::render('dashboard/admin', [
            'stats' => [
                'total_users'        => $totalUsers,
                'total_pengajuan'    => $totalPengajuan,
                'pengajuan_hari_ini' => $pengajuanHariIni,
                'pengaduan_baru'     => $pengaduanBaru,
            ],
            'recent_logs' => $recentLogs,
        ]);
    }

    // ─── Kepala Desa ──────────────────────────────────────────────────────────

    private function kepalaDesa(Request $request): Response
    {
        $totalPengajuan          = PengajuanSurat::count();
        $menungguPengesahan      = PengajuanSurat::where('status', 'menunggu_pengesahan')->count();
        $disetujuiBulanIni       = PengajuanSurat::where('status', 'disetujui')
            ->whereMonth('updated_at', now()->month)
            ->count();
        $ditolakBulanIni         = PengajuanSurat::where('status', 'ditolak_kepala')
            ->whereMonth('updated_at', now()->month)
            ->count();
        $selesaiBulanIni         = PengajuanSurat::where('status', 'selesai')
            ->whereMonth('updated_at', now()->month)
            ->count();

        $recentPengajuan = PengajuanSurat::with('user:id,name')
            ->with('masterSurat:id,nama')
            ->whereIn('status', ['menunggu_pengesahan', 'disetujui', 'ditolak_kepala'])
            ->latest()
            ->take(5)
            ->get(['id', 'no_pengajuan', 'user_id', 'master_surat_id', 'status', 'created_at']);

        return Inertia::render('dashboard/kepala-desa', [
            'stats' => [
                'total_pengajuan'       => $totalPengajuan,
                'menunggu_pengesahan'   => $menungguPengesahan,
                'disetujui_bulan_ini'   => $disetujuiBulanIni,
                'ditolak_bulan_ini'     => $ditolakBulanIni,
                'selesai_bulan_ini'     => $selesaiBulanIni,
            ],
            'recent_pengajuan' => $recentPengajuan,
        ]);
    }

    // ─── Staff ────────────────────────────────────────────────────────────────

    private function staff(Request $request): Response
    {
        $menungguVerifikasi = PengajuanSurat::where('status', 'menunggu')->count();
        $diprosesHariIni    = PengajuanSurat::where('status', 'diproses')
            ->whereDate('updated_at', today())
            ->count();
        $selesaiHariIni     = PengajuanSurat::whereIn('status', ['diverifikasi', 'menunggu_pengesahan'])
            ->whereDate('updated_at', today())
            ->count();
        $pengaduanBaru      = Pengaduan::where('status', 'menunggu')->count();

        $antrian = PengajuanSurat::with('user:id,name')
            ->with('masterSurat:id,nama,kode')
            ->where('status', 'menunggu')
            ->oldest()
            ->take(10)
            ->get(['id', 'no_pengajuan', 'user_id', 'master_surat_id', 'status', 'created_at']);

        return Inertia::render('dashboard/staff', [
            'stats' => [
                'menunggu_verifikasi' => $menungguVerifikasi,
                'diproses_hari_ini'   => $diprosesHariIni,
                'selesai_hari_ini'    => $selesaiHariIni,
                'pengaduan_baru'      => $pengaduanBaru,
            ],
            'antrian' => $antrian,
        ]);
    }
}
