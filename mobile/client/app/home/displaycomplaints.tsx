import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

const BASE_URL = "http://192.168.68.44:5000";

interface Complaint {
  id: string;
  type: string;
  subType: string;
  description: string;
  address: string;
  status: "Pending" | "In Progress" | "Resolved";
  dateTime: string;
  imageUrls?: string[];
  latitude?: number | null;
  longitude?: number | null;
}

type User = {
  token: string;
  name: string;
  email: string;
  userId: string;
};

const DisplayComplaints: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedData: User = JSON.parse(storedUserData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
        Alert.alert("Error", "Could not load your user details.");
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userData) return;

    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/complaints`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        });

        const data: Complaint[] = response.data.data.map((c: any) => ({
          id: c._id,
          type: c.type?.name || "Unknown",
          subType: c.subtypeName || "N/A",
          description: c.description,
          address: c.address,
          status: c.status,
          dateTime: new Date(c.createdAt).toLocaleString(),
          imageUrls: c.imageUrls || [],
          latitude: c.latitude || null,
          longitude: c.longitude || null,
        }));

        setComplaints(data);
        setFilteredComplaints(data);
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
        Alert.alert("Error", "Failed to fetch complaints from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userData]);

  const handleFilterChange = (status: string) => {
    setFilter(status);
    if (status === "All") setFilteredComplaints(complaints);
    else setFilteredComplaints(complaints.filter((c) => c.status === status));
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <>
      <TopNav />

      <View style={styles.container}>
        <Text style={styles.heading}>Your Submitted Complaints</Text>

        <View style={styles.filterContainer}>
          {["All", "Pending", "In Progress", "Resolved"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => handleFilterChange(status)}
              style={[
                styles.filterTab,
                filter === status && styles.activeFilterTab,
              ]}>
              <Text
                style={
                  filter === status
                    ? styles.activeFilterText
                    : styles.filterText
                }>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ marginTop: 10 }}>
          {filteredComplaints.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No complaints found.
            </Text>
          ) : (
            filteredComplaints.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.card}
                onPress={() => setSelectedComplaint(c)}>
                <Text style={styles.type}>{c.type}</Text>

                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Sub-Type:</Text> {c.subType}
                </Text>

                <Text style={styles.description}>{c.description}</Text>

                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Address:</Text> {c.address}
                </Text>

                {c.latitude && c.longitude && (
                  <Text style={styles.detailLine}>
                    <Text style={styles.label}>Coordinates:</Text> {c.latitude},{" "}
                    {c.longitude}
                  </Text>
                )}

                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Complaint ID:</Text> {c.id}
                </Text>

                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Status:</Text>{" "}
                  <Text
                    style={{
                      color:
                        c.status === "Resolved"
                          ? "green"
                          : c.status === "Pending"
                            ? "orange"
                            : "blue",
                      fontWeight: "bold",
                    }}>
                    {c.status}
                  </Text>
                </Text>

                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Date & Time:</Text> {c.dateTime}
                </Text>

                {c.imageUrls && c.imageUrls.length > 0 && (
                  <ScrollView horizontal style={{ marginTop: 8 }}>
                    {c.imageUrls.map((url, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: url }}
                        style={{
                          width: 180,
                          height: 180,
                          borderRadius: 8,
                          marginRight: 8,
                        }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <Modal
          visible={selectedComplaint !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedComplaint(null)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              {selectedComplaint && (
                <>
                  <Text style={styles.modalHeading}>Complaint Details</Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Type:</Text>{" "}
                    {selectedComplaint.type}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Sub-Type:</Text>{" "}
                    {selectedComplaint.subType}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Description:</Text>{" "}
                    {selectedComplaint.description}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Address:</Text>{" "}
                    {selectedComplaint.address}
                  </Text>
                  {selectedComplaint.latitude &&
                    selectedComplaint.longitude && (
                      <Text style={styles.modalText}>
                        <Text style={styles.label}>Coordinates:</Text>{" "}
                        {selectedComplaint.latitude},{" "}
                        {selectedComplaint.longitude}
                      </Text>
                    )}
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Complaint ID:</Text>{" "}
                    {selectedComplaint.id}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Status:</Text>{" "}
                    <Text
                      style={{
                        color:
                          selectedComplaint.status === "Resolved"
                            ? "green"
                            : selectedComplaint.status === "Pending"
                              ? "orange"
                              : "blue",
                        fontWeight: "bold",
                      }}>
                      {selectedComplaint.status}
                    </Text>
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Date:</Text>{" "}
                    {selectedComplaint.dateTime}
                  </Text>
                  {selectedComplaint.imageUrls &&
                    selectedComplaint.imageUrls.length > 0 && (
                      <ScrollView horizontal style={{ marginTop: 10 }}>
                        {selectedComplaint.imageUrls.map((url, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: url }}
                            style={{
                              width: 200,
                              height: 200,
                              borderRadius: 8,
                              marginRight: 8,
                            }}
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                    )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedComplaint(null)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>

      <BottomNav />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  filterContainer: { flexDirection: "row", marginBottom: 15, flexWrap: "wrap" },
  filterTab: {
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
  },
  activeFilterTab: { backgroundColor: "#007BFF" },
  filterText: { color: "#555", fontSize: 12 },
  activeFilterText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  card: {
    marginBottom: 12,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  type: { fontWeight: "bold", fontSize: 16, marginBottom: 4, color: "#333" },
  description: { fontSize: 14, marginBottom: 4, color: "#555" },
  detailLine: { fontSize: 13, marginBottom: 4, color: "#666" },
  label: { fontWeight: "bold", color: "#333" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: { fontSize: 14, color: "#333", marginBottom: 8 },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default DisplayComplaints;
