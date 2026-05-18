<?php

use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminKategoriAduanController;
use App\Http\Controllers\Admin\AdminKontenController;
use App\Http\Controllers\Admin\AdminMasterSuratController;
use App\Http\Controllers\Admin\AdminWilayahController;
use App\Http\Controllers\Admin\AdminPengaduanController;
use App\Http\Controllers\Admin\AdminPengajuanController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InformasiController;
use App\Http\Controllers\KepalaDesa\KepalaPengajuanController;
use App\Http\Controllers\Staff\StaffPengaduanController;
use App\Http\Controllers\Staff\StaffPengajuanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// ─── Informasi publik (tanpa auth) ────────────────────────────────────────────
Route::get('informasi',        [InformasiController::class, 'index'])->name('informasi.index');
Route::get('informasi/{slug}', [InformasiController::class, 'show'])->name('informasi.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ─── Admin routes ─────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {

        // Kelola Pengguna
        Route::get('users',                         [AdminUserController::class, 'index'])->name('users');
        Route::patch('users/{user}/status',         [AdminUserController::class, 'updateStatus'])->name('users.status');
        Route::patch('users/{user}/role',           [AdminUserController::class, 'updateRole'])->name('users.role');
        Route::delete('users/{user}',               [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Master Surat
        Route::get('master-surat',                              [AdminMasterSuratController::class, 'index'])->name('master-surat');
        Route::post('master-surat',                             [AdminMasterSuratController::class, 'store'])->name('master-surat.store');
        Route::patch('master-surat/{masterSurat}',              [AdminMasterSuratController::class, 'update'])->name('master-surat.update');
        Route::delete('master-surat/{masterSurat}',             [AdminMasterSuratController::class, 'destroy'])->name('master-surat.destroy');
        Route::patch('master-surat/{masterSurat}/toggle',       [AdminMasterSuratController::class, 'toggleActive'])->name('master-surat.toggle');

        // Pengajuan Surat
        Route::get('pengajuan',                     [AdminPengajuanController::class, 'index'])->name('pengajuan');
        Route::get('pengajuan/{pengajuan}',         [AdminPengajuanController::class, 'show'])->name('pengajuan.show');

        // Pengaduan
        Route::get('pengaduan',                             [AdminPengaduanController::class, 'index'])->name('pengaduan');
        Route::get('pengaduan/{pengaduan}',                 [AdminPengaduanController::class, 'show'])->name('pengaduan.show');
        Route::post('pengaduan/{pengaduan}/tanggapi',       [AdminPengaduanController::class, 'tanggapi'])->name('pengaduan.tanggapi');
        Route::patch('pengaduan/{pengaduan}/status',        [AdminPengaduanController::class, 'updateStatus'])->name('pengaduan.status');

        // Data Master (Wilayah + Kategori Aduan)
        Route::get('data-master',                               [AdminWilayahController::class, 'index'])->name('data-master');
        Route::post('wilayah',                                  [AdminWilayahController::class, 'store'])->name('wilayah.store');
        Route::patch('wilayah/{wilayah}',                       [AdminWilayahController::class, 'update'])->name('wilayah.update');
        Route::delete('wilayah/{wilayah}',                      [AdminWilayahController::class, 'destroy'])->name('wilayah.destroy');
        Route::post('kategori-aduan',                           [AdminKategoriAduanController::class, 'store'])->name('kategori-aduan.store');
        Route::patch('kategori-aduan/{kategoriAduan}',          [AdminKategoriAduanController::class, 'update'])->name('kategori-aduan.update');
        Route::delete('kategori-aduan/{kategoriAduan}',         [AdminKategoriAduanController::class, 'destroy'])->name('kategori-aduan.destroy');

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
        // Pengajuan Surat
        Route::get('pengajuan',                                 [StaffPengajuanController::class, 'index'])->name('pengajuan');
        Route::get('pengajuan/{pengajuan}',                     [StaffPengajuanController::class, 'show'])->name('pengajuan.show');
        Route::patch('pengajuan/{pengajuan}/verifikasi',        [StaffPengajuanController::class, 'verifikasi'])->name('pengajuan.verifikasi');

        // Pengaduan
        Route::get('pengaduan',                                 [StaffPengaduanController::class, 'index'])->name('pengaduan');
        Route::get('pengaduan/{pengaduan}',                     [StaffPengaduanController::class, 'show'])->name('pengaduan.show');
        Route::post('pengaduan/{pengaduan}/tanggapi',           [StaffPengaduanController::class, 'tanggapi'])->name('pengaduan.tanggapi');
        Route::patch('pengaduan/{pengaduan}/status',            [StaffPengaduanController::class, 'updateStatus'])->name('pengaduan.status');
    });

    // ─── Kepala Desa routes ───────────────────────────────────────────────────
    Route::middleware('role:kepala_desa')->prefix('kepala-desa')->name('kepala-desa.')->group(function () {
        Route::get('pengajuan',                                 [KepalaPengajuanController::class, 'index'])->name('pengajuan');
        Route::get('pengajuan/{pengajuan}',                     [KepalaPengajuanController::class, 'show'])->name('pengajuan.show');
        Route::patch('pengajuan/{pengajuan}/pengesahan',        [KepalaPengajuanController::class, 'pengesahan'])->name('pengajuan.pengesahan');
    });
});

require __DIR__.'/settings.php';
