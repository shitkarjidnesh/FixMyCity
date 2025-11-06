import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function ClientHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Load user data from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🧩 Logout confirmation
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userData");
          await AsyncStorage.removeItem("userToken");
          router.replace("/login");
        },
      },
    ]);
  };

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
          <Text style={styles.nameText}>{user?.name || "User"}</Text> 👋
        </Text>

        <Text style={styles.subtitle}>Quick access to your civic tools:</Text>

        <View style={styles.grid}>
          {/* Report Problem */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#007AFF" }]}
            onPress={() => router.push("/home/reportProblem")}>
            <Text style={styles.cardEmoji}>📝</Text>
            <Text style={styles.cardText}>Report Problem</Text>
          </TouchableOpacity>

          {/* View Complaints */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#1E90FF" }]}
            onPress={() => router.push("/home/displaycomplaints")}>
            <Text style={styles.cardEmoji}>📋</Text>
            <Text style={styles.cardText}>View Complaints</Text>
          </TouchableOpacity>

          {/* About App */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#28A745" }]}
            onPress={() => router.push("/home/about")}>
            <Text style={styles.cardEmoji}>ℹ️</Text>
            <Text style={styles.cardText}>About</Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#FF8C00" }]}
            onPress={() => router.push("/home/profile")}>
            <Text style={styles.cardEmoji}>👤</Text>
            <Text style={styles.cardText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn]} onPress={handleLogout}>
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
