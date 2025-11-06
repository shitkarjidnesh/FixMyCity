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
  Dimensions,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import { router } from "expo-router";
import jwtDecode from "jwt-decode";

const BASE_URL = "http://192.168.68.44:5000";
const { width } = Dimensions.get("window");

interface Complaint {
  id: string;
  type: string;
  subType: string;
  description: string;
  address: string;
  status: "Pending" | "In Progress" | "Resolved";
  dateTime: string;
  userImages?: string[]; // user uploaded
  resolutionImages?: string[]; // resolved by worker
  workerName?: string;
  workerDepartment?: string;
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
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🧩 Fetch complaints
  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          Alert.alert("Unauthorized", "Please login to continue.");
          router.replace("/login");
          return;
        }

        const parsedData = JSON.parse(userData);
        const token = parsedData.token;
        if (!token) {
          Alert.alert("Unauthorized", "Please login to continue.");
          router.replace("/login");
          return;
        }

        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          Alert.alert("Session Expired", "Please login again.");
          await AsyncStorage.removeItem("userData");
          router.replace("/login");
          return;
        }

        setUserData(parsedData);

        const response = await axios.get(`${BASE_URL}/api/complaints`, {
          headers: { Authorization: `Bearer ${parsedData.token}` },
        });

        const data: Complaint[] = response.data.data.map((c: any) => {
          let latitude = null;
          let longitude = null;
          if (
            c.location?.coordinates &&
            Array.isArray(c.location.coordinates)
          ) {
            longitude = c.location.coordinates[0];
            latitude = c.location.coordinates[1];
          }

          // Normalize user-uploaded and resolution images
          const userImages = Array.isArray(c.imageUrls)
            ? c.imageUrls.map((url: string) =>
                url.startsWith("http")
                  ? url
                  : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`
              )
            : [];

          const resolutionImages = Array.isArray(c.resolution?.photos)
            ? c.resolution.photos.map((url: string) =>
                url.startsWith("http")
                  ? url
                  : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`
              )
            : [];

          return {
            id: c._id,
            type: c.type?.name || "Unknown",
            subType: c.subtypeName || "N/A",
            description: c.description || "",
            address:
              typeof c.address === "object" && c.address !== null
                ? `${c.address.street || ""} ${c.address.landmark || ""}, ${c.address.area || ""}, ${c.address.city || ""}`.trim()
                : c.address || "",
            status: c.status || "Pending",
            dateTime: new Date(c.createdAt).toLocaleString(),
            userImages,
            resolutionImages,
            workerName:
              c.assignedWorker?.name ||
              c.resolution?.by?.name ||
              "Not Assigned",
            workerDepartment:
              c.assignedWorker?.department ||
              c.resolution?.by?.department ||
              "No Department",
            latitude,
            longitude,
          };
        });

        setComplaints(data);
        setFilteredComplaints(data);
      } catch (err) {
        console.error("AuthGuard/Complaint error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFilterChange = (status: string) => {
    setFilter(status);
    if (status === "All") setFilteredComplaints(complaints);
    else setFilteredComplaints(complaints.filter((c) => c.status === status));
  };

  // 🧩 Submit Note
  const handleNoteSubmit = async () => {
    if (!selectedComplaint) return;
    if (!note.trim()) {
      Alert.alert("Empty Note", "Please write a note before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${BASE_URL}/api/complaints/note/${selectedComplaint.id}`,
        { note },
        { headers: { Authorization: `Bearer ${userData?.token}` } }
      );
      Alert.alert("Success", "Your note has been submitted.");
      setNote("");
    } catch (error) {
      console.error("Error submitting note:", error);
      Alert.alert("Error", "Failed to submit note. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <AuthGuard>
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

                {/* Worker info */}
                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Worker:</Text> {c.workerName}
                </Text>
                <Text style={styles.detailLine}>
                  <Text style={styles.label}>Department:</Text>{" "}
                  {c.workerDepartment}
                </Text>

                {/* 🧩 User Uploaded Photos */}
                {c.userImages && c.userImages.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>Your Uploaded Photo(s):</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      {c.userImages.map((url, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: url }}
                          style={{
                            width: width * 0.7,
                            height: 180,
                            borderRadius: 10,
                            marginRight: 10,
                          }}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 🧩 Resolution Photos */}
                {c.resolutionImages && c.resolutionImages.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>After Resolution:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      {c.resolutionImages.map((url, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: url }}
                          style={{
                            width: width * 0.7,
                            height: 180,
                            borderRadius: 10,
                            marginRight: 10,
                          }}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

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
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Modal */}
        <Modal
          visible={selectedComplaint !== null}
          transparent
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
                    <Text style={styles.label}>Worker:</Text>{" "}
                    {selectedComplaint.workerName}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Department:</Text>{" "}
                    {selectedComplaint.workerDepartment}
                  </Text>

                  {/* User Uploaded Photos */}
                  {selectedComplaint?.userImages?.length > 0 && (
                    <>
                      <Text style={styles.label}>Your Uploaded Photos:</Text>
                      <ScrollView horizontal>
                        {selectedComplaint.userImages.map((url, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: url }}
                            style={{
                              width: width * 0.7,
                              height: 180,
                              borderRadius: 10,
                              marginRight: 10,
                            }}
                          />
                        ))}
                      </ScrollView>
                    </>
                  )}

                  {/* Resolution Photos */}
                  {selectedComplaint?.resolutionImages?.length > 0 && (
                    <>
                      <Text style={[styles.label, { marginTop: 10 }]}>
                        After Resolution:
                      </Text>
                      <ScrollView horizontal>
                        {selectedComplaint.resolutionImages.map((url, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: url }}
                            style={{
                              width: width * 0.7,
                              height: 180,
                              borderRadius: 10,
                              marginRight: 10,
                            }}
                          />
                        ))}
                      </ScrollView>
                    </>
                  )}

                  {/* Note input */}
                  <TextInput
                    placeholder="Add a note about this complaint..."
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    style={styles.noteInput}
                  />

                  <TouchableOpacity
                    style={styles.submitBtn}
                    disabled={submitting}
                    onPress={handleNoteSubmit}>
                    <Text style={styles.submitBtnText}>
                      {submitting ? "Submitting..." : "Submit Note"}
                    </Text>
                  </TouchableOpacity>

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
    </AuthGuard>
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
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: { fontSize: 14, color: "#333", marginBottom: 8 },
  noteInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 10,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default DisplayComplaints;
