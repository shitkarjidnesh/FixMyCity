import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

const BASE_URL = "http://192.168.68.44:5000";

export default function WorkerComplaintsMap() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // 🟢 Optional focused complaint ID
  const { selectedId } = useLocalSearchParams();

  // Fetch complaints
  const fetchComplaints = async (status?: string) => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("workerData");
      const { token } = stored ? JSON.parse(stored) : {};

      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await axios.get(
        `${BASE_URL}/api/worker/complaints/map${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) setComplaints(res.data.data || []);
      else console.warn(res.data.message);
    } catch (error) {
      console.error("❌ Map fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // 🎯 Focus exactly on one complaint once the map is ready
  const focusOnComplaint = useCallback(() => {
    if (!mapRef.current || !mapReady || complaints.length === 0) return;

    const focusComplaint = complaints.find((c) => c._id === selectedId);
    if (focusComplaint) {
      const lat = parseFloat(focusComplaint.latitude);
      const lng = parseFloat(focusComplaint.longitude);

      if (!lat || !lng) return;

      mapRef.current.animateCamera(
        {
          center: { latitude: lat, longitude: lng },
          zoom: 17, // close zoom
          pitch: 45,
          heading: 0,
        },
        { duration: 1000 }
      );
      console.log("📍 Focused on complaint:", focusComplaint._id, lat, lng);
    }
  }, [selectedId, complaints, mapReady]);

  useEffect(() => {
    focusOnComplaint();
  }, [focusOnComplaint]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#ffb300";
      case "In Progress":
        return "#1e90ff";
      case "Resolved":
        return "#28a745";
      default:
        return "#888";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthGuard>
      <View style={{ flex: 1 }}>
        <TopNav title="Assigned Complaints Map" />

        {/* 🔹 Filter Buttons */}
        <View style={styles.filterContainer}>
          {["All", "In Progress", "Resolved"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status ||
                (status === "All" && filterStatus === "")
                  ? styles.activeFilter
                  : null,
              ]}
              onPress={() => {
                const newStatus = status === "All" ? "" : status;
                setFilterStatus(newStatus);
                fetchComplaints(newStatus);
              }}>
              <Text
                style={[
                  styles.filterText,
                  filterStatus === status ||
                  (status === "All" && filterStatus === "")
                    ? styles.activeFilterText
                    : null,
                ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {complaints.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: "#777", fontSize: 16 }}>
              No complaints found for this filter.
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation
            showsCompass
            onMapReady={() => setMapReady(true)} // ✅ ensures map is loaded before focusing
            initialRegion={{
              latitude: 19.076,
              longitude: 72.8777,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}>
            {complaints.map((item) => {
              const lat = parseFloat(item.latitude);
              const lng = parseFloat(item.longitude);
              if (!lat || !lng) return null;

              const isFocused = item._id === selectedId;

              return (
                <Marker
                  key={item._id}
                  coordinate={{ latitude: lat, longitude: lng }}
                  pinColor={isFocused ? "#ff0000" : getStatusColor(item.status)}
                  title={item.type?.name || "Complaint"}
                  description={item.status}
                  onPress={() =>
                    router.push({
                      pathname: "/home/workerComplaintDetails",
                      params: { id: item._id },
                    })
                  }
                />
              );
            })}
          </MapView>
        )}

        <BottomNav />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  filterText: {
    color: "#555",
    fontWeight: "500",
  },
  activeFilter: {
    backgroundColor: "#1e90ff",
    borderColor: "#1e90ff",
  },
  activeFilterText: {
    color: "white",
  },
});
