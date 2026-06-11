<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PengajuanSurat;
use App\Models\VerifikasiBerkas;
use App\Notifications\StatusSuratNotification;
use App\Services\SuratService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class StaffPengajuanController extends Controller
{
    public function __construct(private SuratService $suratService) {}

    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request): InertiaResponse
    {
        $query = PengajuanSurat::with([
            'user:id,name,nik',
            'masterSurat:id,nama_surat,kode',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->whereIn('status', ['menunggu', 'diproses', 'disetujui', 'siap_diambil']);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('no_pengajuan', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }

        $pengajuan = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('staff/pengajuan', [
            'pengajuan' => $pengajuan,
            'filters'   => $request->only('status', 'search'),
        ]);
    }

    // ─── Show ─────────────────────────────────────────────────────────────────

    public function show(PengajuanSurat $pengajuan): InertiaResponse
    {
        $pengajuan->load([
            'user:id,name,nik,email,phone',
            'masterSurat:id,nama_surat,kode,persyaratan',
            'dokumenPersyaratan:id,pengajuan_id,nama_file,path_file,jenis_dokumen,created_at',
            'verifikasiBerkas.staff:id,name',
            'pengesahanPermohonan.kepalaDesa:id,name',
            'suratOutput:id,pengajuan_id,no_surat,path_file,tanggal_surat,created_at',
        ]);

        // Data kependudukan warga untuk ditampilkan di panel kiri split screen
        $penduduk = \App\Models\Penduduk::where('nik', $pengajuan->user->nik)->first();

        return Inertia::render('staff/pengajuan-detail', [
            'pengajuan' => $pengajuan,
            'penduduk'  => $penduduk,
        ]);
    }

    // ─── Preview surat (HTML, on-the-fly) ────────────────────────────────────
    //
    //  Hanya bisa diakses jika status sudah melewati verifikasi staff
    //  (menunggu_pengesahan ke atas) — staff perlu preview sebelum dan
    //  sesudah kades sahkan.

    public function previewSurat(PengajuanSurat $pengajuan): Response
    {
        if (! in_array($pengajuan->status, [
            'diverifikasi', 'menunggu_pengesahan',
            'disetujui', 'siap_diambil', 'selesai',
        ])) {
            abort(403, 'Preview belum tersedia untuk status ini.');
        }

        $html = $this->suratService->previewHtml($pengajuan);

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    // ─── Verifikasi ───────────────────────────────────────────────────────────

    public function verifikasi(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        $request->validate([
            'action'  => ['required', Rule::in(['setujui', 'tolak'])],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! in_array($pengajuan->status, ['menunggu', 'diproses'])) {
            return back()->withErrors(['action' => 'Pengajuan tidak dapat diverifikasi pada status ini.']);
        }

        $action    = $request->action;
        $catatan   = $request->catatan;
        $newStatus = $action === 'setujui' ? 'menunggu_pengesahan' : 'ditolak_staff';

        $pengajuan->update(['status' => $newStatus, 'catatan' => $catatan]);

        VerifikasiBerkas::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'staff_id' => $request->user()->id,
                'status'   => $action === 'setujui' ? 'disetujui' : 'ditolak',
                'catatan'  => $catatan,
            ]
        );

        AuditLog::catat(
            'verifikasi_pengajuan_' . $action,
            'PengajuanSurat',
            $pengajuan->id,
            ['status_baru' => $newStatus, 'catatan' => $catatan]
        );

        $pengajuan->load('user');
        try {
            $pengajuan->user->notify(new StatusSuratNotification($pengajuan));
        } catch (\Throwable) { /* silent */ }

        $pesan = $action === 'setujui'
            ? 'Pengajuan diverifikasi dan diteruskan ke Kepala Desa.'
            : 'Pengajuan ditolak.';

        return redirect("/staff/pengajuan/{$pengajuan->id}")->with('success', $pesan);
    }

    // ─── Siap Diambil — staff set setelah cetak & TTD fisik ──────────────────

    public function siapDiambil(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        if ($pengajuan->status !== 'disetujui') {
            return back()->withErrors(['status' => 'Surat belum disahkan kepala desa.']);
        }

        if (! $pengajuan->suratOutput) {
            return back()->withErrors(['status' => 'File surat belum digenerate.']);
        }

        $pengajuan->update(['status' => 'siap_diambil']);

        AuditLog::catat('surat_siap_diambil', 'PengajuanSurat', $pengajuan->id);

        // Notifikasi ke warga
        $pengajuan->load('user');
        try {
            $pengajuan->user->notify(new StatusSuratNotification($pengajuan));
        } catch (\Throwable) { /* silent */ }

        return back()->with('success', 'Status diperbarui. Warga telah dinotifikasi bahwa surat siap diambil.');
    }

    // ─── Selesai — konfirmasi surat sudah diambil warga ──────────────────────

    public function selesai(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        if ($pengajuan->status !== 'siap_diambil') {
            return back()->withErrors(['status' => 'Status harus "Siap Diambil" terlebih dahulu.']);
        }

        $pengajuan->update(['status' => 'selesai']);

        AuditLog::catat('surat_selesai_diambil', 'PengajuanSurat', $pengajuan->id);

        return back()->with('success', 'Pengajuan ditandai selesai. Surat sudah diambil oleh warga.');
    }

    // ─── Download / cetak PDF ─────────────────────────────────────────────────
    //
    //  Staff download PDF yang sudah di-generate setelah kades sahkan,
    //  lalu cetak & minta TTD fisik kades, kemudian set siap_diambil.

    public function downloadSurat(PengajuanSurat $pengajuan): Response
    {
        if (! in_array($pengajuan->status, ['disetujui', 'siap_diambil', 'selesai'])) {
            abort(403, 'Surat belum tersedia untuk diunduh.');
        }

        $pengajuan->loadMissing(['masterSurat', 'suratOutput']);

        return $this->suratService->streamPdf($pengajuan);
    }
}
