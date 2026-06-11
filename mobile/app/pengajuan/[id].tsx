import { useCallback, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Status map ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  menunggu:            { bg: "#FEF3C7", text: "#92400E", label: "Menunggu" },
  diproses:            { bg: "#DBEAFE", text: "#1E40AF", label: "Sedang Diproses" },
  diverifikasi:        { bg: "#EDE9FE", text: "#5B21B6", label: "Diverifikasi" },
  ditolak_staff:       { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak Petugas" },
  menunggu_pengesahan: { bg: "#F3E8FF", text: "#6B21A8", label: "Menunggu Pengesahan" },
  disetujui:           { bg: "#FEF3C7", text: "#92400E", label: "Disetujui — Diproses" },
  ditolak_kepala:      { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak" },
  siap_diambil:        { bg: "#CCFBF1", text: "#0F766E", label: "Siap Diambil!" },
  selesai:             { bg: "#D1FAE5", text: "#065F46", label: "Selesai" },
  dibatalkan:          { bg: "#F3F4F6", text: "#6B7280", label: "Dibatalkan" },
};

// ─── Timeline config ──────────────────────────────────────────────────────────
// Order: menunggu → diverifikasi → menunggu_pengesahan → siap_diambil → selesai

const TL_STEPS = [
  { key: "menunggu",            label: "Pengajuan Terkirim",        sublabel: "Pengajuan berhasil diterima" },
  { key: "diverifikasi",        label: "Berkas Diverifikasi",       sublabel: "Berkas telah diperiksa petugas" },
  { key: "menunggu_pengesahan", label: "Menunggu Pengesahan",       sublabel: "Menunggu persetujuan kepala desa" },
  { key: "siap_diambil",        label: "Surat Siap Diambil",        sublabel: "Surat sudah jadi, silakan ambil ke kantor desa" },
  { key: "selesai",             label: "Selesai",                   sublabel: "Surat telah diterima" },
];
const TL_ORDER = TL_STEPS.map(s => s.key);
const REJECTED = ["ditolak_staff", "ditolak_kepala", "dibatalkan"];

type TLState = "done" | "active" | "pending" | "rejected";

function getTLState(stepKey: string, currentStatus: string): TLState {
  if (REJECTED.includes(currentStatus)) {
    // Find last known good step before rejection
    const rejectedAfter: Record<string, string> = {
      ditolak_staff:  "diverifikasi",
      ditolak_kepala: "menunggu_pengesahan",
      dibatalkan:     "menunggu",
    };
    const stoppedKey = rejectedAfter[currentStatus] ?? "menunggu";
    const stoppedIdx = TL_ORDER.indexOf(stoppedKey);
    const stepIdx    = TL_ORDER.indexOf(stepKey);
    if (stepIdx < stoppedIdx)  return "done";
    if (stepIdx === stoppedIdx) return "rejected";
    return "pending";
  }
  // disetujui / diproses belum punya step sendiri → anggap sudah lewat menunggu_pengesahan
  const norm       = (currentStatus === "disetujui" || currentStatus === "diproses")
                       ? "menunggu_pengesahan"
                       : currentStatus;
  const currentIdx = TL_ORDER.indexOf(norm);
  const stepIdx    = TL_ORDER.indexOf(stepKey);
  if (stepIdx < currentIdx)  return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusLog {
  status: string;
  catatan?: string | null;
  waktu?: string | null;        // formatted: "14 Apr 2026 · 09:00"
  created_at?: string | null;   // ISO datetime fallback
}

interface Dokumen {
  id: number;
  nama_file: string;
  tipe: string;
  url: string;
}

interface DetailPengajuan {
  id: number;
  no_pengajuan: string;
  jenis_surat: string;
  status: string;
  keterangan: string | null;
  catatan: string | null;
  tanggal: string;
  dokumen: Dokumen[];
  riwayat?: StatusLog[];
  url_surat?: string | null;
}

// ─── Timeline component ───────────────────────────────────────────────────────

function Timeline({ data }: { data: DetailPengajuan }) {
  // Build a log map: status → { waktu, catatan }
  const logMap = new Map<string, StatusLog>();
  (data.riwayat ?? []).forEach(l => logMap.set(l.status, l));

  const isRejected = REJECTED.includes(data.status);

  return (
    <View>
      {TL_STEPS.map((step, idx) => {
        const state    = getTLState(step.key, data.status);
        const isLast   = idx === TL_STEPS.length - 1;
        const log      = logMap.get(step.key);
        const waktu    = log?.waktu ?? (log?.created_at ? formatDT(log.created_at) : null);
        const catatan  = state === "active" ? (data.catatan ?? log?.catatan) : null;

        const dotColor = state === "done"     ? COLORS.primary
                       : state === "active"   ? COLORS.primary
                       : state === "rejected" ? COLORS.danger
                       : COLORS.border;
        const lineColor = state === "done" ? COLORS.primary : COLORS.border;

        return (
          <View key={step.key} style={tl.row}>
            {/* Left: dot + line */}
            <View style={tl.leftCol}>
              {/* Dot */}
              <View style={[
                tl.dot,
                state === "active"   && tl.dotActive,
                state === "done"     && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                state === "rejected" && { backgroundColor: COLORS.danger,  borderColor: COLORS.danger },
                state === "pending"  && tl.dotPending,
              ]}>
                {state === "done" && (
                  <Ionicons name="checkmark" size={11} color={COLORS.white} />
                )}
                {state === "rejected" && (
                  <Ionicons name="close" size={11} color={COLORS.white} />
                )}
                {state === "active" && (
                  <View style={tl.dotInner} />
                )}
              </View>
              {/* Line */}
              {!isLast && (
                <View style={[tl.line, { backgroundColor: lineColor }]} />
              )}
            </View>

            {/* Right: content */}
            <View style={tl.rightCol}>
              <Text style={[
                tl.stepLabel,
                state === "done"     && tl.stepDone,
                state === "active"   && tl.stepActive,
                state === "rejected" && tl.stepRejected,
                state === "pending"  && tl.stepPending,
              ]}>
                {step.label}
              </Text>

              {/* Timestamp */}
              {waktu ? (
                <Text style={tl.timestamp}>{waktu}</Text>
              ) : state === "pending" ? (
                <Text style={tl.estimasi}>Estimasi: --</Text>
              ) : null}

              {/* Catatan box (only for active step) */}
              {catatan ? (
                <View style={tl.noteBox}>
                  <Text style={tl.noteText}>{catatan}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}

      {/* Rejection terminal node */}
      {isRejected && (() => {
        const cfg = STATUS_MAP[data.status];
        return (
          <View style={tl.row}>
            <View style={tl.leftCol}>
              <View style={[tl.dot, { backgroundColor: COLORS.danger, borderColor: COLORS.danger }]}>
                <Ionicons name="close" size={11} color={COLORS.white} />
              </View>
            </View>
            <View style={tl.rightCol}>
              <Text style={tl.stepRejected}>{cfg?.label ?? data.status}</Text>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

function formatDT(iso: string): string {
  try {
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const day  = d.getDate();
    const mon  = months[d.getMonth()];
    const yr   = d.getFullYear();
    const hh   = String(d.getHours()).padStart(2, "0");
    const mm   = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${mon} ${yr} · ${hh}:${mm}`;
  } catch { return iso; }
}

const DOT_SIZE = 22;

const tl = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "stretch" },
  leftCol: { alignItems: "center", width: DOT_SIZE + 12, paddingTop: 2 },
  rightCol:{ flex: 1, paddingLeft: SPACING.sm, paddingBottom: SPACING.xl },

  dot: {
    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  dotActive:  { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  dotPending: { borderColor: COLORS.border,  backgroundColor: COLORS.white },
  dotInner:   { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  line:       { flex: 1, width: 2, marginTop: 2, minHeight: 16 },

  stepLabel:   { fontSize: FONT.md,   fontWeight: "600", color: COLORS.textMuted },
  stepDone:    { color: COLORS.text,     fontWeight: "600" },
  stepActive:  { color: COLORS.text,     fontWeight: "700" },
  stepRejected:{ color: COLORS.danger,   fontWeight: "700" },
  stepPending: { color: COLORS.textMuted, fontWeight: "500" },

  timestamp: { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 2 },
  estimasi:  { fontSize: FONT.sm, color: COLORS.textMuted, fontStyle: "italic", marginTop: 2 },

  noteBox: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
    borderRadius: RADIUS.sm, padding: SPACING.sm + 2,
  },
  noteText: { fontSize: FONT.sm, color: COLORS.textSecondary, lineHeight: 18 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DetailPengajuanScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const footerPb = Math.max(insets.bottom, SPACING.md);

  const [data, setData]             = useState<DetailPengajuan | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [cancelling, setCancelling]       = useState(false);
  const [confirming, setConfirming]       = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/pengajuan/${id}`);
      setData(res.data.data ?? res.data);
    } catch {
      Alert.alert("Error", "Gagal memuat detail pengajuan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [id]));

  // ── Upload dokumen ──────────────────────────────────────────────────────────
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];

      const formData = new FormData();
      formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType ?? "application/octet-stream" } as any);
      formData.append("jenis_dokumen", "Berkas Persyaratan");

      setUploading(true);
      await api.post(`/api/pengajuan/${id}/dokumen`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Berhasil", `Dokumen "${file.name}" berhasil diunggah.`);
      fetchData();
    } catch (err: any) {
      Alert.alert("Gagal", err?.response?.data?.message ?? "Gagal mengunggah dokumen.");
    } finally {
      setUploading(false);
    }
  };

  // ── Batalkan ───────────────────────────────────────────────────────────────
  const handleBatalkan = () => {
    Alert.alert(
      "Batalkan Pengajuan",
      "Yakin ingin membatalkan? Tindakan ini tidak dapat dibatalkan.",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan", style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await api.delete(`/api/pengajuan/${id}`);
              Alert.alert("Dibatalkan", "Pengajuan telah dibatalkan.", [
                { text: "OK", onPress: () => router.replace("/(tabs)/status" as any) },
              ]);
            } catch (err: any) {
              Alert.alert("Gagal", err?.response?.data?.message ?? "Gagal membatalkan.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  // ── Konfirmasi Sudah Diambil ───────────────────────────────────────────────
  const handleKonfirmasiAmbil = () => {
    Alert.alert(
      "Konfirmasi Pengambilan",
      "Konfirmasi bahwa Anda sudah menerima surat dari kantor desa?",
      [
        { text: "Belum", style: "cancel" },
        {
          text: "Ya, Sudah Diambil",
          onPress: async () => {
            setConfirming(true);
            try {
              await api.post(`/api/pengajuan/${id}/konfirmasi-ambil`);
              Alert.alert(
                "Terima Kasih!",
                "Pengajuan surat Anda ditandai selesai.",
                [{ text: "OK", onPress: () => fetchData() }],
              );
            } catch (err: any) {
              Alert.alert("Gagal", err?.response?.data?.message ?? "Gagal mengkonfirmasi.");
            } finally {
              setConfirming(false);
            }
          },
        },
      ],
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.errorText}>Data tidak ditemukan.</Text>
      </View>
    );
  }

  const cfg           = STATUS_MAP[data.status] ?? { bg: "#F3F4F6", text: "#6B7280", label: data.status };
  const canUpload     = ["menunggu", "diverifikasi", "diproses"].includes(data.status);
  const canCancel     = ["menunggu", "diverifikasi"].includes(data.status);
  const canKonfirmasi = data.status === "siap_diambil";

  return (
    <View style={s.screen}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingBottom: 80 + footerPb }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Info Card ── */}
        <View style={s.infoCard}>
          {/* Jenis layanan */}
          <Text style={s.fieldKey}>JENIS LAYANAN</Text>
          <Text style={s.infoTitle}>{data.jenis_surat}</Text>

          <View style={s.infoDivider} />

          {/* Tanggal + Status */}
          <View style={s.infoRow}>
            <View style={s.infoBlock}>
              <Text style={s.fieldKey}>TANGGAL PENGAJUAN</Text>
              <Text style={s.infoDate}>{data.tanggal}</Text>
            </View>
            <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
              <Text style={[s.statusPillText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>

          {/* Catatan petugas (if any) */}
          {data.catatan ? (
            <View style={s.catatanBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#92400E" />
              <View style={{ flex: 1 }}>
                <Text style={s.catatanLabel}>Catatan Petugas</Text>
                <Text style={s.catatanText}>{data.catatan}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* ── Timeline ── */}
        <Text style={s.sectionLabel}>STATUS PENGAJUAN</Text>
        <View style={s.timelineCard}>
          <Timeline data={data} />
        </View>

        {/* ── Dokumen ── */}
        {(data.dokumen.length > 0 || canUpload) && (
          <>
            <Text style={s.sectionLabel}>DOKUMEN</Text>
            <View style={s.card}>
              {data.dokumen.map((dok) => (
                <View key={dok.id} style={s.dokRow}>
                  <View style={s.dokIcon}>
                    <Ionicons
                      name={dok.tipe?.includes("pdf") ? "document-text-outline" : "image-outline"}
                      size={18} color={COLORS.primary}
                    />
                  </View>
                  <Text style={s.dokName} numberOfLines={1}>{dok.nama_file}</Text>
                  <TouchableOpacity
                    onPress={() => dok.url && Linking.openURL(dok.url)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="download-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}

              {canUpload && (
                <TouchableOpacity
                  style={s.uploadBtn}
                  onPress={handleUpload}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator color={COLORS.primary} size="small" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
                      <Text style={s.uploadBtnText}>Unggah Dokumen Tambahan</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* ── Info estimasi ── */}
        <View style={s.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
          <Text style={s.infoBoxText}>
            Estimasi waktu penyelesaian adalah 1–3 hari kerja sejak pengajuan diterima.
          </Text>
        </View>

        {/* Branding */}
        <Text style={s.branding}>SI-WARGA OFFICIAL SERVICE</Text>

        <View style={{ height: SPACING.lg }} />
      </ScrollView>

      {/* ── Fixed Footer ── */}
      <View style={[s.footer, { paddingBottom: footerPb }]}>

        {/* Batalkan — tampil hanya jika bisa dibatalkan */}
        {canCancel && (
          <TouchableOpacity
            style={[s.footerBtnOutline, cancelling && s.btnDisabled]}
            onPress={handleBatalkan}
            disabled={cancelling}
            activeOpacity={0.8}
          >
            {cancelling ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <Text style={s.footerBtnOutlineText}>Batalkan{"\n"}Pengajuan</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Konfirmasi Sudah Diambil — tampil saat siap_diambil */}
        {canKonfirmasi && (
          <TouchableOpacity
            style={[s.footerBtnFilled, confirming && s.btnDisabled]}
            onPress={handleKonfirmasiAmbil}
            disabled={confirming}
            activeOpacity={0.85}
          >
            {confirming ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
                <Text style={s.footerBtnFilledText}>Sudah Diambil</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Placeholder kosong — kalau tidak ada aksi sama sekali */}
        {!canCancel && !canKonfirmasi && (
          <View style={s.footerInfo}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={s.footerInfoText}>
              {data.status === "selesai"
                ? "Pengajuan surat telah selesai."
                : data.status === "dibatalkan"
                  ? "Pengajuan ini sudah dibatalkan."
                  : ["ditolak_staff", "ditolak_kepala"].includes(data.status)
                    ? "Pengajuan ini ditolak."
                    : "Pengajuan sedang diproses."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.background },
  scroll:  { flex: 1 },
  content: { padding: SPACING.lg },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md, padding: SPACING.xxxl },
  errorText: { fontSize: FONT.md, color: COLORS.textMuted },

  // Info card
  infoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, ...SHADOW.sm,
  },
  fieldKey:  { fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: SPACING.xs },
  infoTitle: { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg, lineHeight: 28 },
  infoDivider:{ height: 1, backgroundColor: COLORS.divider, marginBottom: SPACING.lg },
  infoRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoBlock: { flex: 1 },
  infoDate:  { fontSize: FONT.md, fontWeight: "600", color: COLORS.text, marginTop: 2 },

  statusPill:     { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  statusPillText: { fontSize: FONT.sm, fontWeight: "700", letterSpacing: 0.2 },

  catatanBox: {
    flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg,
    backgroundColor: "#FFFBEB", borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  catatanLabel: { fontSize: FONT.xs, fontWeight: "700", color: "#92400E", marginBottom: 2 },
  catatanText:  { fontSize: FONT.base, color: "#78350F", lineHeight: 18 },

  // Section label
  sectionLabel: {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: "uppercase",
    marginTop: SPACING.xl, marginBottom: SPACING.sm,
  },

  // Timeline card
  timelineCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    paddingTop: SPACING.lg, paddingHorizontal: SPACING.lg, paddingBottom: 0,
    ...SHADOW.sm,
  },

  // Doc card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, ...SHADOW.sm,
  },
  dokRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  dokIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
  },
  dokName:      { flex: 1, fontSize: FONT.md, color: COLORS.text, fontWeight: "500" },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, marginTop: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: "dashed",
    borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  uploadBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: FONT.md },

  // Info box
  infoBox: {
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginTop: SPACING.xl,
  },
  infoBoxText: { flex: 1, fontSize: FONT.sm, color: COLORS.primary, lineHeight: 18 },

  branding: {
    textAlign: "center", fontSize: FONT.xs,
    color: COLORS.textMuted, letterSpacing: 1,
    marginTop: SPACING.xl, fontWeight: "600",
  },

  // Footer
  footer: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md, paddingHorizontal: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    ...SHADOW.sm,
  },
  footerBtnOutline: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.full, paddingVertical: SPACING.md,
    alignItems: "center", justifyContent: "center",
    minHeight: 54,
  },
  footerBtnOutlineText: {
    fontSize: FONT.md, fontWeight: "700", color: COLORS.text,
    textAlign: "center", lineHeight: 20,
  },
  footerBtnFilled: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, minHeight: 54, ...SHADOW.md,
  },
  footerBtnFilledText: {
    color: COLORS.white, fontSize: FONT.md, fontWeight: "700",
  },
  footerInfo: {
    flex: 1, flexDirection: "row", alignItems: "center",
    gap: SPACING.sm, justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  footerInfoText: {
    fontSize: FONT.sm, color: COLORS.textMuted, fontWeight: "500",
  },
  btnDisabled: { opacity: 0.5 },
});
