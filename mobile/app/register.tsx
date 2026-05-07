import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";

interface Wilayah {
  id: number;
  nama: string;
  tipe: string;
}

export default function RegisterScreen() {
  const router = useRouter();

  const [nik, setNik]               = useState("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [wilayahId, setWilayahId]   = useState<number | null>(null);
  const [wilayahList, setWilayahList] = useState<Wilayah[]>([]);
  const [loading, setLoading]       = useState(false);
  const [loadingWilayah, setLoadingWilayah] = useState(true);

  // Ambil daftar wilayah untuk picker
  useEffect(() => {
    api.get("/api/wilayah")
      .then((res) => {
        // Tampilkan hanya RT/RW agar warga bisa memilih spesifik
        const rtRw = res.data.data.filter(
          (w: Wilayah) => w.tipe === "rt" || w.tipe === "rw"
        );
        setWilayahList(rtRw);
      })
      .catch(() => setWilayahList([]))
      .finally(() => setLoadingWilayah(false));
  }, []);

  const handleRegister = async () => {
    // Validasi sisi client
    if (!nik || !name || !email || !password || !confirm) {
      Alert.alert("Peringatan", "NIK, nama, email, dan password wajib diisi.");
      return;
    }
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      Alert.alert("Peringatan", "NIK harus terdiri dari 16 digit angka.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Peringatan", "Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Peringatan", "Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/register", {
        nik,
        name,
        email,
        password,
        password_confirmation: confirm,
        phone: phone || undefined,
        wilayah_id: wilayahId || undefined,
      });

      Alert.alert(
        "Registrasi Berhasil! 🎉",
        "Akun Anda sedang menunggu verifikasi dari Admin. Anda akan dihubungi setelah akun aktif.",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        "Registrasi gagal. Periksa kembali data Anda.";
      Alert.alert("Registrasi Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Daftar Akun</Text>
      <Text style={styles.subtitle}>SADESA — Sahabat Digital Desa</Text>

      {/* NIK */}
      <Text style={styles.label}>NIK *</Text>
      <TextInput
        style={styles.input}
        placeholder="16 digit NIK"
        value={nik}
        onChangeText={setNik}
        keyboardType="numeric"
        maxLength={16}
      />

      {/* Nama */}
      <Text style={styles.label}>Nama Lengkap *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nama sesuai KTP"
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="email@contoh.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* No. HP */}
      <Text style={styles.label}>No. HP (opsional)</Text>
      <TextInput
        style={styles.input}
        placeholder="08xxxxxxxxxx"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={15}
      />

      {/* Wilayah */}
      <Text style={styles.label}>Wilayah (RT/RW)</Text>
      {loadingWilayah ? (
        <ActivityIndicator style={{ marginBottom: 15 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.wilayahScroll}
        >
          {wilayahList.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.wilayahChip,
                wilayahId === w.id && styles.wilayahChipActive,
              ]}
              onPress={() => setWilayahId(wilayahId === w.id ? null : w.id)}
            >
              <Text
                style={[
                  styles.wilayahChipText,
                  wilayahId === w.id && styles.wilayahChipTextActive,
                ]}
              >
                {w.tipe.toUpperCase()} {w.nama.replace(/\D/g, "")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Password */}
      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Minimal 8 karakter"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Konfirmasi Password */}
      <Text style={styles.label}>Konfirmasi Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ulangi password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {/* Tombol Daftar */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>DAFTAR</Text>
        )}
      </TouchableOpacity>

      {/* Link ke Login */}
      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.loginLink}>
          Sudah punya akun?{" "}
          <Text style={styles.loginLinkBold}>Masuk di sini</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 13,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 15,
  },
  wilayahScroll: {
    marginBottom: 16,
  },
  wilayahChip: {
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  wilayahChipActive: {
    backgroundColor: "#007BFF",
  },
  wilayahChipText: {
    color: "#007BFF",
    fontSize: 13,
    fontWeight: "600",
  },
  wilayahChipTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
