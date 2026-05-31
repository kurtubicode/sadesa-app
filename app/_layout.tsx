import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { COLORS, FONT } from "@/constants/theme";

export const unstable_settings = { anchor: "(tabs)" };

// Custom theme — membuat header background putih dengan teks primary
const SADESATheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:    COLORS.primary,
    background: COLORS.background,
    card:       COLORS.white,
    text:       COLORS.text,
    border:     COLORS.divider,
    notification: COLORS.primary,
  },
};

const HEADER_OPTIONS = {
  headerStyle:         { backgroundColor: COLORS.white },
  headerTintColor:     COLORS.primary,
  headerTitleStyle:    { fontSize: FONT.xl, fontWeight: "700" as const, color: COLORS.text },
  headerShadowVisible: false,
  headerBackTitle:     "Kembali",
} as const;

export default function RootLayout() {
  return (
    <ThemeProvider value={SADESATheme}>
      <Stack screenOptions={HEADER_OPTIONS}>
        {/* Auth */}
        <Stack.Screen name="index"      options={{ headerShown: false }} />
        <Stack.Screen name="register"   options={{ headerShown: false }} />
        <Stack.Screen name="verifikasi" options={{ headerShown: false }} />

        {/* Tab utama */}
        <Stack.Screen name="(tabs)"   options={{ headerShown: false }} />

        {/* Sukses */}
        <Stack.Screen
          name="sukses"
          options={{
            title: "",
            headerShown: false,
          }}
        />

        {/* Pengajuan surat */}
        <Stack.Screen name="pengajuan/index" options={{ title: "Status Layanan" }} />
        <Stack.Screen
          name="pengajuan/buat"
          options={{
            title: "Pengajuan Surat",
            headerStyle: { backgroundColor: COLORS.white },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="pengajuan/[id]"  options={{ title: "Detail Pengajuan" }} />

        {/* Pengaduan */}
        <Stack.Screen name="pengaduan/index" options={{ title: "Pengaduan Saya" }} />
        <Stack.Screen name="pengaduan/buat"  options={{ title: "Buat Pengaduan" }} />
        <Stack.Screen name="pengaduan/[id]"  options={{ title: "Detail Pengaduan" }} />

        {/* Informasi desa */}
        <Stack.Screen name="informasi/index"  options={{ title: "Informasi Desa" }} />
        <Stack.Screen name="informasi/[slug]" options={{ title: "Detail Berita" }} />

        {/* Notifikasi */}
        <Stack.Screen name="notifikasi" options={{ headerShown: false }} />

        {/* Profil */}
        <Stack.Screen name="profil/edit"           options={{ title: "Data Diri" }} />
        <Stack.Screen name="profil/ganti-password" options={{ title: "Ganti Kata Sandi" }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
