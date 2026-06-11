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
     *
     * - API request (Accept: application/json / prefix /api) → JSON 401/403
     * - Web request (Inertia / browser) → redirect ke /dashboard dengan flash error
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Tentukan apakah ini request API atau web
        $isApi = $request->is('api/*') || $request->expectsJson();

        if (! $user) {
            if ($isApi) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }

        if (! in_array($user->role, $roles, true)) {
            if ($isApi) {
                return response()->json([
                    'message' => 'Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.',
                ], 403);
            }

            // Web: redirect ke dashboard dengan pesan error
            return redirect()->route('dashboard')->with(
                'error',
                'Anda tidak memiliki akses ke halaman tersebut.'
            );
        }

        return $next($request);
    }
}
