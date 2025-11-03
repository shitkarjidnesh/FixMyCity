// WorkerComplaintList.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import AuthGuard from "@/components/AuthGuard";

const BASE_URL = "http://192.168.68.44:5000";

type Complaint = {
  _id: string;
  description: string;
  type: { name: string };
  address: {
    street?: string;
    area?: string;
    city?: string;
  };
  status: string;
  createdAt: string;
};

export default function WorkerComplaintList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("workerData");
      if (!stored) return;
      const { token } = JSON.parse(stored);

      const res = await axios.get(`${BASE_URL}/api/worker/fetchcomplaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComplaints(res.data.data || []);
    } catch (err) {
      console.warn("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/WorkerComplaintDetails",
          params: { id: item._id },
        })
      }>
      <Text style={styles.title}>{item.type?.name || "Complaint"}</Text>
      <Text style={styles.desc} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.addr}>
        📍 {item.address?.area}, {item.address?.city}
      </Text>
      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
        {item.status.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "#ffb300";
      case "in_progress":
        return "#1e90ff";
      case "resolved":
        return "#28a745";
      default:
        return "#888";
    }
  };

  return (
    <AuthGuard>
      <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
        <TopNav />
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : complaints.length === 0 ? (
          <View style={styles.center}>
            <Text>No complaints assigned yet.</Text>
          </View>
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          />
        )}
        <BottomNav />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  desc: { fontSize: 14, color: "#555" },
  addr: { marginTop: 4, fontSize: 13, color: "#777" },
  status: { marginTop: 6, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
