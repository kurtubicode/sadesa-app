<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VerifikasiWarga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VerifikasiWargaController extends Controller
{
    /**
     * Upload dokumen KTP/KK untuk verifikasi.
     * Bisa dipanggil oleh warga dengan status menunggu_verifikasi atau aktif.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'foto_ktp' => 'required|image|max:5120', // max 5 MB
            'foto_kk'  => 'nullable|image|max:5120',
        ]);

        $user = $request->user();

        // Hapus data lama jika ada (re-upload)
        $existing = VerifikasiWarga::where('user_id', $user->id)->first();
        if ($existing) {
            Storage::disk('public')->delete($existing->foto_ktp);
            if ($existing->foto_kk) {
                Storage::disk('public')->delete($existing->foto_kk);
            }
            $existing->delete();
        }

        $dir = "verifikasi/{$user->id}";

        $pathKtp = $request->file('foto_ktp')->store($dir, 'public');
        $pathKk  = $request->hasFile('foto_kk')
            ? $request->file('foto_kk')->store($dir, 'public')
            : null;

        $verifikasi = VerifikasiWarga::create([
            'user_id'  => $user->id,
            'foto_ktp' => $pathKtp,
            'foto_kk'  => $pathKk,
            'status'   => 'menunggu',
        ]);

        return response()->json([
            'message' => 'Dokumen berhasil diunggah. Mohon tunggu konfirmasi Admin.',
            'data'    => [
                'id'        => $verifikasi->id,
                'status'    => $verifikasi->status,
                'created_at'=> $verifikasi->created_at->format('d M Y · H:i'),
            ],
        ], 201);
    }

    /**
     * Cek status pengajuan verifikasi milik warga yang login.
     */
    public function status(Request $request): JsonResponse
    {
        $user       = $request->user();
        $verifikasi = VerifikasiWarga::where('user_id', $user->id)->first();

        return response()->json([
            'data' => [
                'user_status' => $user->status,
                'dokumen'     => $verifikasi ? [
                    'id'          => $verifikasi->id,
                    'status'      => $verifikasi->status,
                    'catatan'     => $verifikasi->catatan,
                    'submitted_at'=> $verifikasi->created_at->format('d M Y · H:i'),
                    'reviewed_at' => $verifikasi->reviewed_at?->format('d M Y · H:i'),
                ] : null,
            ],
        ]);
    }
}
