import { useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Timeline config ──────────────────────────────────────────────────────────

const TL_PENGAJUAN = [
  { label: "Terkirim",    done: true  },
  { label: "Verifikasi",  done: false },
  { label: "Diproses",    done: false },
  { label: "Selesai",     done: false },
];

const TL_PENGADUAN = [
  { label: "Terkirim",    done: true  },
  { label: "Ditangani",   done: false },
  { label: "Selesai",     done: false },
];

// ─── Components ───────────────────────────────────────────────────────────────

function HorizontalTimeline({ steps }: { steps: typeof TL_PENGAJUAN }) {
  return (
    <View style={tl.wrap}>
      {steps.map((step, idx) => {
        const isFirst = idx === 0;
        const isLast  = idx === steps.length - 1;
        const next    = steps[idx + 1];
        return (
          <View key={idx} style={tl.item}>
            {/* Dot + connecting line */}
            <View style={tl.dotRow}>
              {!isFirst && (
                <View style={[tl.line, step.done && tl.lineDone]} />
              )}
              <View style={[tl.dot, step.done && tl.dotDone, idx === 1 && !step.done && tl.dotActive]}>
                {step.done
                  ? <Ionicons name="checkmark" size={11} color={COLORS.white} />
                  : <View style={[tl.dotInner, idx === 1 && tl.dotInnerActive]} />
                }
              </View>
              {!isLast && (
                <View style={[tl.line, (next?.done) && tl.lineDone]} />
              )}
            </View>
            <Text style={[tl.label, step.done && tl.labelDone, idx === 1 && !step.done && tl.labelActive]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const tl = StyleSheet.create({
  wrap:    { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  item:    { alignItems: "center", flex: 1 },
  dotRow:  { flexDirection: "row", alignItems: "center", width: "100%" },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
    zIndex: 1,
  },
  dotDone:   { backgroundColor: COLORS.success, borderColor: COLORS.success },
  dotActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  dotInner:  { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotInnerActive: { backgroundColor: COLORS.primary },
  line:      { flex: 1, height: 2, backgroundColor: COLORS.border },
  lineDone:  { backgroundColor: COLORS.success },
  label:     { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: "center", fontWeight: "500" },
  labelDone: { color: COLORS.success, fontWeight: "700" },
  labelActive:{ color: COLORS.primary, fontWeight: "700" },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SuksesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const footerPb = Math.max(insets.bottom, SPACING.md);

  const { type, id, nomor, jenis } = useLocalSearchParams<{
    type: "pengajuan" | "pengaduan";
    id: string;
    nomor: string;
    jenis: string;
  }>();

  const isPengajuan = type !== "pengaduan";

  // ── Animation ──
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    // Icon pop
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
    // Content fade + slide
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(slideY,  { toValue: 0, duration: 400, delay: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  }, []);

  const timeline = isPengajuan ? TL_PENGAJUAN : TL_PENGADUAN;

  const goHome   = () => router.replace("/(tabs)/home" as any);
  const goDetail = () => {
    if (isPengajuan) router.replace(`/pengajuan/${id}` as any);
    else             router.replace(`/pengaduan/${id}` as any);
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingTop: insets.top + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Icon animasi ── */}
        <Animated.View style={[s.iconWrap, { transform: [{ scale }] }]}>
          <View style={s.iconOuter}>
            <View style={s.iconInner}>
              <Ionicons name="checkmark" size={44} color={COLORS.white} />
            </View>
          </View>
          {/* Ripple rings */}
          <Animated.View style={[s.ring, s.ring1, { transform: [{ scale }], opacity }]} />
          <Animated.View style={[s.ring, s.ring2, { transform: [{ scale }], opacity }]} />
        </Animated.View>

        {/* ── Judul & subtitle ── */}
        <Animated.View style={[s.textWrap, { opacity, transform: [{ translateY: slideY }] }]}>
          <Text style={s.successTitle}>
            {isPengajuan ? "Pengajuan Berhasil!" : "Laporan Terkirim!"}
          </Text>
          <Text style={s.successSub}>
            {isPengajuan
              ? "Pengajuan surat Anda telah diterima dan sedang menunggu diverifikasi oleh petugas."
              : "Laporan Anda telah diterima. Petugas akan segera menindaklanjuti."}
          </Text>
        </Animated.View>

        {/* ── Info card ── */}
        <Animated.View style={[s.infoCard, { opacity, transform: [{ translateY: slideY }] }]}>

          {/* Nomor */}
          <View style={s.infoRow}>
            <View style={[s.infoIconBox, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="barcode-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={s.infoBody}>
              <Text style={s.infoKey}>
                {isPengajuan ? "NOMOR PENGAJUAN" : "NOMOR LAPORAN"}
              </Text>
              <Text style={s.infoVal}>{nomor || `#${String(id).padStart(4, "0")}`}</Text>
            </View>
          </View>

          <View style={s.infoDivider} />

          {/* Jenis / Judul */}
          <View style={s.infoRow}>
            <View style={[s.infoIconBox, { backgroundColor: isPengajuan ? COLORS.primaryLight : "#EDE9FE" }]}>
              <Ionicons
                name={isPengajuan ? "document-text-outline" : "megaphone-outline"}
                size={18}
                color={isPengajuan ? COLORS.primary : "#7C3AED"}
              />
            </View>
            <View style={s.infoBody}>
              <Text style={s.infoKey}>
                {isPengajuan ? "JENIS SURAT" : "JUDUL LAPORAN"}
              </Text>
              <Text style={s.infoVal} numberOfLines={2}>{jenis || "—"}</Text>
            </View>
          </View>

          <View style={s.infoDivider} />

          {/* Status awal */}
          <View style={s.infoRow}>
            <View style={[s.infoIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time-outline" size={18} color="#92400E" />
            </View>
            <View style={s.infoBody}>
              <Text style={s.infoKey}>STATUS SAAT INI</Text>
              <View style={s.statusPill}>
                <View style={s.statusDot} />
                <Text style={s.statusPillText}>Menunggu Diproses</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Tracking ── */}
        <Animated.View style={[s.trackCard, { opacity, transform: [{ translateY: slideY }] }]}>
          <Text style={s.trackTitle}>Alur Proses</Text>
          <HorizontalTimeline steps={timeline} />
        </Animated.View>

        {/* ── Estimasi ── */}
        <Animated.View style={[s.estimasiBox, { opacity, transform: [{ translateY: slideY }] }]}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
          <Text style={s.estimasiText}>
            {isPengajuan
              ? "Estimasi selesai: 1–3 hari kerja sejak pengajuan diterima."
              : "Estimasi penanganan: 1–3 hari kerja sejak laporan diterima."}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* ── Footer buttons ── */}
      <View style={[s.footer, { paddingBottom: footerPb }]}>
        <TouchableOpacity style={s.btnOutline} onPress={goHome} activeOpacity={0.8}>
          <Ionicons name="home-outline" size={18} color={COLORS.text} />
          <Text style={s.btnOutlineText}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnFilled} onPress={goDetail} activeOpacity={0.85}>
          <Ionicons name="receipt-outline" size={18} color={COLORS.white} />
          <Text style={s.btnFilledText}>
            {isPengajuan ? "Cek Pengajuan" : "Cek Laporan"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ICON_SIZE = 96;

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  scroll:  { flex: 1 },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: "center",
  },

  // Icon
  iconWrap: {
    width: ICON_SIZE + 48, height: ICON_SIZE + 48,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.xl,
  },
  iconOuter: {
    width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2,
    backgroundColor: COLORS.success + "22",
    justifyContent: "center", alignItems: "center",
  },
  iconInner: {
    width: ICON_SIZE - 16, height: ICON_SIZE - 16, borderRadius: (ICON_SIZE - 16) / 2,
    backgroundColor: COLORS.success,
    justifyContent: "center", alignItems: "center",
    ...SHADOW.md,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.5,
  },
  ring1: {
    width: ICON_SIZE + 20, height: ICON_SIZE + 20,
    borderColor: COLORS.success + "40",
  },
  ring2: {
    width: ICON_SIZE + 40, height: ICON_SIZE + 40,
    borderColor: COLORS.success + "20",
  },

  // Text
  textWrap:     { alignItems: "center", marginBottom: SPACING.xl, width: "100%" },
  successTitle: { fontSize: FONT.xxxl, fontWeight: "800", color: COLORS.text, textAlign: "center", marginBottom: SPACING.sm },
  successSub:   { fontSize: FONT.md, color: COLORS.textSecondary, textAlign: "center", lineHeight: 22 },

  // Info card
  infoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    width: "100%", padding: SPACING.lg, ...SHADOW.sm,
    marginBottom: SPACING.md,
  },
  infoRow:    { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.sm },
  infoIconBox:{ width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  infoBody:   { flex: 1 },
  infoKey:    { fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 3 },
  infoVal:    { fontSize: FONT.md, fontWeight: "700", color: COLORS.text },
  infoDivider:{ height: 1, backgroundColor: COLORS.divider, marginVertical: 2, marginLeft: 40 + SPACING.md },

  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7", borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    marginTop: 2,
  },
  statusDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: "#92400E" },
  statusPillText: { fontSize: FONT.sm, fontWeight: "700", color: "#92400E" },

  // Track card
  trackCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    width: "100%", padding: SPACING.lg, ...SHADOW.sm,
    marginBottom: SPACING.md,
  },
  trackTitle: {
    fontSize: FONT.sm, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.5, textTransform: "uppercase",
    marginBottom: SPACING.lg,
    textAlign: "center",
  },

  // Estimasi box
  estimasiBox: {
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg,
    padding: SPACING.md, width: "100%",
  },
  estimasiText: { flex: 1, fontSize: FONT.sm, color: COLORS.primary, lineHeight: 18 },

  // Footer
  footer: {
    flexDirection: "row", gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md, paddingHorizontal: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    ...SHADOW.sm,
  },
  btnOutline: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.full, height: 50,
  },
  btnOutlineText: { fontSize: FONT.md, fontWeight: "700", color: COLORS.text },
  btnFilled: {
    flex: 1.6, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, height: 50, ...SHADOW.md,
  },
  btnFilledText: { fontSize: FONT.md, fontWeight: "700", color: COLORS.white },
});
