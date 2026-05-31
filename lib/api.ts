import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "sadesa_user_token";
const USER_KEY  = "sadesa_user_data";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request: sisipkan token Sanctum ──────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  let token: string | null = null;
  try {
    token = Platform.OS === "web"
      ? localStorage.getItem(TOKEN_KEY)
      : await SecureStore.getItemAsync(TOKEN_KEY);
  } catch { /* ignore */ }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: auto-logout saat token kadaluarsa (401) ────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      // Hapus sesi lokal
      try {
        if (Platform.OS === "web") {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(USER_KEY);
        }
      } catch { /* ignore */ }

      // Redirect ke halaman login — import dinamis agar tidak crash sebelum
      // navigation tree terbentuk
      try {
        const { router } = await import("expo-router");
        router.replace("/");
      } catch { /* ignore jika navigation belum ready */ }
    }
    return Promise.reject(error);
  }
);

export default api;
