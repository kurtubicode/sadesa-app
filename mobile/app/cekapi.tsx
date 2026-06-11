import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import api from "@/lib/api";

const App = () => {
  const [pesan, setPesan] = useState("Loading...");

  useEffect(() => {
    api
      .get("/api/tes-koneksi")
      .then((response) => {
        setPesan(response.data.pesan);
      })
      .catch((error) => {
        setPesan("Gagal terhubung ke Laravel");
        console.error(error);
      });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>{pesan}</Text>
    </View>
  );
};

export default App;
