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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Konten {
  id: number;
  judul: string;
  slug: string;
  tipe: string;
  isi?: string;
  created_at: string;
}

type FilterTipe = "semua" | "berita" | "pengumuman" | "agenda";

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPE_MAP: Record<string, { bg: string; text: string; label: string }> = {
  berita:     { bg: COLORS.primaryLight, text: COLORS.primary, label: "BERITA"     },
  pengumuman: { bg: "#FEF3C7",           text: "#92400E",       label: "PENGUMUMAN" },
  agenda:     { bg: "#F0FDF4",           text: "#166534",       label: "AGENDA"     },
};

function formatTanggal(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InformasiDesaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData]             = useState<Konten[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState<FilterTipe>("semua");

  const fetchData = async () => {
    try {
      const res = await api.get("/api/informasi");
      setData(res.data.data ?? res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));

  const filtered = filter === "semua" ? data : data.filter((d) => d.tipe === filter);

  const FILTERS: { key: FilterTipe; label: string }[] = [
    { key: "semua",     label: "Semua"     },
    { key: "berita",    label: "Berita"    },
    { key: "pengumuman",label: "Pengumuman"},
    { key: "agenda",    label: "Agenda"    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ── Filter ── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="newspaper-outline" size={44} color="#CCCCCC" />
          <Text style={styles.emptyText}>Belum ada informasi.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xl }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => {
            const tc      = TIPE_MAP[item.tipe] ?? TIPE_MAP.berita;
            const excerpt = item.isi?.replace(/<[^>]+>/g, "").slice(0, 90);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/informasi/${item.slug}` as any)}
                activeOpacity={0.8}
              >
                {/* Thumbnail */}
                <View style={styles.thumbnail}>
                  <Ionicons name="image-outline" size={22} color="#CCCCCC" />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardMeta}>
                    <View style={[styles.badge, { backgroundColor: tc.bg }]}>
                      <Text style={[styles.badgeText, { color: tc.text }]}>{tc.label}</Text>
                    </View>
                    <Text style={styles.tanggal}>{formatTanggal(item.created_at)}</Text>
                  </View>
                  <Text style={styles.judul} numberOfLines={2}>{item.judul}</Text>
                  {excerpt ? (
                    <Text style={styles.excerpt} numberOfLines={2}>{excerpt}…</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.background },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md, padding: SPACING.xxxl },
  emptyText: { fontSize: FONT.base, color: COLORS.textMuted },

  // Filter
  filterRow: {
    flexDirection: "row", backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  filterBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:       { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: "600" },
  filterTextActive: { color: COLORS.white },

  // List — paddingBottom set dynamically via contentContainerStyle prop
  listContent: { padding: SPACING.lg, gap: SPACING.md },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    overflow: "hidden", ...SHADOW.sm,
  },
  thumbnail: {
    height: 130, backgroundColor: "#F0F0F0",
    justifyContent: "center", alignItems: "center",
  },
  cardBody: { padding: SPACING.lg },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  badge:     { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.xs },
  badgeText: { fontSize: FONT.xs, fontWeight: "700" },
  tanggal:   { fontSize: FONT.sm, color: COLORS.textMuted },
  judul:     { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text, lineHeight: 22, marginBottom: SPACING.xs },
  excerpt:   { fontSize: FONT.base, color: COLORS.textSecondary, lineHeight: 18 },
});
