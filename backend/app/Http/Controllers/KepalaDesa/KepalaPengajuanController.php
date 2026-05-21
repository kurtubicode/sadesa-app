<?php

namespace App\Http\Controllers\KepalaDesa;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PengajuanSurat;
use App\Models\PengesahanPermohonan;
use App\Models\SuratOutput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'dokumenPersyaratan:id,pengajuan_id,nama_file,path_file,jenis_dokumen,created_at',
            'verifikasiBerkas.staff:id,name',
            'pengesahanPermohonan.kepalaDesa:id,name',
            'suratOutput:id,pengajuan_id,no_surat,path_file,tanggal_surat,created_at',
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
            ? 'Pengajuan berhasil disetujui. Silakan upload surat yang sudah ditandatangani.'
            : 'Pengajuan ditolak.';

        return redirect("/kepala-desa/pengajuan/{$pengajuan->id}")->with('success', $pesan);
    }

    // ─── Upload Surat Output ──────────────────────────────────────────────────

    /**
     * POST /kepala-desa/pengajuan/{pengajuan}/surat
     * Upload PDF surat yang sudah ditandatangani → status menjadi selesai.
     */
    public function uploadSurat(Request $request, PengajuanSurat $pengajuan): RedirectResponse
    {
        if ($pengajuan->status !== 'disetujui') {
            return back()->withErrors(['file' => 'Surat hanya dapat diupload setelah pengajuan disetujui.']);
        }

        $request->validate([
            'file'          => 'required|file|mimes:pdf|max:10240',
            'no_surat'      => 'required|string|max:100',
            'tanggal_surat' => 'required|date',
        ]);

        // Hapus surat lama jika ada
        if ($pengajuan->suratOutput) {
            Storage::disk('public')->delete($pengajuan->suratOutput->path_file);
            $pengajuan->suratOutput->delete();
        }

        $path = $request->file('file')->store("surat-output/{$pengajuan->id}", 'public');

        SuratOutput::create([
            'pengajuan_id'  => $pengajuan->id,
            'no_surat'      => $request->no_surat,
            'path_file'     => $path,
            'tanggal_surat' => $request->tanggal_surat,
        ]);

        // Set status pengajuan → selesai
        $pengajuan->update(['status' => 'selesai']);

        AuditLog::catat(
            'upload_surat_output',
            'PengajuanSurat',
            $pengajuan->id,
            ['no_surat' => $request->no_surat, 'path_file' => $path]
        );

        return back()->with('success', 'Surat berhasil diupload. Status pengajuan sekarang Selesai.');
    }
}
