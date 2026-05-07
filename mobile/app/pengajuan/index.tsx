import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import api from "@/lib/api";

// ─── Konfigurasi warna & label status ────────────────────────────────────────

const STATUS_CONFIG: Record<string, { warna: string; label: string }> = {
  menunggu:             { warna: "#FFC107", label: "Menunggu" },
  diproses:             { warna: "#17A2B8", label: "Diproses" },
  diverifikasi:         { warna: "#007BFF", label: "Diverifikasi" },
  ditolak_staff:        { warna: "#DC3545", label: "Ditolak Petugas" },
  menunggu_pengesahan:  { warna: "#6F42C1", label: "Menunggu Pengesahan" },
  disetujui:            { warna: "#28A745", label: "Disetujui ✓" },
  ditolak_kepala:       { warna: "#DC3545", label: "Ditolak Kepala Desa" },
  selesai:              { warna: "#28A745", label: "Selesai ✓" },
  dibatalkan:           { warna: "#6C757D", label: "Dibatalkan" },
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
  const [data, setData]         = useState<Pengajuan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/pengajuan");
      setData(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh setiap kali layar difokus (misal balik dari detail)
  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.ajukanBtn} onPress={() => router.push("/pengajuan/buat")}>
        <Text style={styles.ajukanBtnText}>＋  Ajukan Surat Baru</Text>
      </TouchableOpacity>

      {data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>Belum ada pengajuan.</Text>
          <Text style={styles.emptySubtext}>Tekan tombol di atas untuk mengajukan surat.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] ?? { warna: "#999", label: item.status };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/pengajuan/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.noPengajuan}>{item.no_pengajuan}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.warna + "22" }]}>
                    <Text style={[styles.badgeText, { color: cfg.warna }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.jenisSurat}>{item.jenis_surat}</Text>
                <Text style={styles.tanggal}>Diajukan: {item.tanggal}</Text>
                {item.catatan && (
                  <Text style={styles.catatan}>📝 {item.catatan}</Text>
                )}
              </TouchableOpacity>
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
  ajukanBtn:    { backgroundColor: "#007BFF", margin: 16, padding: 14, borderRadius: 10, alignItems: "center" },
  ajukanBtnText:{ color: "#fff", fontWeight: "bold", fontSize: 15 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: "#888", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  noPengajuan:  { fontSize: 12, color: "#888", fontWeight: "600" },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:    { fontSize: 11, fontWeight: "700" },
  jenisSurat:   { fontSize: 15, fontWeight: "600", color: "#222", marginBottom: 4 },
  tanggal:      { fontSize: 12, color: "#999" },
  catatan:      { fontSize: 12, color: "#666", marginTop: 6, fontStyle: "italic" },
});
