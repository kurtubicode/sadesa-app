# SADESA Mobile

Aplikasi mobile warga Desa Cirangkong, dibangun dengan React Native (Expo). Warga dapat login, melihat informasi desa, dan mengakses layanan administrasi langsung dari smartphone.

## Prasyarat

- Node.js >= 20
- npm >= 10
- **Expo Go** (install di HP Android/iOS) — atau gunakan emulator
- Backend SADESA sudah berjalan di jaringan yang sama

## Instalasi

```bash
# dari root proyek
cd mobile
npm install
```

## Konfigurasi URL API

API URL di-hardcode di dua file. Sebelum menjalankan aplikasi, ganti IP dengan IP lokal komputermu:

| File | Variabel | Default |
|------|----------|---------|
| [`app/index.tsx`](app/index.tsx) | `BASE_URL` dalam axios.post | `http://192.168.8.185:8000` |
| [`app/cekapi.tsx`](app/cekapi.tsx) | URL dalam axios.get | `http://192.168.8.185:8000` |

Cara cek IP lokal di Windows:
```bash
ipconfig
# Cari "IPv4 Address" pada adapter Wi-Fi
```

## Menjalankan Aplikasi

```bash
npx expo start
```

Pilih salah satu cara:
- Scan QR code dengan **Expo Go** di HP
- Tekan `a` — buka di Android Emulator
- Tekan `i` — buka di iOS Simulator
- Tekan `w` — buka di browser (terbatas)

Gunakan flag `-c` untuk membersihkan cache jika ada masalah:

```bash
npx expo start -c
```

## Struktur Direktori

```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout, konfigurasi Stack navigator
│   ├── index.tsx            # Halaman login
│   ├── cekapi.tsx           # Halaman tes koneksi API (development)
│   └── (tabs)/
│       ├── _layout.tsx      # Konfigurasi tab navigator
│       ├── index.tsx        # Tab Home
│       └── profile.tsx      # Tab Profil & logout
├── components/
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── HapticTab.tsx
│   └── IconSymbol.tsx
├── constants/
│   └── Colors.ts            # Palet warna light/dark mode
├── hooks/
│   └── useColorScheme.ts
└── app.json                 # Konfigurasi Expo
```

## Alur Autentikasi

```
App dibuka
    │
    ▼
Cek SecureStore ("sadesa_user_token")
    │
    ├── Token ada → navigasi ke /(tabs) (auto-login)
    │
    └── Token tidak ada → tampilkan halaman login
            │
            ▼
        User input email + password
            │
            ▼
        POST /api/login
            │
            ├── Sukses → simpan token di SecureStore → navigasi ke /(tabs)
            │
            └── Gagal → tampilkan pesan error
```

**Logout:**
- Token dihapus dari SecureStore
- Navigasi kembali ke halaman login

## Dependensi Utama

| Package | Versi | Kegunaan |
|---------|-------|---------|
| `expo` | ~54.0.33 | Framework React Native |
| `expo-router` | ~6.0.23 | File-based routing |
| `expo-secure-store` | ~15.0.8 | Penyimpanan token yang aman |
| `axios` | 1.13.6 | HTTP client untuk API calls |
| `react-native` | 0.81.5 | Core framework |

## Troubleshooting

**Tidak bisa connect ke API:**
1. Pastikan backend sudah jalan (`php artisan serve --host=0.0.0.0 --port=8000`)
2. Pastikan HP/emulator dan komputer di jaringan Wi-Fi yang sama
3. Ganti URL di `app/index.tsx` dan `app/cekapi.tsx` dengan IP yang benar
4. Test koneksi via halaman **Cek API** di dalam aplikasi

**Metro bundler error / cache stale:**
```bash
npx expo start -c
```

**Expo Go tidak mau scan QR:**
- Pastikan Expo Go sudah update ke versi terbaru
- Coba jalankan dengan `npx expo start --tunnel`
