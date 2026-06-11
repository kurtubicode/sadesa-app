<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Penduduk;
use App\Models\Wilayah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WargaDataDiriController extends Controller
{
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $penduduk = Penduduk::where('nik', $user->nik)->first();

        // Wilayah terdalam (tipe dusun / non-parent) untuk select
        $wilayahList = Wilayah::orderBy('nama')
            ->get(['id', 'nama', 'tipe'])
            ->map(fn ($w) => [
                'id'    => $w->id,
                'label' => $w->nama . ($w->tipe ? ' (' . ucfirst($w->tipe) . ')' : ''),
            ])
            ->values();

        return Inertia::render('warga/data-diri', [
            'penduduk'    => $penduduk ? [
                'id'                => $penduduk->id,
                'nik'               => $penduduk->nik,
                'nama'              => $penduduk->nama,
                'tempat_lahir'      => $penduduk->tempat_lahir,
                'tanggal_lahir'     => $penduduk->tanggal_lahir?->format('Y-m-d'),
                'jenis_kelamin'     => $penduduk->jenis_kelamin,
                'agama'             => $penduduk->agama,
                'status_perkawinan' => $penduduk->status_perkawinan,
                'pekerjaan'         => $penduduk->pekerjaan,
                'alamat'            => $penduduk->alamat,
                'no_kk'             => $penduduk->no_kk,
                'wilayah_id'        => $penduduk->wilayah_id,
            ] : null,
            'wilayahList' => $wilayahList,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->nik) {
            return back()->withErrors(['nik' => 'NIK belum terdaftar di akun Anda. Hubungi admin.']);
        }

        $validated = $request->validate([
            'nama'              => 'required|string|max:100',
            'tempat_lahir'      => 'required|string|max:100',
            'tanggal_lahir'     => 'required|date|before:today',
            'jenis_kelamin'     => 'required|in:L,P',
            'agama'             => 'required|in:islam,kristen,katolik,hindu,buddha,konghucu',
            'status_perkawinan' => 'required|in:belum_kawin,kawin,cerai_hidup,cerai_mati',
            'pekerjaan'         => 'required|string|max:100',
            'alamat'            => 'required|string|max:500',
            'no_kk'             => 'nullable|string|max:20|regex:/^\d{16}$/',
            'wilayah_id'        => 'nullable|exists:wilayah,id',
        ], [
            'no_kk.regex' => 'Nomor KK harus terdiri dari 16 digit angka.',
        ]);

        Penduduk::updateOrCreate(
            ['nik' => $user->nik],
            $validated
        );

        return back()->with('success', 'Data kependudukan berhasil disimpan.');
    }
}
