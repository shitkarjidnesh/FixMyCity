import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

// ──────────────── Type Definitions ────────────────
interface Address {
  houseNo?: string;
  street?: string;
  landmark?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

interface Department {
  _id?: string;
  name?: string;
}

interface Worker {
  _id: string;
  name: string;
  middleName?: string;
  surname: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  employeeId: string;
  experience?: string;
  blockOrRegion: string;
  address?: Address;
  department?: Department;
  profilePhoto?: string;
}

// ──────────────── Component ────────────────
export default function WorkerProfile() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 🔹 Load Worker Profile from API
  const loadWorkerProfile = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem("workerData");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const token: string | undefined = parsed?.token;

      if (!token) {
        console.warn("⚠️ No token found in storage.");
        return;
      }

      const res = await axios.get(
        "http://192.168.68.44:5000/api/worker/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Worker profile API response:", res.data);

      const fetchedWorker = res.data?.data;
      if (!fetchedWorker?._id) {
        console.warn("⚠️ Worker data missing from API response:", res.data);
        return;
      }
      setWorker(fetchedWorker);

      // 🔹 Log each important field clearly
      console.log("🟦 Worker Info Debug -----------------------------");
      console.log("🆔 ID:", fetchedWorker._id);
      console.log(
        "👤 Name:",
        fetchedWorker.name,
        fetchedWorker.middleName,
        fetchedWorker.surname
      );
      console.log("📧 Email:", fetchedWorker.email);
      console.log("📞 Phone:", fetchedWorker.phone);
      console.log("👩 Gender:", fetchedWorker.gender);
      console.log("🎂 DOB:", fetchedWorker.dob);
      console.log("🏢 Department:", fetchedWorker.department?.name);
      console.log("🧾 Employee ID:", fetchedWorker.employeeId);
      console.log("💼 Experience:", fetchedWorker.experience);
      console.log("🌍 Block/Region:", fetchedWorker.blockOrRegion);
      console.log("🏠 Address:", fetchedWorker.address);
      console.log("🖼️ Profile Photo URL:", fetchedWorker.profilePhoto);
      console.log("🟦 ---------------------------------------------");
    } catch (error) {
      console.error("❌ Failed to load worker profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkerProfile();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    loadWorkerProfile();
  };

  // ──────────────── Loading State ────────────────
  if (loading) {
    return (
      <AuthGuard>
        <TopNav />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10 }}>Loading profile...</Text>
        </View>
        <BottomNav />
      </AuthGuard>
    );
  }

  // ──────────────── No Worker Data ────────────────
  if (!worker) {
    return (
      <AuthGuard>
        <TopNav />
        <View style={styles.loadingContainer}>
          <Text>No profile data found.</Text>
        </View>
        <BottomNav />
      </AuthGuard>
    );
  }

  // ──────────────── Profile View ────────────────
  return (
    <AuthGuard>
      <TopNav />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                worker.profilePhoto ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.title}>My Profile</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>
            {`${worker.name} ${worker.middleName || ""} ${
              worker.surname || ""
            }`}
          </Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{worker.email}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{worker.phone}</Text>

          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{worker.gender || "N/A"}</Text>

          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>
            {worker.dob
              ? new Date(worker.dob).toLocaleDateString("en-IN")
              : "N/A"}
          </Text>

          <Text style={styles.label}>Department</Text>
          <Text style={styles.value}>{worker.department?.name || "N/A"}</Text>

          <Text style={styles.label}>Employee ID</Text>
          <Text style={styles.value}>{worker.employeeId}</Text>

          <Text style={styles.label}>Experience</Text>
          <Text style={styles.value}>{worker.experience || "N/A"}</Text>

          <Text style={styles.label}>Block / Region</Text>
          <Text style={styles.value}>{worker.blockOrRegion}</Text>

          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>
            {[
              worker.address?.houseNo,
              worker.address?.street,
              worker.address?.landmark,
              worker.address?.area,
              worker.address?.city,
              worker.address?.district,
              worker.address?.state,
              worker.address?.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>
      </ScrollView>
      <BottomNav />
    </AuthGuard>
  );
}

// ──────────────── Styles ────────────────
const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontWeight: "bold", fontSize: 14, marginTop: 10 },
  value: { fontSize: 16, marginTop: 2, color: "#333" },
});
