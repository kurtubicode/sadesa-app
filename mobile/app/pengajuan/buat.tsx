import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";

interface MasterSurat {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string | null;
  persyaratan: string | null;
}

export default function BuatPengajuanScreen() {
  const router = useRouter();

  const [masterList, setMasterList]   = useState<MasterSurat[]>([]);
  const [selected, setSelected]       = useState<MasterSurat | null>(null);
  const [keterangan, setKeterangan]   = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    api.get("/api/master-surat")
      .then((r) => setMasterList(r.data.data ?? r.data))
      .catch(() => Alert.alert("Error", "Gagal memuat daftar surat."))
      .finally(() => setLoadingList(false));
  }, []);

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert("Perhatian", "Pilih jenis surat terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/pengajuan", {
        master_surat_id: selected.id,
        keterangan: keterangan.trim() || null,
      });
      Alert.alert("Berhasil", "Pengajuan surat berhasil dikirim!", [
        { text: "OK", onPress: () => router.replace("/pengajuan") },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal mengirim pengajuan.";
      Alert.alert("Gagal", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingList) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>

      {/* ── Pilih jenis surat ── */}
      <Text style={styles.sectionTitle}>Pilih Jenis Surat</Text>
      {masterList.map((item) => {
        const active = selected?.id === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                  {item.nama}
                </Text>
                <Text style={styles.cardCode}>{item.kode}</Text>
                {item.deskripsi ? (
                  <Text style={styles.cardDesc}>{item.deskripsi}</Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* ── Persyaratan (jika ada) ── */}
      {selected?.persyaratan ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Persyaratan</Text>
          <Text style={styles.infoText}>{selected.persyaratan}</Text>
        </View>
      ) : null}

      {/* ── Keterangan ── */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Keterangan Tambahan</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Tuliskan keterangan tambahan (opsional)…"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={keterangan}
        onChangeText={setKeterangan}
      />

      {/* ── Catatan pengingat ── */}
      <View style={styles.reminderBox}>
        <Text style={styles.reminderText}>
          ℹ️  Setelah pengajuan dikirim, petugas akan memverifikasi berkas Anda.
          Pantau statusnya di menu <Text style={{ fontWeight: "700" }}>Status Layanan</Text>.
        </Text>
      </View>

      {/* ── Tombol kirim ── */}
      <TouchableOpacity
        style={[styles.submitBtn, (!selected || submitting) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!selected || submitting}
        activeOpacity={0.85}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Kirim Pengajuan</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: "#F0F2F5" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle:     { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 2, borderColor: "transparent",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardActive:       { borderColor: "#007BFF", backgroundColor: "#EAF3FF" },
  cardRow:          { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: "#ccc",
    justifyContent: "center", alignItems: "center", marginTop: 2,
  },
  radioActive:      { borderColor: "#007BFF" },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: "#007BFF" },
  cardTitle:        { fontSize: 15, fontWeight: "600", color: "#222" },
  cardTitleActive:  { color: "#0056CC" },
  cardCode:         { fontSize: 11, color: "#888", marginTop: 2 },
  cardDesc:         { fontSize: 12, color: "#666", marginTop: 4 },
  infoBox: {
    backgroundColor: "#FFF8E1", borderRadius: 10, padding: 14,
    borderLeftWidth: 4, borderLeftColor: "#FFC107", marginTop: 8,
  },
  infoTitle:        { fontSize: 13, fontWeight: "700", color: "#8B6914", marginBottom: 6 },
  infoText:         { fontSize: 13, color: "#5A4000", lineHeight: 20 },
  textArea: {
    backgroundColor: "#fff", borderRadius: 10, padding: 12,
    fontSize: 14, color: "#222", borderWidth: 1, borderColor: "#DDD",
    minHeight: 100,
  },
  reminderBox: {
    backgroundColor: "#E8F4FD", borderRadius: 10, padding: 12, marginTop: 16,
  },
  reminderText:     { fontSize: 12, color: "#1A6FA8", lineHeight: 18 },
  submitBtn: {
    backgroundColor: "#007BFF", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 20,
  },
  submitBtnDisabled: { backgroundColor: "#A0C4F1" },
  submitBtnText:    { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
