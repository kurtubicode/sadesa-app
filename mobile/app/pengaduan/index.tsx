import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: "#FEF3C7", text: "#92400E", label: "Menunggu" },
  diproses: { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses" },
  selesai:  { bg: "#D1FAE5", text: "#065F46", label: "Selesai"  },
  ditolak:  { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak"  },
};

interface Aduan {
  id: number;
  judul: string;
  kategori?: string;
  status: string;
  tanggal: string;
}

export default function RiwayatPengaduanScreen() {
  const router = useRouter();
  const [data, setData]             = useState<Aduan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/pengaduan");
      setData(res.data.data ?? res.data);
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
        onPress={() => router.push("/pengaduan/buat")}
        activeOpacity={0.85}
      >
        <Ionicons name="megaphone-outline" size={20} color={COLORS.white} />
        <Text style={styles.ctaBtnText}>Buat Pengaduan Baru</Text>
      </TouchableOpacity>

      {data.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="megaphone-outline" size={44} color="#CCCCCC" />
          <Text style={styles.emptyText}>Belum ada pengaduan.</Text>
          <Text style={styles.emptySub}>Tekan tombol di atas untuk membuat laporan.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => {
            const cfg = STATUS_MAP[item.status] ?? { bg: "#F3F4F6", text: "#374151", label: item.status };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/pengaduan/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardNo}>#{String(item.id).padStart(4, "0")}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
                  </View>
                </View>
                {item.kategori ? (
                  <View style={styles.kategoriBadge}>
                    <Ionicons name="pricetag-outline" size={11} color={COLORS.primary} />
                    <Text style={styles.kategoriText}>{item.kategori}</Text>
                  </View>
                ) : null}
                <Text style={styles.cardTitle} numberOfLines={2}>{item.judul}</Text>
                <View style={styles.cardFooter}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.cardDate}>{item.tanggal}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ marginLeft: "auto" }} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: "#E07B39",
    margin: SPACING.lg, borderRadius: RADIUS.full, height: 50, ...SHADOW.md,
  },
  ctaBtnText: { color: COLORS.white, fontWeight: "700", fontSize: FONT.xl },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.sm, padding: SPACING.xxxl },
  emptyText: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text },
  emptySub:  { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center" },

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.sm,
  },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: SPACING.sm,
  },
  cardNo: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: "600" },

  kategoriBadge: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2, marginBottom: SPACING.xs,
  },
  kategoriText: { fontSize: FONT.xs, fontWeight: "700", color: COLORS.primary },

  cardTitle:  { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text, lineHeight: 22, marginBottom: SPACING.sm },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  cardDate:   { fontSize: FONT.sm, color: COLORS.textMuted },

  badge:     { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  badgeText: { fontSize: FONT.xs, fontWeight: "700" },
});
