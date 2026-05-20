import { useCallback, useState } from "react";
import {
  View, Text, ScrollView, Image, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
  TouchableOpacity, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width }  = Dimensions.get("window");
const API_BASE   = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bukti {
  id: number;
  path_file: string;
}

interface Tanggapan {
  id: number;
  isi: string;
  created_at: string;
  user: { name: string; role: string };
}

interface DetailPengaduan {
  id: number;
  judul: string;
  deskripsi: string;
  status: string;
  created_at: string;
  kategori: { id: number; nama_kategori: string } | null;
  bukti: Bukti[];
  tanggapan: Tanggapan[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: "#FEF3C7", text: "#92400E", label: "Menunggu"  },
  diproses: { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses"  },
  selesai:  { bg: "#D1FAE5", text: "#065F46", label: "Selesai"   },
  ditolak:  { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak"   },
};

const ROLE_LABEL: Record<string, string> = {
  admin:       "Admin",
  staff:       "Petugas",
  kepala_desa: "Kepala Desa",
  warga:       "Warga",
};

const STEPS = [
  { key: "menunggu", label: "Laporan Dikirim"  },
  { key: "diproses", label: "Sedang Ditangani" },
  { key: "selesai",  label: "Selesai"          },
];

type StepState = "done" | "active" | "pending" | "rejected";

function getState(stepKey: string, status: string): StepState {
  if (status === "ditolak") {
    if (stepKey === "menunggu") return "done";
    if (stepKey === "diproses") return "rejected";
    return "pending";
  }
  const order = STEPS.map((s) => s.key);
  const ci    = order.indexOf(status);
  const si    = order.indexOf(stepKey);
  if (si < ci)  return "done";
  if (si === ci) return "active";
  return "pending";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTgl(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function formatTglWaktu(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DetailPengaduanScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [data, setData]             = useState<DetailPengaduan | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/pengaduan/${id}`);
      setData(res.data.data ?? res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        Alert.alert("Tidak Ditemukan", "Pengaduan tidak ditemukan.", [
          { text: "Kembali", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Gagal memuat detail pengaduan.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [id]));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.errorText}>Data tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = STATUS_MAP[data.status] ?? { bg: "#F3F4F6", text: "#374151", label: data.status };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header card ── */}
      <View style={styles.card}>
        {data.kategori && (
          <View style={styles.kategoriBadge}>
            <Ionicons name="pricetag-outline" size={12} color={COLORS.primary} />
            <Text style={styles.kategoriText}>{data.kategori.nama_kategori}</Text>
          </View>
        )}
        <Text style={styles.judul}>{data.judul}</Text>
        <View style={styles.headerMeta}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.tanggal}>{formatTgl(data.created_at)}</Text>
        </View>
      </View>

      {/* ── Deskripsi ── */}
      <Text style={styles.sectionLabel}>Deskripsi Laporan</Text>
      <View style={[styles.card, { padding: SPACING.lg }]}>
        <Text style={styles.bodyText}>{data.deskripsi}</Text>
      </View>

      {/* ── Timeline ── */}
      <Text style={styles.sectionLabel}>Perkembangan Status</Text>
      <View style={styles.card}>
        {STEPS.map((step, idx) => {
          const state   = getState(step.key, data.status);
          const isLast  = idx === STEPS.length - 1;
          const dotColor = state === "done"     ? COLORS.success
                         : state === "active"   ? COLORS.primary
                         : state === "rejected" ? COLORS.danger
                         : COLORS.border;
          return (
            <View key={step.key} style={styles.tlRow}>
              <View style={styles.tlLeft}>
                <View style={[styles.tlDot, { backgroundColor: dotColor, borderColor: dotColor }, state === "active" && styles.tlDotActive]} />
                {!isLast && <View style={[styles.tlLine, { backgroundColor: state === "done" ? COLORS.success : COLORS.border }]} />}
              </View>
              <Text style={[
                styles.tlLabel,
                state === "done"     && { color: COLORS.success, fontWeight: "600" },
                state === "active"   && { color: COLORS.primary, fontWeight: "700" },
                state === "rejected" && { color: COLORS.danger,  fontWeight: "700" },
              ]}>
                {step.label}
                {state === "active" && data.status !== "ditolak" && "  ←"}
              </Text>
            </View>
          );
        })}
        {data.status === "ditolak" && (
          <View style={[styles.tlRow, { alignItems: "center" }]}>
            <View style={[styles.tlDot, { backgroundColor: COLORS.danger, borderColor: COLORS.danger }]} />
            <Text style={[styles.tlLabel, { color: COLORS.danger, fontWeight: "700" }]}>
              Pengaduan Ditolak
            </Text>
          </View>
        )}
      </View>

      {/* ── Foto bukti ── */}
      {data.bukti.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Foto Bukti ({data.bukti.length})</Text>
          <View style={styles.fotoGrid}>
            {data.bukti.map((b) => {
              const uri = b.path_file.startsWith("http") ? b.path_file : `${API_BASE}/storage/${b.path_file}`;
              return (
                <View key={b.id} style={styles.fotoBox}>
                  <Image source={{ uri }} style={styles.foto} resizeMode="cover" onError={() => {}} />
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* ── Tanggapan ── */}
      <Text style={styles.sectionLabel}>
        Tanggapan Petugas{data.tanggapan.length > 0 ? ` (${data.tanggapan.length})` : ""}
      </Text>
      {data.tanggapan.length === 0 ? (
        <View style={[styles.card, styles.emptyTanggapan]}>
          <Ionicons name="chatbubbles-outline" size={28} color="#CCCCCC" />
          <Text style={styles.emptyTanggapanText}>Belum ada tanggapan dari petugas.</Text>
        </View>
      ) : (
        <View style={styles.tanggapanList}>
          {data.tanggapan.map((t) => {
            const isOfficer = t.user.role !== "warga";
            return (
              <View key={t.id} style={[styles.bubble, isOfficer ? styles.bubbleOfficer : styles.bubbleWarga]}>
                <View style={styles.bubbleHeader}>
                  <View style={styles.bubbleAuthor}>
                    <View style={[styles.bubbleAvatar, { backgroundColor: isOfficer ? COLORS.primaryLight : COLORS.inputBg }]}>
                      <Ionicons
                        name={isOfficer ? "shield-outline" : "person-outline"}
                        size={12}
                        color={isOfficer ? COLORS.primary : COLORS.textMuted}
                      />
                    </View>
                    <View>
                      <Text style={[styles.bubbleName, isOfficer && { color: COLORS.primary }]}>
                        {t.user.name}
                      </Text>
                      <Text style={styles.bubbleRole}>
                        {ROLE_LABEL[t.user.role] ?? t.user.role}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.bubbleTgl}>{formatTglWaktu(t.created_at)}</Text>
                </View>
                <Text style={[styles.bubbleIsi, isOfficer && { color: COLORS.primary }]}>
                  {t.isi}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: Math.max(insets.bottom, SPACING.xxxl) }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FOTO_W = (width - SPACING.lg * 2 - SPACING.md) / 2;

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.lg },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md, padding: SPACING.xxxl },
  errorText: { fontSize: FONT.md, color: COLORS.textMuted },
  backBtn:   { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, backgroundColor: COLORS.inputBg },
  backBtnText: { color: COLORS.text, fontWeight: "600" },

  sectionLabel: {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: "uppercase",
    marginTop: SPACING.xl, marginBottom: SPACING.sm,
  },

  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.sm },

  // Header
  kategoriBadge: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 3, marginBottom: SPACING.sm,
  },
  kategoriText:  { fontSize: FONT.xs, fontWeight: "700", color: COLORS.primary },
  judul:         { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.md },
  headerMeta:    { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  statusBadge:   { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText:    { fontSize: FONT.sm, fontWeight: "700" },
  tanggal:       { fontSize: FONT.sm, color: COLORS.textMuted },

  bodyText: { fontSize: FONT.md, color: COLORS.text, lineHeight: 22 },

  // Timeline
  tlRow:  { flexDirection: "row", alignItems: "flex-start" },
  tlLeft: { alignItems: "center", width: 28, marginRight: SPACING.md },
  tlDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: COLORS.border, borderWidth: 2, borderColor: COLORS.border,
  },
  tlDotActive:  { width: 18, height: 18, borderRadius: 9, marginLeft: -2 },
  tlLine:       { width: 2, height: 28, marginTop: 2 },
  tlLabel:      { fontSize: FONT.base, color: COLORS.textMuted, marginBottom: SPACING.xl },

  // Foto
  fotoGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  fotoBox:  { width: FOTO_W, height: FOTO_W, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.border },
  foto:     { width: "100%", height: "100%" },

  // Tanggapan
  emptyTanggapan: { alignItems: "center", gap: SPACING.sm },
  emptyTanggapanText: { color: COLORS.textMuted, fontSize: FONT.base },

  tanggapanList:   { gap: SPACING.md },
  bubble:          { borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.sm },
  bubbleOfficer:   { backgroundColor: COLORS.primaryLight, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  bubbleWarga:     { backgroundColor: COLORS.white },
  bubbleHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING.sm },
  bubbleAuthor:    { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  bubbleAvatar: {
    width: 28, height: 28, borderRadius: RADIUS.sm,
    justifyContent: "center", alignItems: "center",
  },
  bubbleName:      { fontSize: FONT.sm, fontWeight: "700", color: COLORS.text },
  bubbleRole:      { fontSize: FONT.xs, color: COLORS.textMuted },
  bubbleTgl:       { fontSize: FONT.xs, color: COLORS.textMuted },
  bubbleIsi:       { fontSize: FONT.md, color: COLORS.text, lineHeight: 20 },
});
