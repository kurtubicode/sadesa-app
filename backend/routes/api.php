<?php

use App\Http\Controllers\Api\PengaduanController;
use App\Http\Controllers\Api\PengesahanController;
use App\Http\Controllers\Api\PengajuanSuratController;
use App\Http\Controllers\Api\VerifikasiController;
use App\Models\KategoriAduan;
use App\Models\KontenDesa;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

// ═══════════════════════════════════════════════════════════════
// PUBLIC — tidak perlu token
// ═══════════════════════════════════════════════════════════════

Route::post('/register', function (Request $request) {
    $request->validate([
        'nik'        => 'required|string|size:16|unique:users,nik',
        'name'       => 'required|string|max:255',
        'email'      => 'required|email|unique:users,email',
        'password'   => 'required|string|min:8|confirmed',
        'phone'      => 'nullable|string|max:15',
        'wilayah_id' => 'nullable|exists:wilayah,id',
    ]);

    $user = User::create([
        'nik'        => $request->nik,
        'name'       => $request->name,
        'email'      => $request->email,
        'password'   => $request->password,
        'phone'      => $request->phone,
        'role'       => 'warga',
        'status'     => 'menunggu_verifikasi',
        'wilayah_id' => $request->wilayah_id,
    ]);

    return response()->json([
        'message' => 'Registrasi berhasil. Akun Anda sedang menunggu verifikasi dari Admin.',
        'user'    => [
            'id'     => $user->id,
            'nik'    => $user->nik,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'status' => $user->status,
        ],
    ], 201);
});

Route::post('/login', function (Request $request) {
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    if ($user->status === 'menunggu_verifikasi') {
        return response()->json(['message' => 'Akun Anda belum diverifikasi oleh Admin. Silakan tunggu konfirmasi.'], 403);
    }

    if ($user->status === 'nonaktif') {
        return response()->json(['message' => 'Akun Anda telah dinonaktifkan. Hubungi Admin desa.'], 403);
    }

    $token = $user->createToken('sadesa-mobile')->plainTextToken;

    return response()->json([
        'message' => 'Login berhasil.',
        'user'    => [
            'id'         => $user->id,
            'nik'        => $user->nik,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'role'       => $user->role,
            'status'     => $user->status,
            'wilayah_id' => $user->wilayah_id,
        ],
        'token' => $token,
    ]);
});

// Daftar jenis surat (boleh diakses publik)
Route::get('/master-surat', [PengajuanSuratController::class, 'masterSurat']);

// Daftar wilayah (untuk dropdown form registrasi)
Route::get('/wilayah', function () {
    $wilayah = Wilayah::orderByRaw("FIELD(tipe,'desa','dusun','rw','rt')")
        ->orderBy('nama')
        ->get(['id', 'nama', 'tipe', 'parent_id']);
    return response()->json(['data' => $wilayah]);
});

// Kategori aduan (publik)
Route::get('/kategori-aduan', fn () => response()->json([
    'data' => KategoriAduan::orderBy('nama_kategori')->get(['id', 'nama_kategori', 'deskripsi']),
]));

// Informasi desa — berita & pengumuman publik
Route::get('/informasi', fn () => response()->json([
    'data' => KontenDesa::published()
        ->orderByDesc('created_at')
        ->get(['id', 'judul', 'slug', 'tipe', 'created_at']),
]));

Route::get('/informasi/{slug}', function (string $slug) {
    $konten = KontenDesa::published()->where('slug', $slug)->firstOrFail();
    return response()->json(['data' => $konten]);
});

// Tes koneksi (development)
Route::get('/tes-koneksi', fn() => response()->json(['status' => 'ok', 'pesan' => 'Koneksi ke API SADESA berhasil!']));

// ═══════════════════════════════════════════════════════════════
// PROTECTED — semua role yang sudah login
// ═══════════════════════════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil.']);
    });

    Route::get('/user', function (Request $request) {
        return response()->json(['user' => $request->user()->load('wilayah')]);
    });

    // ─── WARGA ────────────────────────────────────────────────
    Route::middleware('role:warga')->group(function () {
        // Pengajuan surat
        Route::get('/pengajuan',                          [PengajuanSuratController::class, 'index']);
        Route::post('/pengajuan',                         [PengajuanSuratController::class, 'store']);
        Route::get('/pengajuan/{id}',                     [PengajuanSuratController::class, 'show']);
        Route::post('/pengajuan/{id}/dokumen',            [PengajuanSuratController::class, 'uploadDokumen']);
        Route::delete('/pengajuan/{id}',                  [PengajuanSuratController::class, 'batalkan']);

        // Pengaduan
        Route::get('/pengaduan',                          [PengaduanController::class, 'index']);
        Route::post('/pengaduan',                         [PengaduanController::class, 'store']);
        Route::get('/pengaduan/{id}',                     [PengaduanController::class, 'show']);
    });

    // ─── STAFF ────────────────────────────────────────────────
    Route::middleware('role:staff,admin')->prefix('staff')->group(function () {
        Route::get('/pengajuan',                          [VerifikasiController::class, 'index']);
        Route::get('/pengajuan/{id}',                     [VerifikasiController::class, 'show']);
        Route::post('/pengajuan/{id}/verifikasi',         [VerifikasiController::class, 'verifikasi']);
    });

    // ─── KEPALA DESA ──────────────────────────────────────────
    Route::middleware('role:kepala_desa,admin')->prefix('kepala-desa')->group(function () {
        Route::get('/pengajuan',                          [PengesahanController::class, 'index']);
        Route::get('/pengajuan/{id}',                     [PengesahanController::class, 'show']);
        Route::post('/pengajuan/{id}/pengesahan',         [PengesahanController::class, 'pengesahan']);
    });
});
