<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Daftar notifikasi user yang sedang login.
     * Unread duluan, lalu yang sudah dibaca, max 50.
     */
    public function index(Request $request): JsonResponse
    {
        $notifs = $request->user()
            ->notifications()
            ->take(50)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->data['type']       ?? 'info',
                'title'      => $n->data['title']      ?? '',
                'body'       => $n->data['body']       ?? '',
                'action_url' => $n->data['action_url'] ?? null,
                'read'       => ! is_null($n->read_at),
                'created_at' => $n->created_at->diffForHumans(null, false, true, 1),
            ]);

        return response()->json([
            'data'          => $notifs,
            'unread_count'  => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notif = $request->user()->notifications()->where('id', $id)->first();

        if ($notif) {
            $notif->markAsRead();
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Tandai semua notifikasi sebagai sudah dibaca.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca.']);
    }
}
