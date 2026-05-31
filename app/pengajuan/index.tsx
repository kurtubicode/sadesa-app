import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  menunggu:            { bg: "#FEF3C7", text: "#92400E", label: "Menunggu" },
  diproses:            { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses" },
  diverifikasi:        { bg: "#EDE9FE", text: "#5B21B6", label: "Diverifikasi" },
  ditolak_staff:       { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak Petugas" },
  menunggu_pengesahan: { bg: "#F3E8FF", text: "#6B21A8", label: "Menunggu Pengesahan" },
  disetujui:           { bg: "#D1FAE5", text: "#065F46", label: "Disetujui" },
  ditolak_kepala:      { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak" },
  selesai:             { bg: "#D1FAE5", text: "#065F46", label: "Selesai" },
  dibatalkan:          { bg: "#F3F4F6", text: "#374151", label: "Dibatalkan" },
};

interface Pengajuan {
  id: number;
  no_pengajuan: string;
  jenis_surat: string;
  status: string;
  catatan: string | null;
  tanggal: string;
}

export default function RiwayatPengajuanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData]             = useState<Pengajuan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/pengajuan");
      setData(res.data.data ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ── CTA ── */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push("/pengajuan/buat")}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
        <Text style={styles.ctaBtnText}>Ajukan Surat Baru</Text>
      </TouchableOpacity>

      {data.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="document-outline" size={44} color="#CCCCCC" />
          <Text style={styles.emptyText}>Belum ada pengajuan.</Text>
          <Text style={styles.emptySub}>Tekan tombol di atas untuk mengajukan surat.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xl }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => {
            const cfg = STATUS_MAP[item.status] ?? { bg: "#F3F4F6", text: "#374151", label: item.status };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/pengajuan/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardNo}>{item.no_pengajuan}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.jenis_surat}</Text>
                <View style={styles.cardFooter}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.cardDate}>{item.tanggal}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ marginLeft: "auto" }} />
                </View>
                {item.catatan ? (
                  <View style={styles.catatanRow}>
                    <Ionicons name="chatbubble-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.catatanText} numberOfLines={1}>{item.catatan}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: COLORS.background },
  center:   { flex: 1, justifyContent: "center", alignItems: "center" },

  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    margin: SPACING.lg, borderRadius: RADIUS.full, height: 50, ...SHADOW.md,
  },
  ctaBtnText: { color: COLORS.white, fontWeight: "700", fontSize: FONT.xl },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.sm, padding: SPACING.xxxl },
  emptyText: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text },
  emptySub:  { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center" },

  listContent: { paddingHorizontal: SPACING.lg },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.sm,
  },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: SPACING.sm,
  },
  cardNo:     { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: "600" },
  cardTitle:  { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text, lineHeight: 22, marginBottom: SPACING.sm },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  cardDate:   { fontSize: FONT.sm, color: COLORS.textMuted },

  badge:     { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  badgeText: { fontSize: FONT.xs, fontWeight: "700" },

  catatanRow: { flexDirection: "row", gap: SPACING.xs, alignItems: "center", marginTop: SPACING.xs },
  catatanText:{ fontSize: FONT.sm, color: COLORS.textSecondary, fontStyle: "italic", flex: 1 },
});
