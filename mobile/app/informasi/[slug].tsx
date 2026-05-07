import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import api from "@/lib/api";

const TIPE_CONFIG: Record<string, { warna: string; label: string; icon: string }> = {
  berita:       { warna: "#007BFF", label: "Berita",       icon: "📰" },
  pengumuman:   { warna: "#FFC107", label: "Pengumuman",   icon: "📢" },
};

interface KontenDetail {
  id: number;
  judul: string;
  slug: string;
  tipe: string;
  konten: string;
  penulis: string | null;
  created_at: string;
  updated_at: string;
}

function formatTanggal(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export default function DetailInformasiScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [data, setData]         = useState<KontenDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/informasi/${slug}`);
      setData(res.data.data ?? res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [slug]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>Konten tidak ditemukan.</Text>
      </View>
    );
  }

  const cfg = TIPE_CONFIG[data.tipe] ?? { warna: "#888", label: data.tipe, icon: "📄" };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* Tipe badge */}
      <View style={[styles.tipeBadge, { backgroundColor: cfg.warna + "18" }]}>
        <Text style={[styles.tipeBadgeText, { color: cfg.warna }]}>
          {cfg.icon}  {cfg.label}
        </Text>
      </View>

      {/* Judul */}
      <Text style={styles.judul}>{data.judul}</Text>

      {/* Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatTanggal(data.created_at)}</Text>
        {data.penulis ? (
          <Text style={styles.meta}>  ·  {data.penulis}</Text>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Konten */}
      <Text style={styles.konten}>{data.konten}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: "#fff" },
  content:        { padding: 20, paddingBottom: 48 },
  center:         { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorIcon:      { fontSize: 48, marginBottom: 12 },
  errorText:      { fontSize: 15, color: "#888" },

  tipeBadge:      { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, marginBottom: 14 },
  tipeBadgeText:  { fontSize: 12, fontWeight: "700" },
  judul:          { fontSize: 22, fontWeight: "800", color: "#111", lineHeight: 32, marginBottom: 10 },

  metaRow:        { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  meta:           { fontSize: 12, color: "#999" },

  divider:        { height: 1, backgroundColor: "#EEE", marginBottom: 20 },

  konten:         { fontSize: 15, color: "#333", lineHeight: 26 },
});
