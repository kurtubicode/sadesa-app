<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriAduan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminKategoriAduanController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:100|unique:kategori_aduan,nama_kategori',
            'deskripsi'     => 'nullable|string|max:500',
        ]);

        KategoriAduan::create($validated);

        return back()->with('success', "Kategori \"{$validated['nama_kategori']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, KategoriAduan $kategoriAduan): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kategori' => "required|string|max:100|unique:kategori_aduan,nama_kategori,{$kategoriAduan->id}",
            'deskripsi'     => 'nullable|string|max:500',
        ]);

        $kategoriAduan->update($validated);

        return back()->with('success', "Kategori \"{$kategoriAduan->nama_kategori}\" berhasil diperbarui.");
    }

    public function destroy(KategoriAduan $kategoriAduan): RedirectResponse
    {
        if ($kategoriAduan->pengaduan()->exists()) {
            return back()->with('error', "Tidak dapat menghapus \"{$kategoriAduan->nama_kategori}\" karena masih ada pengaduan terkait.");
        }

        $nama = $kategoriAduan->nama_kategori;
        $kategoriAduan->delete();

        return back()->with('success', "Kategori \"{$nama}\" berhasil dihapus.");
    }
}
