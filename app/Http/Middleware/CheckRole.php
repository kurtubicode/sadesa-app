<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Izinkan akses hanya jika role user cocok dengan salah satu role yang diberikan.
     * Contoh pemakaian di route: middleware('role:staff,admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.',
            ], 403);
        }

        return $next($request);
    }
}
