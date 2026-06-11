<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    margin: 0;
    padding: 30px 40px;
    color: #000;
  }

  /* ── KOP SURAT ──────────────────────────────────────── */
  .kop-wrap {
    width: 100%;
    border-bottom: 4px double #000;
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .kop-table { width: 100%; }
  .kop-logo  { width: 70px; text-align: center; vertical-align: middle; }
  .kop-logo img { width: 60px; height: 60px; }
  .kop-teks  { text-align: center; vertical-align: middle; }
  .kop-teks .baris1 { font-size: 13pt; font-weight: bold; letter-spacing: 1px; }
  .kop-teks .baris2 { font-size: 11pt; font-weight: bold; }
  .kop-teks .baris3 { font-size: 11pt; }
  .kop-teks .alamat { font-size: 9pt; margin-top: 3px; }

  /* ── JUDUL ──────────────────────────────────────────── */
  .judul-wrap { text-align: center; margin-bottom: 4px; }
  .judul-surat {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
    letter-spacing: 1px;
  }
  .nomor-surat { font-size: 10.5pt; text-align: center; margin-bottom: 18px; }

  /* ── ISI ────────────────────────────────────────────── */
  .paragraf { text-align: justify; line-height: 1.6; margin-bottom: 10px; }

  .data-warga { width: 100%; margin-bottom: 14px; border-collapse: collapse; }
  .data-warga td { padding: 1.5px 0; vertical-align: top; font-size: 11.5pt; }
  .data-warga .lbl { width: 38%; }
  .data-warga .sep { width: 4%; text-align: center; }
  .data-warga .val { width: 58%; }

  /* ── TTD ────────────────────────────────────────────── */
  .ttd-wrap  { margin-top: 30px; width: 100%; }
  .ttd-table { width: 100%; border-collapse: collapse; }
  .ttd-kiri  { width: 45%; vertical-align: top; }
  .ttd-kanan { width: 55%; text-align: center; vertical-align: top; }
  .ttd-nama  {
    display: inline-block;
    font-weight: bold;
    text-decoration: underline;
    margin-top: 60px;
  }
  .tanggal-baris { text-align: right; margin-bottom: 4px; }

  /* TTD saksi (RT/RW) kiri */
  .ttd-saksi { width: 100%; border-collapse: collapse; }
  .ttd-saksi td { width: 50%; text-align: center; vertical-align: top; font-size: 11pt; }
  .ttd-saksi .nama-saksi {
    display: inline-block;
    font-weight: bold;
    text-decoration: underline;
    margin-top: 55px;
  }

  .ttd-camat { margin-top: 24px; font-size: 11pt; }
  .ttd-camat .judul-camat { margin-bottom: 2px; }
</style>
</head>
<body>

@php
  $s            = $settings ?? [];
  $formulir     = $pengajuan->data_formulir ?? [];
  $profileData  = $profileData ?? [];

  // Variabel substitusi paragraf: settings + profil warga + data formulir
  $allVars = array_merge($s, $profileData, $formulir);

  // Closure untuk mengganti {{key}} dalam teks dengan nilai $allVars
  $sub = function (string $text) use ($allVars): string {
    return preg_replace_callback('/\{\{(\w+)\}\}/', function ($m) use ($allVars) {
      return $allVars[$m[1]] ?? $m[0];
    }, $text);
  };

  $kopJabatan    = ($s['kop_jabatan']   ?? 'KEPALA DESA') . ' ' . strtoupper($s['kop_nama_desa'] ?? 'CIRANGKONG');
  $kopKecamatan  = 'KECAMATAN ' . strtoupper($s['kop_kecamatan'] ?? 'CIJAMBE');
  $kopKabupaten  = 'KABUPATEN ' . strtoupper($s['kop_kabupaten'] ?? 'SUBANG');
  $kopAlamat     = $s['kop_alamat'] ?? '';
  $kopTelepon    = $s['kop_telepon'] ?? '';
  $kopKodePOS    = $s['kop_kode_pos'] ?? '';
  $alamatLengkap = 'Alamat: ' . $kopAlamat;
  if ($kopTelepon) $alamatLengkap .= '  Telp: ' . $kopTelepon;
  if ($kopKodePOS) $alamatLengkap .= '  Kode Pos ' . $kopKodePOS;

  $template = $masterSurat->template ?? [];
  $blocks   = $template['blocks'] ?? [];
@endphp

{{-- ═══════════════════════════════════════════════════
     KOP SURAT
════════════════════════════════════════════════════ --}}
<div class="kop-wrap">
  <table class="kop-table">
    <tr>
      <td class="kop-logo">
        @php
          $logoPath = $s['kop_logo_path'] ?? 'images/logo-kab-subang.png';
          $logoFull = public_path($logoPath);
        @endphp
        @if(file_exists($logoFull))
          <img src="{{ $logoFull }}" alt="Logo">
        @else
          <div style="width:60px;height:60px;border:1px solid #999;text-align:center;font-size:7pt;padding-top:20px;color:#999;">LOGO</div>
        @endif
      </td>
      <td class="kop-teks">
        <div class="baris1">{{ $kopJabatan }}</div>
        <div class="baris2">{{ $kopKecamatan }}</div>
        <div class="baris3">{{ $kopKabupaten }}</div>
        <div class="alamat">{{ $alamatLengkap }}</div>
      </td>
      <td style="width:70px;"></td>
    </tr>
  </table>
</div>

{{-- ═══════════════════════════════════════════════════
     JUDUL & NOMOR SURAT
════════════════════════════════════════════════════ --}}
<div class="judul-wrap">
  <span class="judul-surat">{{ strtoupper($masterSurat->nama_surat) }}</span>
</div>
<div class="nomor-surat">Nomor : {{ $nomor_surat }}</div>

{{-- ═══════════════════════════════════════════════════
     ISI SURAT — dirender dari blok JSON
════════════════════════════════════════════════════ --}}
@foreach($blocks as $block)
  @php $type = $block['type'] ?? ''; @endphp

  {{-- ── PARAGRAF ──────────────────────────────────── --}}
  @if($type === 'paragraph')
    @php $content = $sub($block['content'] ?? ''); @endphp
    <p class="paragraf">{!! nl2br(e($content)) !!}</p>

  {{-- ── TABEL DATA WARGA ──────────────────────────── --}}
  @elseif($type === 'fields_table')
    <table class="data-warga">
      @foreach($block['fields'] ?? [] as $field)
        @php
          $src      = $field['source'] ?? 'profile';
          $fieldVal = $src === 'profile'
            ? ($profileData[$field['profile_key'] ?? ''] ?? '-')
            : ($formulir[$field['field_key'] ?? ''] ?? '-');
        @endphp
        <tr>
          <td class="lbl">{{ $field['label'] ?? '' }}</td>
          <td class="sep">:</td>
          <td class="val">{{ $fieldVal }}</td>
        </tr>
      @endforeach
    </table>

  {{-- ── ALASAN / KEPERLUAN ────────────────────────── --}}
  @elseif($type === 'alasan')
    @php
      $alasanKey = $block['field_key'] ?? 'keperluan';
      $alasanVal = $formulir[$alasanKey] ?? '...';
    @endphp
    <p class="paragraf">{{ $alasanVal }}</p>

  {{-- ── TANDA TANGAN ──────────────────────────────── --}}
  @elseif($type === 'signature')
    <div class="ttd-wrap">
      <table class="ttd-table">
        <tr>
          {{-- Kiri: RT & RW --}}
          <td class="ttd-kiri">
            <table class="ttd-saksi">
              <tr>
                <td>
                  Ketua Rukun Tetangga<br>
                  <span class="nama-saksi">{{ $rt_nama ?? '.................................' }}</span>
                </td>
                <td>
                  Ketua Rukun Warga<br>
                  <span class="nama-saksi">{{ $rw_nama ?? '.................................' }}</span>
                </td>
              </tr>
            </table>

            <div class="ttd-camat">
              <div class="judul-camat">
                Mengetahui,<br>
                CAMAT {{ strtoupper($s['kop_kecamatan'] ?? 'CIJAMBE') }}
              </div>
              <div style="margin-top:55px;">
                <span style="font-weight:bold;text-decoration:underline;">
                  {{ $camat_nama ?? '.................................' }}
                </span><br>
                NIP.
              </div>
            </div>
          </td>

          {{-- Kanan: Kepala Desa --}}
          <td class="ttd-kanan">
            <div class="tanggal-baris">{{ $s['kop_nama_desa'] ?? 'Cirangkong' }}, {{ $tanggal }}</div>
            <div>{{ $s['kades_jabatan'] ?? 'Kepala Desa' }}</div>
            <div><span class="ttd-nama">{{ $s['kades_nama'] ?? $kades?->name ?? '........................' }}</span></div>
            @if(!empty($s['kades_nip']))
              <div style="font-size:10pt;">NIP. {{ $s['kades_nip'] }}</div>
            @endif
          </td>
        </tr>
      </table>
    </div>

  {{-- ── SPACER ────────────────────────────────────── --}}
  @elseif($type === 'spacer')
    <div style="height: 20px;"></div>

  @endif
@endforeach

</body>
</html>
