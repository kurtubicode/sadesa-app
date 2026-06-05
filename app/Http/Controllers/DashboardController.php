<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BukuTamu;
use App\Models\KontenDesa;
use App\Models\MasterSurat;
use App\Models\Penduduk;
use App\Models\Pengaduan;
use App\Models\PengajuanSurat;
use App\Models\User;
use App\Models\VerifikasiWarga;
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
        $totalUsers          = User::count();
        $totalPengajuan      = PengajuanSurat::count();
        $pengajuanHariIni    = PengajuanSurat::whereDate('created_at', today())->count();
        $pengaduanBaru       = Pengaduan::where('status', 'menunggu')->count();
        $verifikasiMenunggu  = VerifikasiWarga::where('status', 'menunggu')->count();
        $penggunaBulanIni    = User::whereMonth('created_at', now()->month)
                                    ->whereYear('created_at', now()->year)
                                    ->count();

        // Chart: pengajuan per hari 7 hari terakhir
        $chartMingguan = collect(range(6, 0))->map(function (int $daysAgo) {
            $date = now()->subDays($daysAgo);
            return [
                'label'  => strtoupper($date->locale('id')->isoFormat('ddd')),
                'jumlah' => PengajuanSurat::whereDate('created_at', $date)->count(),
            ];
        })->values();

        $recentLogs = AuditLog::with('user:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'action', 'model', 'created_at']);

        $recentPengajuan = PengajuanSurat::with([
                'user:id,name,nik',
                'masterSurat:id,nama_surat',
            ])
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'master_surat_id', 'status', 'created_at']);

        $totalPenduduk = Penduduk::count();
        $totalWarga    = User::where('role', 'warga')->count();

        return Inertia::render('dashboard/admin', [
            'stats' => [
                'total_penduduk'          => $totalPenduduk,
                'total_warga'             => $totalWarga,
                'total_users'             => $totalUsers,
                'total_pengajuan'         => $totalPengajuan,
                'pengajuan_hari_ini'      => $pengajuanHariIni,
                'pengaduan_baru'          => $pengaduanBaru,
                'verifikasi_menunggu'     => $verifikasiMenunggu,
                'pengguna_baru_bulan_ini' => $penggunaBulanIni,
            ],
            'chart_mingguan'  => $chartMingguan,
            'recent_logs'     => $recentLogs,
            'recent_pengajuan' => $recentPengajuan,
        ]);
    }

    // ─── Kepala Desa ──────────────────────────────────────────────────────────

    private function kepalaDesa(Request $request): Response
    {
        $totalPengajuan     = PengajuanSurat::count();
        $menungguPengesahan = PengajuanSurat::where('status', 'menunggu_pengesahan')->count();

        // "Disahkan bulan ini" = semua yang sudah melewati tahap pengesahan
        $disahkanBulanIni = PengajuanSurat::whereIn('status', ['disetujui', 'siap_diambil', 'selesai'])
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();

        $ditolakBulanIni = PengajuanSurat::where('status', 'ditolak_kepala')
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();

        $selesaiBulanIni = PengajuanSurat::where('status', 'selesai')
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();

        $totalWarga = User::where('role', 'warga')->count();

        $pengaduanSelesaiBulanIni = Pengaduan::where('status', 'selesai')
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();

        // Hanya pengajuan menunggu pengesahan — untuk tabel aksi kades
        $menungguPengesahanList = PengajuanSurat::with(['user:id,name', 'masterSurat:id,nama_surat'])
            ->where('status', 'menunggu_pengesahan')
            ->oldest()
            ->take(10)
            ->get(['id', 'no_pengajuan', 'user_id', 'master_surat_id', 'status', 'created_at']);

        // Top 5 jenis surat bulan ini (untuk bar chart)
        $chartJenisSurat = MasterSurat::withCount([
                'pengajuanSurat as jumlah' => fn ($q) => $q
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year),
            ])
            ->orderByDesc('jumlah')
            ->take(5)
            ->get(['id', 'nama_surat'])
            ->map(fn ($m) => ['label' => $m->nama_surat, 'jumlah' => $m->jumlah]);

        $totalBulanIni   = PengajuanSurat::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $tingkatSelesai  = $totalBulanIni > 0 ? round(($selesaiBulanIni / $totalBulanIni) * 100) : 0;
        $jenisTerbanyak  = $chartJenisSurat->first()['label'] ?? '—';

        return Inertia::render('dashboard/kepala-desa', [
            'stats' => [
                'menunggu_pengesahan'        => $menungguPengesahan,
                'disahkan_bulan_ini'         => $disahkanBulanIni,
                'pengaduan_selesai_bulan_ini'=> $pengaduanSelesaiBulanIni,
                'total_warga'                => $totalWarga,
                'selesai_bulan_ini'          => $selesaiBulanIni,
                'ditolak_bulan_ini'          => $ditolakBulanIni,
            ],
            'menunggu_pengesahan_list' => $menungguPengesahanList,
            'chart_jenis_surat'        => $chartJenisSurat,
            'ringkasan' => [
                'jenis_terbanyak'    => $jenisTerbanyak,
                'tingkat_penyelesaian' => $tingkatSelesai,
                'total_bulan_ini'    => $totalBulanIni,
            ],
        ]);
    }

    // ─── Warga ────────────────────────────────────────────────────────────────

    private function warga(Request $request): Response
    {
        $user     = $request->user();
        $penduduk = $user->nik ? Penduduk::where('nik', $user->nik)->first() : null;

        // Profil dianggap lengkap kalau 8 field wajib sudah terisi
        $profilLengkap = $penduduk !== null
            && filled($penduduk->nama)
            && filled($penduduk->tempat_lahir)
            && $penduduk->tanggal_lahir !== null
            && filled($penduduk->jenis_kelamin)
            && filled($penduduk->agama)
            && filled($penduduk->status_perkawinan)
            && filled($penduduk->pekerjaan)
            && filled($penduduk->alamat);

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
            'profil_lengkap'   => $profilLengkap,
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
        // Antrian masuk — belum diverifikasi staff
        $menungguVerifikasi = PengajuanSurat::where('status', 'menunggu')->count();

        // Siap cetak — sudah disahkan kades, tinggal staff cetak + TTD fisik
        $siapCetak = PengajuanSurat::where('status', 'disetujui')->count();

        // Siap diambil — sudah dicetak, menunggu warga datang
        $siapDiambil = PengajuanSurat::where('status', 'siap_diambil')->count();

        // Selesai hari ini
        $selesaiHariIni = PengajuanSurat::where('status', 'selesai')
            ->whereDate('updated_at', today())
            ->count();

        $pengaduanBaru = Pengaduan::where('status', 'menunggu')->count();

        // Antrian prioritas: menunggu verifikasi + siap cetak
        $selesaiHariIni = PengajuanSurat::where('status', 'selesai')
            ->whereDate('updated_at', today())
            ->count();

        $antrian = PengajuanSurat::with('user:id,name')
            ->with('masterSurat:id,nama_surat,kode')
            ->whereIn('status', ['menunggu', 'disetujui', 'siap_diambil'])
            ->oldest()
            ->take(15)
            ->get(['id', 'no_pengajuan', 'user_id', 'master_surat_id', 'status', 'created_at']);

        $recentPengaduan = Pengaduan::where('status', 'menunggu')
            ->latest()
            ->take(4)
            ->get(['id', 'judul', 'status', 'created_at']);

        $bukuTamuHariIni = BukuTamu::whereDate('created_at', today())
            ->latest()
            ->take(5)
            ->get(['id', 'nama_pengunjung', 'keperluan', 'instansi', 'created_at']);

        return Inertia::render('dashboard/staff', [
            'stats' => [
                'menunggu_verifikasi' => $menungguVerifikasi,
                'siap_cetak'          => $siapCetak,
                'siap_diambil'        => $siapDiambil,
                'pengaduan_baru'      => $pengaduanBaru,
                'selesai_hari_ini'    => $selesaiHariIni,
            ],
            'antrian'          => $antrian,
            'recent_pengaduan' => $recentPengaduan,
            'buku_tamu_hari_ini' => $bukuTamuHariIni,
        ]);
    }
}
