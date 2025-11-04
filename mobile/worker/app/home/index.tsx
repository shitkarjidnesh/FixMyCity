import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function WorkerHome() {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Load worker data from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("workerData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setWorker(parsed);
        }
      } catch (error) {
        console.error("Error fetching worker data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* 🔹 Top Navigation */}
      <TopNav />

      {/* 🔹 Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome back,{" "}
          <Text style={styles.nameText}>{worker?.name || "Worker"}</Text> 👋
        </Text>

        <Text style={styles.subtitle}>
          Here are your quick actions for today:
        </Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#007AFF" }]}
            onPress={() => router.push("/home/workerComplaintList")}>
            <Text style={styles.cardEmoji}>📋</Text>
            <Text style={styles.cardText}>View Complaints</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#1E90FF" }]}
            onPress={() => router.push("/home/workerComplaintsMap")}>
            <Text style={styles.cardEmoji}>🗺️</Text>
            <Text style={styles.cardText}>View on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#28A745" }]}
            onPress={() => router.push("/home/profile")}>
            <Text style={styles.cardEmoji}>👤</Text>
            <Text style={styles.cardText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#FF8C00" }]}
            onPress={() => router.push("/home/setting")}>
            <Text style={styles.cardEmoji}>⚙️</Text>
            <Text style={styles.cardText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn]}
          onPress={async () => {
            await AsyncStorage.removeItem("workerData");
            await AsyncStorage.removeItem("workerToken");
            router.replace("/login");
          }}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 🔹 Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  nameText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    height: 120,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
