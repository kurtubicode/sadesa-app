<?php

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');



use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

Route::get('/tes-koneksi', function () {
    return response()->json([
        'status' => 'sukses',
        'pesan' => 'Halo dari Backend Sadesa!'
    ]);
});

Route::post('/login', function (Request $request) {
    // 1. Validasi input
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // 2. Cari user berdasarkan email
    $user = User::where('email', $request->email)->first();

    // 3. Cek apakah user ada dan password cocok
    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Email atau Password salah!'], 401);
    }

    // 4. Buat token Sanctum untuk mobile
    $token = $user->createToken('sadesa-mobile-token')->plainTextToken;

    // 5. Kembalikan data dan token
    return response()->json([
        'message' => 'Login Berhasil',
        'user' => $user,
        'token' => $token
    ], 200);
});
