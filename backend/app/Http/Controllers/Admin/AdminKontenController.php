<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\KontenDesa;
use App\Models\User;
use App\Notifications\InformasiDesaNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminKontenController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KontenDesa::with('admin:id,name')
            ->select('id', 'admin_id', 'judul', 'slug', 'tipe', 'status', 'created_at');

        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('judul', 'like', "%{$request->search}%");
        }

        $konten = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/konten', [
            'konten'  => $konten,
            'filters' => $request->only('tipe', 'status', 'search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'judul'  => 'required|string|max:255',
            'konten' => 'required|string',
            'tipe'   => 'required|in:berita,pengumuman',
            'status' => 'required|in:draft,published',
        ]);

        $konten = KontenDesa::create([
            ...$data,
            'slug'     => KontenDesa::buatSlug($data['judul']),
            'admin_id' => auth()->id(),
        ]);

        AuditLog::catat('buat_konten', KontenDesa::class, $konten->id);

        // Kirim notifikasi ke semua warga aktif saat langsung dipublish
        if ($konten->status === 'published') {
            $this->broadcastInformasi($konten);
        }

        return back()->with('success', 'Konten berhasil dibuat.');
    }

    public function update(Request $request, KontenDesa $konten): RedirectResponse
    {
        $data = $request->validate([
            'judul'  => 'required|string|max:255',
            'konten' => 'required|string',
            'tipe'   => 'required|in:berita,pengumuman',
            'status' => 'required|in:draft,published',
        ]);

        // Regenerate slug hanya jika judul berubah
        if ($data['judul'] !== $konten->judul) {
            $data['slug'] = KontenDesa::buatSlug($data['judul']);
        }

        $wasDraft = $konten->status === 'draft';
        $konten->update($data);
        AuditLog::catat('update_konten', KontenDesa::class, $konten->id);

        // Kirim notifikasi jika baru dipublish dari draft
        if ($wasDraft && $konten->fresh()->status === 'published') {
            $this->broadcastInformasi($konten->fresh());
        }

        return back()->with('success', 'Konten berhasil diperbarui.');
    }

    // ─── Broadcast ke semua warga aktif ──────────────────────────────────────

    private function broadcastInformasi(KontenDesa $konten): void
    {
        try {
            User::where('role', 'warga')->where('status', 'aktif')
                ->each(fn ($u) => $u->notify(new InformasiDesaNotification($konten)));
        } catch (\Throwable) { /* silent */ }
    }

    public function destroy(KontenDesa $konten): RedirectResponse
    {
        AuditLog::catat('hapus_konten', KontenDesa::class, $konten->id, ['judul' => $konten->judul]);
        $konten->delete();

        return back()->with('success', 'Konten berhasil dihapus.');
    }
}
