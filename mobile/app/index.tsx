import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { saveSession, getToken } from "@/lib/userStorage";

export default function LoginScreen() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  const router = useRouter();

  // Cek sesi tersimpan saat app dibuka
  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        router.replace("/home");
      } else {
        setChecking(false);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Peringatan", "Email dan password tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/login", { email, password });

      await saveSession(res.data.token, res.data.user);
      router.replace("/home");
    } catch (error: any) {
      const status = error?.response?.status;
      const msg    = error?.response?.data?.message;

      if (status === 403) {
        Alert.alert("Akses Ditolak", msg ?? "Akun Anda belum dapat digunakan.");
      } else if (status === 401) {
        Alert.alert("Login Gagal", "Email atau password salah.");
      } else {
        Alert.alert("Login Gagal", "Tidak dapat terhubung ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={[styles.container, { alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Memuat SADESA…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SADESA</Text>
      <Text style={styles.subtitle}>Sahabat Digital Desa Cirangkong</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>MASUK</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerLink}>
          Belum punya akun?{" "}
          <Text style={styles.registerLinkBold}>Daftar di sini</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 36,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  registerLink: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  registerLinkBold: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
