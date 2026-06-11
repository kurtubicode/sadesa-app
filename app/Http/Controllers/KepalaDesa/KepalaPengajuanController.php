<?php

namespace App\Http\Controllers\KepalaDesa;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PengajuanSurat;
use App\Models\PengesahanPermohonan;
use App\Notifications\StatusSuratNotification;
use App\Services\SuratService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KepalaPengajuanController extends Controller
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
            $query->whereIn('status', ['menunggu_pengesahan', 'disetujui', 'siap_diambil', 'ditolak_kepala']);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('no_pengajuan', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }

        $pengajuan = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('kepala-desa/pengajuan', [
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

        $penduduk = \App\Models\Penduduk::where('nik', $pengajuan->user->nik)->first();

        return Inertia::render('kepala-desa/pengajuan-detail', [
            'pengajuan' => $pengajuan,
            'penduduk'  => $penduduk,
        ]);
    }

    // ─── Preview surat (HTML, on-the-fly) ────────────────────────────────────

    public function previewSurat(PengajuanSurat $pengajuan): Response
    {
        if (! in_array($pengajuan->status, [
            'menunggu_pengesahan', 'disetujui', 'siap_diambil', 'selesai',
        ])) {
            abort(403, 'Preview tidak tersedia untuk status ini.');
        }

        $html = $this->suratService->previewHtml($pengajuan);

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    // ─── Pengesahan ───────────────────────────────────────────────────────────
    //
    //  setujui → status: disetujui + auto-generate PDF → surat_output
    //  tolak   → status: ditolak_kepala

    public function pengesahan(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        $request->validate([
            'action'  => ['required', Rule::in(['setujui', 'tolak'])],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($pengajuan->status !== 'menunggu_pengesahan') {
            return back()->withErrors(['action' => 'Pengajuan ini tidak dapat disahkan.']);
        }

        $action    = $request->action;
        $catatan   = $request->catatan;
        $newStatus = $action === 'setujui' ? 'disetujui' : 'ditolak_kepala';

        $pengajuan->update(['status' => $newStatus, 'catatan' => $catatan]);

        PengesahanPermohonan::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'kepala_desa_id' => $request->user()->id,
                'status'         => $action === 'setujui' ? 'disetujui' : 'ditolak',
                'catatan'        => $catatan,
            ]
        );

        AuditLog::catat(
            'pengesahan_pengajuan_' . $action,
            'PengajuanSurat',
            $pengajuan->id,
            ['status_baru' => $newStatus, 'catatan' => $catatan]
        );

        // Jika disetujui → auto-generate PDF surat
        if ($action === 'setujui') {
            try {
                $pengajuan->loadMissing('masterSurat');
                $this->suratService->generateAndStore($pengajuan);
            } catch (\Throwable $e) {
                // Gagal generate tidak membatalkan pengesahan — staff bisa retry
                AuditLog::catat(
                    'generate_surat_gagal',
                    'PengajuanSurat',
                    $pengajuan->id,
                    ['error' => $e->getMessage()]
                );
            }
        }

        $pengajuan->load('user');
        try {
            $pengajuan->user->notify(new StatusSuratNotification($pengajuan));
        } catch (\Throwable) { /* silent */ }

        $pesan = $action === 'setujui'
            ? 'Pengajuan disahkan. Surat telah di-generate dan siap dicetak oleh staff.'
            : 'Pengajuan ditolak.';

        return redirect("/kepala-desa/pengajuan/{$pengajuan->id}")->with('success', $pesan);
    }

}
