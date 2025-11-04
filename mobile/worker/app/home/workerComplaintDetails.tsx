// WorkerComplaintDetails.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

const BASE_URL = "http://192.168.68.44:5000";

export default function WorkerComplaintDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem("selectedComplaintId");
        if (!storedId) return;

        const stored = await AsyncStorage.getItem("workerData");
        const { token } = stored ? JSON.parse(stored) : {};
        const res = await axios.get(
          `${BASE_URL}/api/worker/complaint/${storedId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setComplaint(res.data.data);
      } catch (err) {
        console.warn("Error loading complaint:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <AuthGuard>
      <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
        <TopNav />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {complaint.imageUrls && complaint.imageUrls.length > 0 && (
            <Image
              source={{ uri: complaint.imageUrls[0] }}
              style={styles.image}
            />
          )}
          <Text style={styles.title}>{complaint?.type?.name}</Text>
          <Text style={styles.subtitle}>{complaint?.subtype}</Text>
          <Text style={styles.desc}>{complaint?.description}</Text>
          <Text style={styles.addr}>
            📍 {complaint?.address?.street}, {complaint?.address?.area},{" "}
            {complaint?.address?.city}
          </Text>
          <Text
            style={[
              styles.status,
              { color: getStatusColor(complaint.status) },
            ]}>
            {complaint.status.toUpperCase()}
          </Text>

          {complaint?.location?.coordinates?.length === 2 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: complaint.location.coordinates[1],
                longitude: complaint.location.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}>
              <Marker
                coordinate={{
                  latitude: complaint.location.coordinates[1],
                  longitude: complaint.location.coordinates[0],
                }}
                pinColor={getStatusColor(complaint.status)}
              />
            </MapView>
          )}

          <TouchableOpacity
            style={styles.resolveBtn}
            onPress={() =>
              router.push({
                pathname: "/home/resolveComplaint",
                params: { id: complaint._id },
              })
            }>
            <Text style={styles.btnText}>Resolve Complaint</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNav />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 10 },
  desc: { fontSize: 15, color: "#555", marginBottom: 10 },
  addr: { fontSize: 14, color: "#777", marginBottom: 16 },
  status: { fontSize: 16, fontWeight: "bold", marginBottom: 16 },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  resolveBtn: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 14,
    marginTop: 20,
  },
  btnText: { color: "white", fontWeight: "bold", textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
