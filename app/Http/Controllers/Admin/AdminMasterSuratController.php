<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\MasterSurat;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminMasterSuratController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MasterSurat::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_surat', 'like', "%{$request->search}%")
                  ->orWhere('kode', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'aktif');
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        $masterSurat = $query
            ->withCount('pengajuanSurat')
            ->orderBy('kategori')
            ->orderBy('kode')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/master-surat', [
            'masterSurat'  => $masterSurat,
            'filters'      => $request->only('search', 'status', 'kategori'),
            'kategoriList' => MasterSurat::kategoriList(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode'          => 'required|string|max:20|unique:master_surat,kode',
            'kategori'      => 'nullable|string|max:50',
            'nomor_prefix'  => 'nullable|string|max:50',
            'kode_bidang'   => 'nullable|string|max:20',
            'nama_surat'    => 'required|string|max:255',
            'deskripsi'     => 'nullable|string|max:500',
            'persyaratan'   => 'nullable|array',
            'persyaratan.*' => 'string|max:255',
            'is_active'     => 'boolean',
        ]);

        if (isset($validated['persyaratan'])) {
            $validated['persyaratan'] = array_values(
                array_filter($validated['persyaratan'], fn($s) => trim($s) !== '')
            );
        }

        MasterSurat::create($validated);

        return back()->with('success', "Jenis surat \"{$validated['nama_surat']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, MasterSurat $masterSurat): RedirectResponse
    {
        $validated = $request->validate([
            'kode'          => "required|string|max:20|unique:master_surat,kode,{$masterSurat->id}",
            'kategori'      => 'nullable|string|max:50',
            'nomor_prefix'  => 'nullable|string|max:50',
            'kode_bidang'   => 'nullable|string|max:20',
            'nama_surat'    => 'required|string|max:255',
            'deskripsi'     => 'nullable|string|max:500',
            'persyaratan'   => 'nullable|array',
            'persyaratan.*' => 'string|max:255',
            'is_active'     => 'boolean',
        ]);

        if (isset($validated['persyaratan'])) {
            $validated['persyaratan'] = array_values(
                array_filter($validated['persyaratan'], fn($s) => trim($s) !== '')
            );
        }

        $masterSurat->update($validated);

        return back()->with('success', "Jenis surat \"{$masterSurat->nama_surat}\" berhasil diperbarui.");
    }

    public function destroy(MasterSurat $masterSurat): RedirectResponse
    {
        if ($masterSurat->pengajuanSurat()->exists()) {
            return back()->with('error', "Tidak dapat menghapus \"{$masterSurat->nama_surat}\" karena masih ada pengajuan terkait. Nonaktifkan saja.");
        }

        $nama = $masterSurat->nama_surat;
        $masterSurat->delete();

        return back()->with('success', "Jenis surat \"{$nama}\" berhasil dihapus.");
    }

    public function toggleActive(MasterSurat $masterSurat): RedirectResponse
    {
        $masterSurat->update(['is_active' => ! $masterSurat->is_active]);
        $status = $masterSurat->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Jenis surat \"{$masterSurat->nama_surat}\" berhasil {$status}.");
    }

    // ─── Template Editor ──────────────────────────────────────────────────────

    public function editTemplate(MasterSurat $masterSurat): Response
    {
        return Inertia::render('admin/master-surat-template', [
            'surat'        => $masterSurat,
            'kategoriList' => MasterSurat::kategoriList(),
            'settings'     => AppSetting::allAsArray(),
        ]);
    }

    public function updateTemplate(Request $request, MasterSurat $masterSurat): RedirectResponse
    {
        $validated = $request->validate([
            'template'         => 'nullable|array',
            'template.judul'   => 'nullable|string|max:255',
            'template.blocks'  => 'nullable|array',
        ]);

        $masterSurat->update(['template' => $validated['template'] ?? null]);

        return back()->with('success', "Template surat \"{$masterSurat->nama_surat}\" berhasil disimpan.");
    }
}
