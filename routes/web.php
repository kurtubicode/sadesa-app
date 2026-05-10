<?php

use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminKontenController;
use App\Http\Controllers\Admin\AdminPengaduanController;
use App\Http\Controllers\Admin\AdminPengajuanController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KepalaDesa\KepalaPengajuanController;
use App\Http\Controllers\Staff\StaffPengajuanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ─── Admin routes ─────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {

        // Kelola Pengguna
        Route::get('users',                         [AdminUserController::class, 'index'])->name('users');
        Route::patch('users/{user}/status',         [AdminUserController::class, 'updateStatus'])->name('users.status');
        Route::patch('users/{user}/role',           [AdminUserController::class, 'updateRole'])->name('users.role');
        Route::delete('users/{user}',               [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Pengajuan Surat
        Route::get('pengajuan',                     [AdminPengajuanController::class, 'index'])->name('pengajuan');
        Route::get('pengajuan/{pengajuan}',         [AdminPengajuanController::class, 'show'])->name('pengajuan.show');

        // Pengaduan
        Route::get('pengaduan',                     [AdminPengaduanController::class, 'index'])->name('pengaduan');
        Route::get('pengaduan/{pengaduan}',         [AdminPengaduanController::class, 'show'])->name('pengaduan.show');

        // Konten Desa
        Route::get('konten',                        [AdminKontenController::class, 'index'])->name('konten');
        Route::post('konten',                       [AdminKontenController::class, 'store'])->name('konten.store');
        Route::patch('konten/{konten}',             [AdminKontenController::class, 'update'])->name('konten.update');
        Route::delete('konten/{konten}',            [AdminKontenController::class, 'destroy'])->name('konten.destroy');

        // Audit Log
        Route::get('audit-log',                     [AdminAuditLogController::class, 'index'])->name('audit-log');
    });

    // ─── Staff routes ─────────────────────────────────────────────────────────
    Route::middleware('role:staff')->prefix('staff')->name('staff.')->group(function () {
        Route::get('pengajuan',                                 [StaffPengajuanController::class, 'index'])->name('pengajuan');
        Route::get('pengajuan/{pengajuan}',                     [StaffPengajuanController::class, 'show'])->name('pengajuan.show');
        Route::patch('pengajuan/{pengajuan}/verifikasi',        [StaffPengajuanController::class, 'verifikasi'])->name('pengajuan.verifikasi');
    });

    // ─── Kepala Desa routes ───────────────────────────────────────────────────
    Route::middleware('role:kepala_desa')->prefix('kepala-desa')->name('kepala-desa.')->group(function () {
        Route::get('pengajuan',                                 [KepalaPengajuanController::class, 'index'])->name('pengajuan');
        Route::get('pengajuan/{pengajuan}',                     [KepalaPengajuanController::class, 'show'])->name('pengajuan.show');
        Route::patch('pengajuan/{pengajuan}/pengesahan',        [KepalaPengajuanController::class, 'pengesahan'])->name('pengajuan.pengesahan');
    });
});

require __DIR__.'/settings.php';
