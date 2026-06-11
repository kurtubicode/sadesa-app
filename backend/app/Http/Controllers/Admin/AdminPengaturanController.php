<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPengaturanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/pengaturan', [
            'settings' => AppSetting::allAsArray(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'kop_jabatan'   => 'nullable|string|max:100',
            'kop_nama_desa' => 'nullable|string|max:100',
            'kop_kecamatan' => 'nullable|string|max:100',
            'kop_kabupaten' => 'nullable|string|max:100',
            'kop_alamat'    => 'nullable|string|max:500',
            'kop_telepon'   => 'nullable|string|max:50',
            'kop_fax'       => 'nullable|string|max:50',
            'kop_kode_pos'  => 'nullable|string|max:10',
            'kop_website'   => 'nullable|string|max:255',
            'kop_email'     => 'nullable|email|max:255',
            'kades_nama'    => 'nullable|string|max:100',
            'kades_nip'     => 'nullable|string|max:50',
            'kades_jabatan' => 'nullable|string|max:100',
            'kop_logo'      => 'nullable|image|max:2048',
        ]);

        // ── Logo upload ───────────────────────────────────────────────────────
        if ($request->hasFile('kop_logo')) {
            $path = $request->file('kop_logo')->store('images', 'public');
            AppSetting::set('kop_logo_path', $path);
        }

        // ── Text settings ─────────────────────────────────────────────────────
        $textKeys = [
            'kop_jabatan', 'kop_nama_desa', 'kop_kecamatan', 'kop_kabupaten',
            'kop_alamat', 'kop_telepon', 'kop_fax', 'kop_kode_pos',
            'kop_website', 'kop_email', 'kades_nama', 'kades_nip', 'kades_jabatan',
        ];

        foreach ($textKeys as $key) {
            if ($request->has($key)) {
                AppSetting::set($key, $request->input($key));
            }
        }

        return back()->with('success', 'Pengaturan kop surat berhasil disimpan.');
    }
}
