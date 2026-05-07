import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import api from "@/lib/api";

const STATUS_CONFIG: Record<string, { warna: string; label: string }> = {
  menunggu:    { warna: "#FFC107", label: "Menunggu" },
  diproses:    { warna: "#17A2B8", label: "Diproses" },
  selesai:     { warna: "#28A745", label: "Selesai ✓" },
  ditolak:     { warna: "#DC3545", label: "Ditolak" },
};

interface Aduan {
  id: number;
  judul: string;
  kategori: string;
  status: string;
  tanggal: string;
  deskripsi: string;
}

export default function RiwayatPengaduanScreen() {
  const router = useRouter();
  const [data, setData]         = useState<Aduan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/pengaduan");
      setData(res.data.data ?? res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.buatBtn} onPress={() => router.push("/pengaduan/buat")}>
        <Text style={styles.buatBtnText}>＋  Buat Pengaduan Baru</Text>
      </TouchableOpacity>

      {data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📣</Text>
          <Text style={styles.emptyText}>Belum ada pengaduan.</Text>
          <Text style={styles.emptySubtext}>Tekan tombol di atas untuk membuat pengaduan.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
          }
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] ?? { warna: "#999", label: item.status };
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.kategori}>{item.kategori}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.warna + "22" }]}>
                    <Text style={[styles.badgeText, { color: cfg.warna }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.judul}>{item.judul}</Text>
                <Text style={styles.deskripsi} numberOfLines={2}>{item.deskripsi}</Text>
                <Text style={styles.tanggal}>Dilaporkan: {item.tanggal}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: "#F0F2F5" },
  center:       { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  buatBtn:      { backgroundColor: "#17A2B8", margin: 16, padding: 14, borderRadius: 10, alignItems: "center" },
  buatBtnText:  { color: "#fff", fontWeight: "bold", fontSize: 15 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: "#888", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  kategori:     { fontSize: 11, fontWeight: "700", color: "#17A2B8", textTransform: "uppercase" },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:    { fontSize: 11, fontWeight: "700" },
  judul:        { fontSize: 15, fontWeight: "600", color: "#222", marginBottom: 4 },
  deskripsi:    { fontSize: 13, color: "#666", marginBottom: 6 },
  tanggal:      { fontSize: 12, color: "#999" },
});
