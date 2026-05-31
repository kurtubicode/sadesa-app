import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function ServiceItem({
  iconNode, iconBg, title, subtitle, onPress,
}: {
  iconNode: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.serviceItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.serviceIconBox, { backgroundColor: iconBg }]}>
        {iconNode}
      </View>
      <View style={styles.serviceBody}>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LayananScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Title ── */}
      <View style={[styles.titleSection, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.pageTitle}>Layanan</Text>
        <Text style={styles.pageSub}>
          Pilih jenis layanan administrasi yang Anda butuhkan hari ini.
        </Text>
      </View>

      {/* ── Daftar Layanan ── */}
      <View style={styles.serviceCard}>
        <ServiceItem
          iconNode={<Ionicons name="document-text-outline" size={24} color={COLORS.primary} />}
          iconBg={COLORS.primaryLight}
          title="Administrasi Surat"
          subtitle="Pengajuan surat keterangan desa"
          onPress={() => router.push("/pengajuan/buat")}
        />
        <View style={styles.divider} />
        <ServiceItem
          iconNode={<Ionicons name="megaphone-outline" size={24} color="#7C3AED" />}
          iconBg="#EDE9FE"
          title="Pengaduan Masyarakat"
          subtitle="Laporkan keluhan dan aspirasi warga"
          onPress={() => router.push("/pengaduan/buat")}
        />
        <View style={styles.divider} />
        <ServiceItem
          iconNode={<Ionicons name="book-outline" size={24} color="#374151" />}
          iconBg="#F3F4F6"
          title="Buku Tamu Digital"
          subtitle="Pencatatan kunjungan instansi resmi"
          onPress={() => Alert.alert("Segera Hadir", "Fitur Buku Tamu Digital akan segera tersedia.")}
        />
      </View>

      {/* ── Info card ── */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardIconWrap}>
          <Ionicons name="flash" size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.infoCardTitle}>Proses Lebih Cepat</Text>
        <Text style={styles.infoCardText}>
          Semua pengajuan diproses dalam waktu 1×24 jam kerja melalui sistem terpadu desa.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  // Title section
  titleSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  pageTitle: { fontSize: FONT.display, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.xs },
  pageSub:   { fontSize: FONT.md, color: COLORS.textSecondary, lineHeight: 20 },

  // Service card
  serviceCard: {
    backgroundColor: COLORS.white, marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl, borderRadius: RADIUS.xl, ...SHADOW.sm,
    overflow: "hidden",
  },
  serviceItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  serviceIconBox: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  serviceBody:  { flex: 1 },
  serviceTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  serviceSub:   { fontSize: FONT.sm, color: COLORS.textMuted },

  divider: { height: 1, backgroundColor: COLORS.divider, marginLeft: SPACING.lg + 48 + SPACING.md },

  // Info card
  infoCard: {
    backgroundColor: COLORS.white, marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: "center",
    ...SHADOW.sm,
  },
  infoCardIconWrap: {
    width: 56, height: 56, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.md,
  },
  infoCardTitle: {
    fontSize: FONT.xl, fontWeight: "800", color: COLORS.text,
    marginBottom: SPACING.sm, textAlign: "center",
  },
  infoCardText: {
    fontSize: FONT.md, color: COLORS.textSecondary, lineHeight: 20,
    textAlign: "center",
  },
});
