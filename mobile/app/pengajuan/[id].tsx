import { useCallback, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import api from "@/lib/api";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { warna: string; label: string; icon: string }> = {
  menunggu:             { warna: "#FFC107", label: "Menunggu",              icon: "⏳" },
  diproses:             { warna: "#17A2B8", label: "Diproses",              icon: "🔄" },
  diverifikasi:         { warna: "#007BFF", label: "Diverifikasi",          icon: "✅" },
  ditolak_staff:        { warna: "#DC3545", label: "Ditolak Petugas",       icon: "❌" },
  menunggu_pengesahan:  { warna: "#6F42C1", label: "Menunggu Pengesahan",   icon: "📋" },
  disetujui:            { warna: "#28A745", label: "Disetujui",             icon: "✅" },
  ditolak_kepala:       { warna: "#DC3545", label: "Ditolak Kepala Desa",   icon: "❌" },
  selesai:              { warna: "#28A745", label: "Selesai",               icon: "🎉" },
  dibatalkan:           { warna: "#6C757D", label: "Dibatalkan",            icon: "🚫" },
};

// ─── Timeline helper ──────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: "menunggu",            label: "Pengajuan Dikirim" },
  { key: "diproses",            label: "Diproses Petugas" },
  { key: "diverifikasi",        label: "Diverifikasi" },
  { key: "menunggu_pengesahan", label: "Menunggu Pengesahan" },
  { key: "selesai",             label: "Selesai" },
];
const TERMINAL_REJECT = ["ditolak_staff", "ditolak_kepala", "dibatalkan"];

function getStepState(stepKey: string, currentStatus: string): "done" | "active" | "pending" | "rejected" {
  if (TERMINAL_REJECT.includes(currentStatus)) {
    const stepIdx = TIMELINE_STEPS.findIndex((s) => s.key === stepKey);
    const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus);
    // treat rejected as "stopped at last active step"
    const stoppedAt = currentIdx === -1 ? 1 : currentIdx;
    if (stepIdx < stoppedAt) return "done";
    if (stepIdx === stoppedAt) return "rejected";
    return "pending";
  }
  const order = TIMELINE_STEPS.map((s) => s.key);
  const currentIdx = order.indexOf(currentStatus === "disetujui" ? "selesai" : currentStatus);
  const stepIdx    = order.indexOf(stepKey);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dokumen {
  id: number;
  nama_file: string;
  tipe: string;
  url: string;
}

interface DetailPengajuan {
  id: number;
  no_pengajuan: string;
  jenis_surat: string;
  status: string;
  keterangan: string | null;
  catatan: string | null;
  tanggal: string;
  dokumen: Dokumen[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DetailPengajuanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  const [data, setData]           = useState<DetailPengajuan | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/pengajuan/${id}`);
      setData(res.data.data ?? res.data);
    } catch {
      Alert.alert("Error", "Gagal memuat detail pengajuan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [id]));

  // ── Upload dokumen ──
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append("dokumen", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      } as any);

      setUploading(true);
      await api.post(`/api/pengajuan/${id}/dokumen`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Berhasil", "Dokumen berhasil diunggah.");
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal mengunggah dokumen.";
      Alert.alert("Gagal", msg);
    } finally {
      setUploading(false);
    }
  };

  // ── Batalkan ──
  const handleBatalkan = () => {
    Alert.alert(
      "Batalkan Pengajuan",
      "Yakin ingin membatalkan pengajuan ini? Tindakan tidak dapat dibatalkan.",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await api.delete(`/api/pengajuan/${id}`);
              Alert.alert("Berhasil", "Pengajuan telah dibatalkan.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err: any) {
              const msg = err?.response?.data?.message ?? "Gagal membatalkan.";
              Alert.alert("Gagal", msg);
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Data tidak ditemukan.</Text>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[data.status] ?? { warna: "#999", label: data.status, icon: "❓" };
  const canUpload  = ["menunggu", "diproses"].includes(data.status);
  const canCancel  = ["menunggu", "diproses"].includes(data.status);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* ── Header card ── */}
      <View style={styles.headerCard}>
        <Text style={styles.noPengajuan}>{data.no_pengajuan}</Text>
        <Text style={styles.jenisSurat}>{data.jenis_surat}</Text>
        <Text style={styles.tanggal}>Diajukan: {data.tanggal}</Text>

        <View style={[styles.statusBadge, { backgroundColor: cfg.warna + "22" }]}>
          <Text style={[styles.statusBadgeText, { color: cfg.warna }]}>
            {cfg.icon}  {cfg.label}
          </Text>
        </View>

        {data.catatan ? (
          <View style={styles.catatanBox}>
            <Text style={styles.catatanLabel}>Catatan Petugas:</Text>
            <Text style={styles.catatanText}>{data.catatan}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Timeline ── */}
      <Text style={styles.sectionTitle}>Perkembangan Status</Text>
      <View style={styles.timelineCard}>
        {TIMELINE_STEPS.map((step, idx) => {
          const state = getStepState(step.key, data.status);
          const isLast = idx === TIMELINE_STEPS.length - 1;
          return (
            <View key={step.key} style={styles.timelineRow}>
              {/* Dot + line */}
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineDot,
                  state === "done"     && styles.dotDone,
                  state === "active"   && styles.dotActive,
                  state === "rejected" && styles.dotRejected,
                ]} />
                {!isLast && <View style={[styles.timelineLine, state === "done" && styles.lineDone]} />}
              </View>

              {/* Label */}
              <Text style={[
                styles.timelineLabel,
                state === "done"   && styles.labelDone,
                state === "active" && styles.labelActive,
                state === "rejected" && styles.labelRejected,
              ]}>
                {step.label}
                {state === "active" && !TERMINAL_REJECT.includes(data.status) && "  ←"}
              </Text>
            </View>
          );
        })}

        {/* Rejection terminal */}
        {TERMINAL_REJECT.includes(data.status) && (
          <View style={styles.rejectionRow}>
            <View style={[styles.timelineDot, styles.dotRejected]} />
            <Text style={styles.labelRejected}>{cfg.icon} {cfg.label}</Text>
          </View>
        )}
      </View>

      {/* ── Keterangan ── */}
      {data.keterangan ? (
        <>
          <Text style={styles.sectionTitle}>Keterangan</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{data.keterangan}</Text>
          </View>
        </>
      ) : null}

      {/* ── Dokumen ── */}
      <Text style={styles.sectionTitle}>Dokumen Pendukung</Text>
      <View style={styles.dokumenCard}>
        {data.dokumen.length === 0 ? (
          <Text style={styles.emptyDokumen}>Belum ada dokumen diunggah.</Text>
        ) : (
          data.dokumen.map((dok) => (
            <View key={dok.id} style={styles.dokumenRow}>
              <Text style={styles.dokumenIcon}>
                {dok.tipe?.includes("pdf") ? "📄" : "🖼️"}
              </Text>
              <Text style={styles.dokumenNama} numberOfLines={1}>{dok.nama_file}</Text>
            </View>
          ))
        )}

        {canUpload && (
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handleUpload}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading
              ? <ActivityIndicator color="#007BFF" size="small" />
              : <Text style={styles.uploadBtnText}>＋  Unggah Dokumen (PDF / Gambar)</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {/* ── Batalkan ── */}
      {canCancel && (
        <TouchableOpacity
          style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
          onPress={handleBatalkan}
          disabled={cancelling}
          activeOpacity={0.8}
        >
          {cancelling
            ? <ActivityIndicator color="#DC3545" size="small" />
            : <Text style={styles.cancelBtnText}>Batalkan Pengajuan</Text>
          }
        </TouchableOpacity>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: "#F0F2F5" },
  center:         { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorText:      { fontSize: 15, color: "#888" },
  sectionTitle:   { fontSize: 12, fontWeight: "700", color: "#666", marginTop: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },

  // Header
  headerCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 18,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  noPengajuan:    { fontSize: 12, color: "#888", fontWeight: "600", marginBottom: 2 },
  jenisSurat:     { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 4 },
  tanggal:        { fontSize: 13, color: "#999", marginBottom: 12 },
  statusBadge:    { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText:{ fontSize: 13, fontWeight: "700" },
  catatanBox:     { marginTop: 12, backgroundColor: "#FFF3CD", borderRadius: 8, padding: 12 },
  catatanLabel:   { fontSize: 11, fontWeight: "700", color: "#856404", marginBottom: 4 },
  catatanText:    { fontSize: 13, color: "#533F03" },

  // Timeline
  timelineCard:   { backgroundColor: "#fff", borderRadius: 14, padding: 18, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  timelineRow:    { flexDirection: "row", alignItems: "flex-start" },
  timelineLeft:   { alignItems: "center", width: 24, marginRight: 12 },
  timelineDot:    { width: 14, height: 14, borderRadius: 7, backgroundColor: "#DDD", borderWidth: 2, borderColor: "#CCC" },
  dotDone:        { backgroundColor: "#28A745", borderColor: "#28A745" },
  dotActive:      { backgroundColor: "#007BFF", borderColor: "#007BFF", width: 18, height: 18, borderRadius: 9, marginLeft: -2 },
  dotRejected:    { backgroundColor: "#DC3545", borderColor: "#DC3545" },
  timelineLine:   { width: 2, height: 28, backgroundColor: "#E0E0E0", marginTop: 2 },
  lineDone:       { backgroundColor: "#28A745" },
  timelineLabel:  { fontSize: 13, color: "#BBB", paddingTop: 0, marginBottom: 18 },
  labelDone:      { color: "#28A745", fontWeight: "600" },
  labelActive:    { color: "#007BFF", fontWeight: "700" },
  labelRejected:  { color: "#DC3545", fontWeight: "700" },
  rejectionRow:   { flexDirection: "row", alignItems: "center", gap: 14 },

  // Keterangan
  infoCard:       { backgroundColor: "#fff", borderRadius: 12, padding: 14, shadowColor: "#000", shadowOpacity: 0.04, elevation: 1 },
  infoText:       { fontSize: 14, color: "#444", lineHeight: 22 },

  // Dokumen
  dokumenCard:    { backgroundColor: "#fff", borderRadius: 12, padding: 14, shadowColor: "#000", shadowOpacity: 0.04, elevation: 1 },
  emptyDokumen:   { fontSize: 13, color: "#aaa", marginBottom: 12 },
  dokumenRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", gap: 10 },
  dokumenIcon:    { fontSize: 20 },
  dokumenNama:    { flex: 1, fontSize: 13, color: "#333" },
  uploadBtn: {
    marginTop: 12, borderWidth: 2, borderColor: "#007BFF", borderStyle: "dashed",
    borderRadius: 10, padding: 14, alignItems: "center",
  },
  uploadBtnText:  { color: "#007BFF", fontWeight: "600", fontSize: 14 },

  // Cancel
  cancelBtn: {
    marginTop: 20, borderWidth: 1.5, borderColor: "#DC3545",
    borderRadius: 12, padding: 15, alignItems: "center",
    backgroundColor: "#FFF5F5",
  },
  cancelBtnText:  { color: "#DC3545", fontWeight: "700", fontSize: 15 },
});
