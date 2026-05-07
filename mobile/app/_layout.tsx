import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = { anchor: "(tabs)" };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Auth */}
        <Stack.Screen name="index"    options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "Daftar Akun" }} />

        {/* Tab utama */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Pengajuan surat */}
        <Stack.Screen name="pengajuan/index"  options={{ title: "Status Layanan" }} />
        <Stack.Screen name="pengajuan/buat"   options={{ title: "Ajukan Surat" }} />
        <Stack.Screen name="pengajuan/[id]"   options={{ title: "Detail Pengajuan" }} />

        {/* Pengaduan */}
        <Stack.Screen name="pengaduan/index"  options={{ title: "Pengaduan Saya" }} />
        <Stack.Screen name="pengaduan/buat"   options={{ title: "Buat Pengaduan" }} />

        {/* Informasi desa */}
        <Stack.Screen name="informasi/index"  options={{ title: "Informasi Desa" }} />
        <Stack.Screen name="informasi/[slug]" options={{ title: "Detail Berita" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
