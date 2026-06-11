<?php

namespace App\Http\Controllers;

use App\Models\KontenDesa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        // Ambil 4 berita terbaru
        $berita = KontenDesa::published()
            ->latest()
            ->take(4)
            ->get(['id', 'judul', 'slug', 'tipe', 'konten', 'created_at']);

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'berita'      => $berita,
        ]);
    }
}
