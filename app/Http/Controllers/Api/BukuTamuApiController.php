<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BukuTamu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BukuTamuApiController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama_pengunjung' => 'required|string|max:255',
            'instansi'        => 'nullable|string|max:255',
            'keperluan'       => 'required|string|max:500',
            'no_hp'           => ['nullable', 'string', 'max:15', 'regex:/^[0-9+\-\s]+$/'],
        ]);

        $entry = BukuTamu::create([
            'nama_pengunjung' => $request->nama_pengunjung,
            'instansi'        => $request->instansi,
            'keperluan'       => $request->keperluan,
            'no_hp'           => $request->no_hp,
            'waktu_kunjungan' => now(),
        ]);

        return response()->json([
            'message' => 'Terima kasih! Data kunjungan Anda telah tercatat.',
            'data'    => [
                'id'              => $entry->id,
                'nama_pengunjung' => $entry->nama_pengunjung,
                'waktu_kunjungan' => $entry->waktu_kunjungan,
            ],
        ], 201);
    }
}
