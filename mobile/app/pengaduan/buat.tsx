import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";

interface KategoriAduan {
  id: number;
  nama_kategori: string;
  deskripsi: string;
}

export default function BuatPengaduanScreen() {
  const router = useRouter();

  const [kategoriList, setKategoriList]   = useState<KategoriAduan[]>([]);
  const [selectedKat, setSelectedKat]     = useState<KategoriAduan | null>(null);
  const [judul, setJudul]                 = useState("");
  const [deskripsi, setDeskripsi]         = useState("");
  const [foto, setFoto]                   = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loadingKat, setLoadingKat]       = useState(true);
  const [submitting, setSubmitting]       = useState(false);

  useEffect(() => {
    api.get("/api/kategori-aduan")
      .then((r) => setKategoriList(r.data.data ?? r.data))
      .catch(() => Alert.alert("Error", "Gagal memuat kategori aduan."))
      .finally(() => setLoadingKat(false));
  }, []);

  // ── Pilih foto dari galeri ──
  const handlePilihFoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin Dibutuhkan", "Izin galeri diperlukan untuk melampirkan foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const ext   = asset.uri.split(".").pop() ?? "jpg";
      setFoto({ uri: asset.uri, name: `bukti_${Date.now()}.${ext}`, type: `image/${ext}` });
    }
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!selectedKat) return Alert.alert("Perhatian", "Pilih kategori pengaduan.");
    if (!judul.trim())     return Alert.alert("Perhatian", "Judul tidak boleh kosong.");
    if (!deskripsi.trim()) return Alert.alert("Perhatian", "Deskripsi tidak boleh kosong.");

    const formData = new FormData();
    formData.append("kategori_aduan_id", String(selectedKat.id));
    formData.append("judul",     judul.trim());
    formData.append("deskripsi", deskripsi.trim());
    if (foto) {
      formData.append("bukti", { uri: foto.uri, name: foto.name, type: foto.type } as any);
    }

    setSubmitting(true);
    try {
      await api.post("/api/pengaduan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Berhasil", "Pengaduan berhasil dikirim! Kami akan segera menindaklanjuti.", [
        { text: "OK", onPress: () => router.replace("/pengaduan") },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal mengirim pengaduan.";
      Alert.alert("Gagal", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingKat) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#17A2B8" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>

      {/* ── Kategori ── */}
      <Text style={styles.label}>Kategori Pengaduan <Text style={styles.required}>*</Text></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {kategoriList.map((kat) => {
          const active = selectedKat?.id === kat.id;
          return (
            <TouchableOpacity
              key={kat.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSelectedKat(kat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{kat.nama_kategori}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {selectedKat?.deskripsi ? (
        <Text style={styles.katDesc}>{selectedKat.deskripsi}</Text>
      ) : null}

      {/* ── Judul ── */}
      <Text style={[styles.label, { marginTop: 20 }]}>Judul Pengaduan <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: Jalan berlubang di Jl. Raya Cirangkong"
        placeholderTextColor="#aaa"
        value={judul}
        onChangeText={setJudul}
        maxLength={100}
      />

      {/* ── Deskripsi ── */}
      <Text style={[styles.label, { marginTop: 16 }]}>Deskripsi <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.textArea}
        placeholder="Jelaskan secara rinci permasalahan yang ingin Anda laporkan…"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={deskripsi}
        onChangeText={setDeskripsi}
      />

      {/* ── Foto bukti ── */}
      <Text style={[styles.label, { marginTop: 16 }]}>Foto Bukti <Text style={styles.optional}>(Opsional)</Text></Text>
      {foto ? (
        <View style={styles.fotoPreviewBox}>
          <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
          <TouchableOpacity style={styles.hapusFotoBtn} onPress={() => setFoto(null)}>
            <Text style={styles.hapusFotoText}>✕  Hapus Foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.pilihFotoBtn} onPress={handlePilihFoto} activeOpacity={0.8}>
          <Text style={styles.pilihFotoIcon}>📷</Text>
          <Text style={styles.pilihFotoText}>Pilih Foto dari Galeri</Text>
        </TouchableOpacity>
      )}

      {/* ── Info ── */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️  Pengaduan akan ditindaklanjuti oleh petugas desa dalam 1–3 hari kerja.
          Harap sertakan informasi yang jelas dan akurat.
        </Text>
      </View>

      {/* ── Submit ── */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Kirim Pengaduan</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: "#F0F2F5" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center" },
  label:            { fontSize: 13, fontWeight: "700", color: "#444", marginBottom: 8 },
  required:         { color: "#DC3545" },
  optional:         { fontWeight: "400", color: "#888" },

  // Chip kategori
  chipScroll:       { marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#DDD",
    marginRight: 8,
  },
  chipActive:       { backgroundColor: "#17A2B8", borderColor: "#17A2B8" },
  chipText:         { fontSize: 13, color: "#555", fontWeight: "600" },
  chipTextActive:   { color: "#fff" },
  katDesc:          { fontSize: 12, color: "#888", marginTop: 4, marginBottom: 4 },

  // Inputs
  input: {
    backgroundColor: "#fff", borderRadius: 10, padding: 12,
    fontSize: 14, color: "#222", borderWidth: 1, borderColor: "#DDD",
  },
  textArea: {
    backgroundColor: "#fff", borderRadius: 10, padding: 12,
    fontSize: 14, color: "#222", borderWidth: 1, borderColor: "#DDD",
    minHeight: 120,
  },

  // Foto
  pilihFotoBtn: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 2,
    borderColor: "#DDD", borderStyle: "dashed", padding: 24,
    alignItems: "center", gap: 8,
  },
  pilihFotoIcon:    { fontSize: 28 },
  pilihFotoText:    { fontSize: 14, color: "#888", fontWeight: "600" },
  fotoPreviewBox:   { borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" },
  fotoPreview:      { width: "100%", height: 200, resizeMode: "cover" },
  hapusFotoBtn:     { padding: 10, alignItems: "center", backgroundColor: "#FFF5F5" },
  hapusFotoText:    { color: "#DC3545", fontWeight: "700", fontSize: 13 },

  // Info
  infoBox: {
    backgroundColor: "#E8F4FD", borderRadius: 10, padding: 12, marginTop: 16,
  },
  infoText:         { fontSize: 12, color: "#1A6FA8", lineHeight: 18 },

  // Submit
  submitBtn: {
    backgroundColor: "#17A2B8", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 20,
  },
  submitBtnDisabled: { backgroundColor: "#A0D8E6" },
  submitBtnText:    { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
