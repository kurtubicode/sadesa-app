<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

        $masterSurat = $query
            ->withCount('pengajuanSurat')
            ->orderBy('kode')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/master-surat', [
            'masterSurat' => $masterSurat,
            'filters'     => $request->only('search', 'status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode'         => 'required|string|max:20|unique:master_surat,kode',
            'nama_surat'   => 'required|string|max:255',
            'persyaratan'  => 'nullable|array',
            'persyaratan.*'=> 'string|max:255',
            'template'     => 'nullable|string',
            'is_active'    => 'boolean',
        ]);

        // Hapus elemen kosong dari persyaratan
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
            'kode'         => "required|string|max:20|unique:master_surat,kode,{$masterSurat->id}",
            'nama_surat'   => 'required|string|max:255',
            'persyaratan'  => 'nullable|array',
            'persyaratan.*'=> 'string|max:255',
            'template'     => 'nullable|string',
            'is_active'    => 'boolean',
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
        // Cegah hapus jika masih ada pengajuan terkait
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
}
