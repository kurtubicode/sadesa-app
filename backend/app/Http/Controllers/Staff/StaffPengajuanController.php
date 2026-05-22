<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PengajuanSurat;
use App\Models\VerifikasiBerkas;
use App\Notifications\StatusSuratNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffPengajuanController extends Controller
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
            // Default: hanya tampilkan yang perlu diproses staff
            $query->whereIn('status', ['menunggu', 'diproses']);
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

    public function show(PengajuanSurat $pengajuan): Response
    {
        $pengajuan->load([
            'user:id,name,nik,email,phone',
            'masterSurat:id,nama_surat,kode,persyaratan',
            'dokumenPersyaratan:id,pengajuan_id,nama_file,path_file,jenis_dokumen,created_at',
            'verifikasiBerkas.staff:id,name',
        ]);

        return Inertia::render('staff/pengajuan-detail', [
            'pengajuan' => $pengajuan,
        ]);
    }

    // ─── Verifikasi ───────────────────────────────────────────────────────────

    public function verifikasi(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        $request->validate([
            'action'  => ['required', Rule::in(['setujui', 'tolak', 'revisi'])],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        // Pastikan pengajuan ada di status yang bisa diverifikasi staff
        if (! in_array($pengajuan->status, ['menunggu', 'diproses', 'diverifikasi'])) {
            return back()->withErrors(['action' => 'Pengajuan ini tidak dapat diverifikasi.']);
        }

        $action  = $request->action;
        $catatan = $request->catatan;

        $newStatus = match ($action) {
            'setujui' => 'menunggu_pengesahan',
            'tolak'   => 'ditolak_staff',
            'revisi'  => 'diverifikasi',   // kembalikan ke warga untuk perbaikan dokumen
            default   => 'diproses',
        };

        // Update status pengajuan
        $pengajuan->update([
            'status'  => $newStatus,
            'catatan' => $catatan,
        ]);

        // Simpan/perbarui record verifikasi_berkas
        VerifikasiBerkas::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'staff_id' => $request->user()->id,
                'status'   => $action === 'setujui' ? 'disetujui' : 'ditolak',
                'catatan'  => $catatan,
            ]
        );

        // Catat audit log
        AuditLog::catat(
            'verifikasi_pengajuan_' . $action,
            'PengajuanSurat',
            $pengajuan->id,
            ['status_baru' => $newStatus, 'catatan' => $catatan]
        );

        // Kirim notifikasi ke warga
        $pengajuan->load('user');
        try {
            $pengajuan->user->notify(new StatusSuratNotification($pengajuan));
        } catch (\Throwable) { /* silent — jangan gagalkan request */ }

        $pesan = match ($action) {
            'setujui' => 'Pengajuan berhasil diverifikasi dan diteruskan ke Kepala Desa.',
            'tolak'   => 'Pengajuan ditolak.',
            'revisi'  => 'Pengajuan dikembalikan ke pemohon untuk perbaikan dokumen.',
            default   => 'Status pengajuan diperbarui.',
        };

        return redirect('/staff/pengajuan')->with('success', $pesan);
    }
}
