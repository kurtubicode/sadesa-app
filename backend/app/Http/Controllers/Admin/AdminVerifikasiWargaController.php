<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerifikasiWarga;
use App\Notifications\VerifikasiStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVerifikasiWargaController extends Controller
{
    /**
     * Daftar warga yang menunggu verifikasi.
     */
    public function index(Request $request): Response
    {
        $filter = $request->query('filter', 'menunggu'); // menunggu|disetujui|ditolak|semua

        $query = VerifikasiWarga::with('user:id,name,email,nik,phone,wilayah_id')
            ->latest();

        if ($filter !== 'semua') {
            $query->where('status', $filter);
        }

        $data = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/verifikasi-warga', [
            'data'   => $data,
            'filter' => $filter,
        ]);
    }

    /**
     * Detail pengajuan verifikasi seorang warga.
     */
    public function show(VerifikasiWarga $verifikasiWarga): Response
    {
        $verifikasiWarga->load('user:id,name,email,nik,phone,status,wilayah_id', 'reviewer:id,name');

        return Inertia::render('admin/verifikasi-warga-detail', [
            'verifikasi' => $verifikasiWarga,
            'foto_ktp_url' => asset('storage/' . $verifikasiWarga->foto_ktp),
            'foto_kk_url'  => $verifikasiWarga->foto_kk ? asset('storage/' . $verifikasiWarga->foto_kk) : null,
        ]);
    }

    /**
     * Proses tindakan: setujui atau tolak.
     */
    public function proses(Request $request, VerifikasiWarga $verifikasiWarga): RedirectResponse
    {
        $request->validate([
            'aksi'    => 'required|in:setujui,tolak',
            'catatan' => 'nullable|string|max:500',
        ]);

        $aksi = $request->aksi;
        $user = $verifikasiWarga->user;

        if ($aksi === 'setujui') {
            $verifikasiWarga->update([
                'status'      => 'disetujui',
                'catatan'     => $request->catatan,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);
            // Aktifkan akun warga
            $user->update(['status' => 'aktif']);
        } else {
            $verifikasiWarga->update([
                'status'      => 'ditolak',
                'catatan'     => $request->catatan,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);
            // Tetap menunggu_verifikasi — warga bisa upload ulang
        }

        // Kirim notifikasi ke warga
        try {
            $user->notify(new VerifikasiStatusNotification($aksi, $request->catatan));
        } catch (\Throwable) { /* silent */ }

        return redirect()->route('admin.verifikasi-warga.index')
            ->with('success', $aksi === 'setujui'
                ? "Akun {$user->name} berhasil diverifikasi dan diaktifkan."
                : "Pengajuan verifikasi {$user->name} ditolak."
            );
    }
}
