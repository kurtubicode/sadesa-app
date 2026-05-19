<?php

namespace App\Http\Controllers\KepalaDesa;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PengajuanSurat;
use App\Models\PengesahanPermohonan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KepalaPengajuanController extends Controller
{
    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $query = PengajuanSurat::with([
            'user:id,name,nik',
            'masterSurat:id,nama_surat,kode',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: yang perlu pengesahan kepala desa
            $query->whereIn('status', ['menunggu_pengesahan', 'disetujui', 'ditolak_kepala']);
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

    public function show(PengajuanSurat $pengajuan): Response
    {
        $pengajuan->load([
            'user:id,name,nik,email,phone',
            'masterSurat:id,nama_surat,kode,persyaratan',
            'dokumenPersyaratan:id,pengajuan_id,nama_file,tipe,created_at',
            'verifikasiBerkas.staff:id,name',
            'pengesahanPermohonan.kepalaDesa:id,name',
        ]);

        return Inertia::render('kepala-desa/pengajuan-detail', [
            'pengajuan' => $pengajuan,
        ]);
    }

    // ─── Pengesahan ───────────────────────────────────────────────────────────

    public function pengesahan(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        $request->validate([
            'action'  => ['required', Rule::in(['setujui', 'tolak'])],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($pengajuan->status !== 'menunggu_pengesahan') {
            return back()->withErrors(['action' => 'Pengajuan ini tidak dapat disahkan.']);
        }

        $action  = $request->action;
        $catatan = $request->catatan;

        $newStatus = $action === 'setujui' ? 'disetujui' : 'ditolak_kepala';

        // Update status pengajuan
        $pengajuan->update([
            'status'  => $newStatus,
            'catatan' => $catatan,
        ]);

        // Simpan/perbarui record pengesahan_permohonan
        PengesahanPermohonan::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'kepala_desa_id' => $request->user()->id,
                'status'         => $action === 'setujui' ? 'disetujui' : 'ditolak',
                'catatan'        => $catatan,
            ]
        );

        // Catat audit log
        AuditLog::catat(
            'pengesahan_pengajuan_' . $action,
            'PengajuanSurat',
            $pengajuan->id,
            ['status_baru' => $newStatus, 'catatan' => $catatan]
        );

        $pesan = $action === 'setujui'
            ? 'Pengajuan berhasil disetujui.'
            : 'Pengajuan ditolak.';

        return redirect('/kepala-desa/pengajuan')->with('success', $pesan);
    }
}
