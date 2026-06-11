<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriAduan;
use App\Models\Wilayah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminWilayahController extends Controller
{
    // Tipe parent yang valid per tipe wilayah
    private const PARENT_TIPE = [
        'desa'  => null,        // Desa tidak punya parent
        'dusun' => 'desa',
        'rw'    => 'dusun',
        'rt'    => 'rw',
    ];

    public function index(): Response
    {
        // Semua wilayah flat dengan parent name
        $wilayah = Wilayah::with('parent:id,nama,tipe')
            ->withCount('users')
            ->orderByRaw("FIELD(tipe, 'desa', 'dusun', 'rw', 'rt')")
            ->orderBy('parent_id')
            ->orderBy('nama')
            ->get();

        // Semua untuk dropdown parent (akan difilter di frontend)
        $semua = Wilayah::select('id', 'nama', 'tipe')->orderBy('nama')->get();

        $kategori = KategoriAduan::withCount('pengaduan')->orderBy('nama_kategori')->get();

        return Inertia::render('admin/data-master', [
            'wilayah'  => $wilayah,
            'semua'    => $semua,
            'kategori' => $kategori,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nama'      => 'required|string|max:100',
            'tipe'      => ['required', Rule::in(['desa', 'dusun', 'rw', 'rt'])],
            'parent_id' => $this->parentRule($request->tipe),
        ]);

        Wilayah::create($request->only('nama', 'tipe', 'parent_id'));

        return back()->with('success', "Wilayah \"{$request->nama}\" berhasil ditambahkan.");
    }

    public function update(Request $request, Wilayah $wilayah): RedirectResponse
    {
        $request->validate([
            'nama'      => 'required|string|max:100',
            'tipe'      => ['required', Rule::in(['desa', 'dusun', 'rw', 'rt'])],
            'parent_id' => $this->parentRule($request->tipe),
        ]);

        $wilayah->update($request->only('nama', 'tipe', 'parent_id'));

        return back()->with('success', "Wilayah \"{$wilayah->nama}\" berhasil diperbarui.");
    }

    public function destroy(Wilayah $wilayah): RedirectResponse
    {
        if ($wilayah->children()->exists()) {
            return back()->with('error', "Tidak dapat menghapus \"{$wilayah->nama}\" karena masih memiliki sub-wilayah.");
        }
        if ($wilayah->users()->exists()) {
            return back()->with('error', "Tidak dapat menghapus \"{$wilayah->nama}\" karena masih ada pengguna terdaftar di wilayah ini.");
        }

        $nama = $wilayah->nama;
        $wilayah->delete();

        return back()->with('success', "Wilayah \"{$nama}\" berhasil dihapus.");
    }

    private function parentRule(string $tipe): array
    {
        if ($tipe === 'desa') {
            return ['nullable'];
        }
        return ['required', 'exists:wilayah,id'];
    }
}
