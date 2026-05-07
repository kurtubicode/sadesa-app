import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getUser, UserData, ROLE_LABEL } from "@/lib/userStorage";

// ─── Menu per role ────────────────────────────────────────────────────────────

const MENU_WARGA = [
  { label: "Ajukan Surat",    icon: "📄", route: "/pengajuan/buat",  warna: "#007BFF" },
  { label: "Status Layanan",  icon: "🔍", route: "/pengajuan",       warna: "#28A745" },
  { label: "Pengaduan",       icon: "📢", route: "/pengaduan/buat",  warna: "#FFC107" },
  { label: "Informasi Desa",  icon: "🏡", route: "/informasi",       warna: "#6F42C1" },
];

const MENU_STAFF = [
  { label: "Antrian Masuk",   icon: "📋", route: "/staff/pengajuan", warna: "#007BFF" },
  { label: "Verifikasi Berkas", icon: "✅", route: "/staff/verifikasi", warna: "#28A745" },
  { label: "Pengaduan",       icon: "📢", route: "/staff/pengaduan", warna: "#FFC107" },
];

const MENU_KEPALA_DESA = [
  { label: "Pengesahan",      icon: "🖊️", route: "/kepala/pengesahan", warna: "#007BFF" },
  { label: "Statistik",       icon: "📊", route: "/kepala/statistik",  warna: "#28A745" },
  { label: "Laporan Bulanan", icon: "📑", route: "/kepala/laporan",    warna: "#6F42C1" },
];

const MENU_ADMIN = [
  { label: "Kelola Pengguna", icon: "👥", route: "/admin/pengguna",  warna: "#007BFF" },
  { label: "Kelola Surat",    icon: "📄", route: "/admin/surat",     warna: "#28A745" },
  { label: "Konten Desa",     icon: "🏡", route: "/admin/konten",    warna: "#FFC107" },
  { label: "Audit Log",       icon: "🔎", route: "/admin/audit",     warna: "#6F42C1" },
];

function getMenu(role: UserData["role"]) {
  switch (role) {
    case "staff":       return MENU_STAFF;
    case "kepala_desa": return MENU_KEPALA_DESA;
    case "admin":       return MENU_ADMIN;
    default:            return MENU_WARGA;
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UserData["status"] }) {
  const config = {
    aktif:               { bg: "#D4EDDA", text: "#155724", label: "● Aktif" },
    nonaktif:            { bg: "#F8D7DA", text: "#721C24", label: "● Nonaktif" },
    menunggu_verifikasi: { bg: "#FFF3CD", text: "#856404", label: "⏳ Menunggu Verifikasi" },
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

// ─── Komponen kartu menu ──────────────────────────────────────────────────────

function MenuCard({
  label, icon, warna, onPress,
}: { label: string; icon: string; warna: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: warna }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen utama ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser]         = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = async () => {
    const u = await getUser();
    if (!u) { router.replace("/"); return; }
    setUser(u);
  };

  useEffect(() => { loadUser(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const menu = getMenu(user.role);

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header sapaan */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user.name.split(" ")[0]}! 👋</Text>
          <Text style={styles.roleText}>{ROLE_LABEL[user.role]}</Text>
        </View>
        <StatusBadge status={user.status} />
      </View>

      {/* Banner peringatan jika akun belum aktif */}
      {user.status === "menunggu_verifikasi" && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Akun Anda sedang menunggu verifikasi Admin. Beberapa fitur mungkin belum tersedia.
          </Text>
        </View>
      )}

      {/* Deskripsi singkat sistem */}
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>🏛️ SADESA</Text>
        <Text style={styles.infoBoxText}>
          Sistem Administrasi Digital Desa Cirangkong. Ajukan surat, laporkan pengaduan, dan pantau
          layanan — semuanya dari genggaman tangan.
        </Text>
      </View>

      {/* Menu layanan */}
      <Text style={styles.sectionTitle}>Layanan</Text>
      <View style={styles.menuGrid}>
        {menu.map((item) => (
          <MenuCard
            key={item.label}
            label={item.label}
            icon={item.icon}
            warna={item.warna}
            onPress={() => router.push(item.route as any)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F2F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  roleText:  { fontSize: 13, color: "#cce4ff", marginTop: 2 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },

  warningBanner: {
    backgroundColor: "#FFF3CD",
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  warningText: { color: "#856404", fontSize: 13, lineHeight: 19 },

  infoBox: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBoxTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 6, color: "#333" },
  infoBoxText:  { color: "#555", fontSize: 13, lineHeight: 19 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    width: "46%",
    margin: "2%",
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon:  { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: "600", color: "#333", textAlign: "center" },
});
