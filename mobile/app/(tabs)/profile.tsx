import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  getUser,
  clearSession,
  UserData,
  ROLE_LABEL,
  STATUS_LABEL,
} from "@/lib/userStorage";
import api from "@/lib/api";

// ─── Baris info ──────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const [user, setUser]     = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((u) => { setUser(u); setLoading(false); });
  }, []);

  const handleLogout = () => {
    Alert.alert("Konfirmasi Keluar", "Yakin ingin keluar dari SADESA?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post("/api/logout");
          } catch {
            // lanjutkan logout lokal meski server tidak terjangkau
          } finally {
            await clearSession();
            router.replace("/");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!user) {
    router.replace("/");
    return null;
  }

  const statusColor = {
    aktif:               "#28A745",
    nonaktif:            "#DC3545",
    menunggu_verifikasi: "#FFC107",
  }[user.status];

  return (
    <ScrollView style={styles.screen}>
      {/* Header avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName}>{user.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABEL[user.status]}
          </Text>
        </View>
      </View>

      {/* Kartu info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Akun</Text>
        <InfoRow label="NIK"    value={user.nik ?? "—"} />
        <InfoRow label="Email"  value={user.email} />
        <InfoRow label="No. HP" value={user.phone ?? "—"} />
        <InfoRow label="Role"   value={ROLE_LABEL[user.role]} />
      </View>

      {/* Tombol logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Keluar</Text>
      </TouchableOpacity>

      {/* Versi aplikasi */}
      <Text style={styles.version}>SADESA v1.0.0 · Desa Cirangkong</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: "#F0F2F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: "#007BFF",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText:   { fontSize: 30, fontWeight: "bold", color: "#007BFF" },
  headerName:   { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  statusBadge:  { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText:   { fontSize: 13, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: { color: "#888", fontSize: 14 },
  infoValue: { color: "#333", fontSize: 14, fontWeight: "500", maxWidth: "60%", textAlign: "right" },

  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutText: { color: "#FF3B30", fontSize: 15, fontWeight: "bold" },

  version: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
