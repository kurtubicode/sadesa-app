import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import api from "@/lib/api";

const TIPE_CONFIG: Record<string, { warna: string; label: string; icon: string }> = {
  berita:       { warna: "#007BFF", label: "Berita",       icon: "📰" },
  pengumuman:   { warna: "#FFC107", label: "Pengumuman",   icon: "📢" },
};

interface Konten {
  id: number;
  judul: string;
  slug: string;
  tipe: string;
  created_at: string;
}

function formatTanggal(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

type FilterTipe = "semua" | "berita" | "pengumuman";

export default function InformasiDesaScreen() {
  const router = useRouter();
  const [data, setData]         = useState<Konten[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]     = useState<FilterTipe>("semua");

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

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  return (
    <View style={styles.screen}>
      {/* ── Filter tabs ── */}
      <View style={styles.filterRow}>
        {(["semua", "berita", "pengumuman"] as FilterTipe[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "semua" ? "Semua" : f === "berita" ? "📰 Berita" : "📢 Pengumuman"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Belum ada informasi.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
          }
          renderItem={({ item }) => {
            const cfg = TIPE_CONFIG[item.tipe] ?? { warna: "#888", label: item.tipe, icon: "📄" };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/informasi/${item.slug}` as any)}
                activeOpacity={0.8}
              >
                {/* Tipe badge */}
                <View style={[styles.tipeBadge, { backgroundColor: cfg.warna + "18" }]}>
                  <Text style={[styles.tipeBadgeText, { color: cfg.warna }]}>
                    {cfg.icon}  {cfg.label}
                  </Text>
                </View>
                <Text style={styles.judul}>{item.judul}</Text>
                <Text style={styles.tanggal}>{formatTanggal(item.created_at)}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: "#F0F2F5" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },

  // Filter
  filterRow: {
    flexDirection: "row", backgroundColor: "#fff",
    padding: 10, gap: 8,
    shadowColor: "#000", shadowOpacity: 0.04, elevation: 2,
  },
  filterBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: "#F0F2F5", alignItems: "center",
  },
  filterBtnActive:  { backgroundColor: "#007BFF" },
  filterText:       { fontSize: 13, color: "#555", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 16, fontWeight: "600", color: "#888" },

  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  tipeBadge:    { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  tipeBadgeText:{ fontSize: 11, fontWeight: "700" },
  judul:        { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 6, lineHeight: 22 },
  tanggal:      { fontSize: 12, color: "#999" },
});
