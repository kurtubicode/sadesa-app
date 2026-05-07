import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "sadesa_user_token";
const USER_KEY = "sadesa_user_data";

export interface UserData {
  id: number;
  nik: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: "warga" | "staff" | "admin" | "kepala_desa";
  status: "aktif" | "nonaktif" | "menunggu_verifikasi";
  wilayah_id: number | null;
}

// ─── Platform-safe storage ───────────────────────────────────────────────────

const store = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Simpan token + data user setelah login berhasil */
export async function saveSession(token: string, user: UserData): Promise<void> {
  await store.set(TOKEN_KEY, token);
  await store.set(USER_KEY, JSON.stringify(user));
}

/** Baca token tersimpan */
export async function getToken(): Promise<string | null> {
  return store.get(TOKEN_KEY);
}

/** Baca data user tersimpan */
export async function getUser(): Promise<UserData | null> {
  const raw = await store.get(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as UserData; }
  catch { return null; }
}

/** Hapus seluruh sesi (logout) */
export async function clearSession(): Promise<void> {
  await store.remove(TOKEN_KEY);
  await store.remove(USER_KEY);
}

// ─── Helper label ─────────────────────────────────────────────────────────────

export const ROLE_LABEL: Record<UserData["role"], string> = {
  warga:       "Warga",
  staff:       "Staff Desa",
  admin:       "Admin",
  kepala_desa: "Kepala Desa",
};

export const STATUS_LABEL: Record<UserData["status"], string> = {
  aktif:                "Aktif",
  nonaktif:             "Nonaktif",
  menunggu_verifikasi:  "Menunggu Verifikasi",
};
