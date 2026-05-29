<?php

namespace App\Http\Controllers;

use App\Models\BukuTamu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BukuTamuController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('buku-tamu');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nama_pengunjung' => 'required|string|max:255',
            'instansi'        => 'nullable|string|max:255',
            'keperluan'       => 'required|string|max:500',
            'no_hp'           => ['nullable', 'string', 'max:15', 'regex:/^[0-9+\-\s]+$/'],
        ], [
            'nama_pengunjung.required' => 'Nama pengunjung wajib diisi.',
            'keperluan.required'       => 'Keperluan kunjungan wajib diisi.',
            'no_hp.regex'              => 'Format nomor HP tidak valid.',
        ]);

        BukuTamu::create([
            'nama_pengunjung' => $request->nama_pengunjung,
            'instansi'        => $request->instansi,
            'keperluan'       => $request->keperluan,
            'no_hp'           => $request->no_hp,
            'waktu_kunjungan' => now(),
        ]);

        return back()->with('sukses', 'Terima kasih! Data kunjungan Anda telah tercatat. Silakan masuk ke loket pelayanan.');
    }
}
