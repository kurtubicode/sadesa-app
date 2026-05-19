<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\KontenDesa;
use App\Models\Pengaduan;
use App\Models\PengajuanSurat;
use App\Models\User;
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
            default       => $this->warga($request),
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
            ->with('masterSurat:id,nama_surat')
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

    // ─── Warga ────────────────────────────────────────────────────────────────

    private function warga(Request $request): Response
    {
        $user = $request->user();

        $recentPengajuan = PengajuanSurat::where('user_id', $user->id)
            ->with('masterSurat:id,nama_surat,kode')
            ->latest()->take(5)
            ->get(['id', 'no_pengajuan', 'master_surat_id', 'status', 'created_at']);

        $recentPengaduan = Pengaduan::where('user_id', $user->id)
            ->latest()->take(5)
            ->get(['id', 'judul', 'status', 'created_at']);

        $recentInformasi = KontenDesa::published()
            ->latest()->take(3)
            ->get(['id', 'judul', 'slug', 'tipe', 'created_at']);

        return Inertia::render('dashboard/warga', [
            'stats' => [
                'total_pengajuan' => PengajuanSurat::where('user_id', $user->id)->count(),
                'total_pengaduan' => Pengaduan::where('user_id', $user->id)->count(),
            ],
            'recent_pengajuan' => $recentPengajuan,
            'recent_pengaduan' => $recentPengaduan,
            'recent_informasi' => $recentInformasi,
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
            ->with('masterSurat:id,nama_surat,kode')
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
