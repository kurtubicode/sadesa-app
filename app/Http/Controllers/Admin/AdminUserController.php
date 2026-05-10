<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('wilayah:id,nama')
            ->select('id', 'nik', 'name', 'email', 'phone', 'role', 'status', 'wilayah_id', 'created_at');

        // Filter
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('nik', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/users', [
            'users'   => $users,
            'filters' => $request->only('role', 'status', 'search'),
        ]);
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:aktif,nonaktif,menunggu_verifikasi',
        ]);

        $old = $user->status;
        $user->update(['status' => $request->status]);

        AuditLog::catat(
            "update_status_user: {$old} → {$request->status}",
            User::class,
            $user->id
        );

        return back()->with('success', "Status {$user->name} berhasil diubah.");
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'role' => 'required|in:admin,staff,kepala_desa,warga',
        ]);

        $old = $user->role;
        $user->update(['role' => $request->role]);

        AuditLog::catat(
            "update_role_user: {$old} → {$request->role}",
            User::class,
            $user->id
        );

        return back()->with('success', "Role {$user->name} berhasil diubah.");
    }

    public function destroy(User $user): RedirectResponse
    {
        // Jangan hapus diri sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak bisa menghapus akun sendiri.');
        }

        AuditLog::catat('hapus_user', User::class, $user->id, ['name' => $user->name]);
        $user->delete();

        return back()->with('success', "Akun {$user->name} berhasil dihapus.");
    }
}
