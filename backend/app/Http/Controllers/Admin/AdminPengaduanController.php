<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Pengaduan;
use App\Models\TanggapanPengaduan;
use App\Notifications\PengaduanTanggapanNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminPengaduanController extends Controller
{
    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $query = Pengaduan::with([
            'user:id,name',
            'kategori:id,nama_kategori',
        ])->select('id', 'user_id', 'kategori_aduan_id', 'judul', 'status', 'created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('judul', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }

        $pengaduan = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/pengaduan', [
            'pengaduan' => $pengaduan,
            'filters'   => $request->only('status', 'search'),
        ]);
    }

    // ─── Show ─────────────────────────────────────────────────────────────────

    public function show(Pengaduan $pengaduan): Response
    {
        $pengaduan->load([
            'user:id,name,nik,phone',
            'kategori:id,nama_kategori',
            'bukti:id,pengaduan_id,path_file',
            'tanggapan.user:id,name,role',
        ]);

        return Inertia::render('admin/pengaduan-detail', [
            'pengaduan' => $pengaduan,
        ]);
    }

    // ─── Tanggapi ─────────────────────────────────────────────────────────────

    public function tanggapi(Request $request, Pengaduan $pengaduan): RedirectResponse
    {
        $request->validate([
            'isi_tanggapan' => 'required|string|max:2000',
        ]);

        TanggapanPengaduan::create([
            'pengaduan_id'  => $pengaduan->id,
            'user_id'       => $request->user()->id,
            'isi_tanggapan' => $request->isi_tanggapan,
        ]);

        // Otomatis ubah status ke diproses jika masih menunggu
        if ($pengaduan->status === 'menunggu') {
            $pengaduan->update(['status' => 'diproses']);
        }

        AuditLog::catat('tanggapi_pengaduan', 'Pengaduan', $pengaduan->id, [
            'isi' => $request->isi_tanggapan,
        ]);

        // Kirim notifikasi ke pelapor
        $pengaduan->load('user');
        try {
            $pengaduan->user->notify(new PengaduanTanggapanNotification(
                $pengaduan,
                $request->isi_tanggapan,
                $request->user()->name
            ));
        } catch (\Throwable) { /* silent */ }

        return back()->with('success', 'Tanggapan berhasil dikirim.');
    }

    // ─── Update Status ────────────────────────────────────────────────────────

    public function updateStatus(Request $request, Pengaduan $pengaduan): RedirectResponse
    {
        $request->validate([
            'status'  => ['required', Rule::in(['menunggu', 'diproses', 'selesai', 'ditolak'])],
            'catatan' => 'nullable|string|max:1000',
        ]);

        $statusLama = $pengaduan->status;
        $pengaduan->update([
            'status'  => $request->status,
        ]);

        AuditLog::catat('ubah_status_pengaduan', 'Pengaduan', $pengaduan->id, [
            'status_lama' => $statusLama,
            'status_baru' => $request->status,
            'catatan'     => $request->catatan,
        ]);

        // Jika ada catatan, simpan sebagai tanggapan sistem
        if ($request->filled('catatan')) {
            TanggapanPengaduan::create([
                'pengaduan_id'  => $pengaduan->id,
                'user_id'       => $request->user()->id,
                'isi_tanggapan' => '[Status diubah ke ' . strtoupper($request->status) . '] ' . $request->catatan,
            ]);
        }

        $label = ['menunggu' => 'Menunggu', 'diproses' => 'Diproses', 'selesai' => 'Selesai', 'ditolak' => 'Ditolak'];

        return back()->with('success', 'Status pengaduan diubah ke "' . ($label[$request->status] ?? $request->status) . '".');
    }
}
