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
  TextInput,
  Image,
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
  subtype: string;
  address: {
    street?: string;
    area?: string;
    city?: string;
  };
  status: string;
  createdAt: string;
  imageUrls: string[];
};

export default function WorkerComplaintList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Pagination and Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: "Assigned", search: "" });

  const fetchComplaints = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("workerData");
      if (!stored) return;
      const { token } = JSON.parse(stored);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...newFilters,
      }).toString();

      const res = await axios.get(
        `${BASE_URL}/api/worker/fetchcomplaints?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (page === 1) {
        setComplaints(res.data.data || []);
      } else {
        setComplaints((prev) => [...prev, ...(res.data.data || [])]);
      }
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.warn("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1, filters);
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchComplaints(1, filters);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchComplaints(nextPage, filters);
    }
  };

  const renderItem = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        await AsyncStorage.setItem("selectedComplaintId", item._id);
        router.push("/home/workerComplaintDetails");
      }}>
      <Image
        source={{
          uri: item.imageUrls?.[0] || "https://via.placeholder.com/150",
        }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.type?.name || "Complaint"}</Text>
        <Text style={styles.subtitle}>{item.subtype}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.addr}>
          📍 {item.address?.street}, {item.address?.area}, {item.address?.city}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
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
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by description or address..."
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
          />
          <View style={styles.statusFilterContainer}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                filters.status === "" && styles.activeStatus,
              ]}
              onPress={() => setFilters({ ...filters, status: "" })}>
              <Text>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                filters.status === "Assigned" && styles.activeStatus,
              ]}
              onPress={() => setFilters({ ...filters, status: "Assigned" })}>
              <Text>Assigned</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                filters.status === "In Progress" && styles.activeStatus,
              ]}
              onPress={() => setFilters({ ...filters, status: "In Progress" })}>
              <Text>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                filters.status === "Resolved" && styles.activeStatus,
              ]}
              onPress={() => setFilters({ ...filters, status: "Resolved" })}>
              <Text>Resolved</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loading && currentPage === 1 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && currentPage > 1 ? <ActivityIndicator /> : null
            }
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text>No complaints assigned yet.</Text>
              </View>
            }
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
    flexDirection: "row",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 6 },
  desc: { fontSize: 14, color: "#555" },
  addr: { marginTop: 4, fontSize: 13, color: "#777" },
  status: { marginTop: 6, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  statusFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  statusButton: {
    flex: 1, // ✅ equal width
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  activeStatus: {
    backgroundColor: "#1e90ff",
    borderColor: "#1e90ff",
  },
});
