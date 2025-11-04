// resolveComplaint.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

const BASE_URL = "http://192.168.68.44:5000";

export default function ResolveComplaint() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("workerData");
      console.log("🧩 workerData in storage:", stored);
    })();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPhoto(result.uri);
      setCameraVisible(false);
    } catch (err) {
      console.warn("Camera error:", err);
    }
  };

  const submitResolution = async () => {
    if (!photo) return Alert.alert("Validation", "Take a resolution photo.");
    if (!notes.trim())
      return Alert.alert("Validation", "Add resolution notes.");

    setSubmitting(true);

    try {
      const stored = await AsyncStorage.getItem("workerData");
      const parsed = stored ? JSON.parse(stored) : null;
      const { token} = parsed || {};

      if (!token ) {
        Alert.alert("Error", "Worker session invalid. Please log in again.");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable location access.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});

      const form = new FormData();
      form.append("resolutionNotes", notes.trim());
      form.append("latitude", String(loc.coords.latitude));
      form.append("longitude", String(loc.coords.longitude));
      form.append("timestamp", new Date().toISOString());
      form.append("resolutionPhotos", {
        uri: photo,
        name: `resolution_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      const url = `${BASE_URL}/api/worker/uploadResolution/${id}`;
      console.log("📤 POST", url);

      const res = await axios.post(url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        Alert.alert("✅ Success", "Complaint marked as resolved!");
        router.back();
      } else {
        Alert.alert(
          "Error",
          res.data.message || "Failed to submit resolution."
        );
      }
    } catch (err) {
      console.warn("❌ Upload error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to submit resolution.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
        <TopNav />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.label}>Add Resolution Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.input}
            placeholder="Describe the fix done..."
          />

          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={async () => {
              if (!permission?.granted) await requestPermission();
              setCameraVisible(true);
            }}>
            <Text style={styles.btnText}>
              {photo ? "📷 Retake Photo" : "📸 Take Resolution Photo"}
            </Text>
          </TouchableOpacity>

          {photo && <Image source={{ uri: photo }} style={styles.previewImg} />}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            disabled={submitting}
            onPress={submitResolution}>
            <Text style={styles.btnText}>
              {submitting ? "Submitting..." : "Submit Resolution"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNav />

        <Modal visible={cameraVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            {permission?.granted ? (
              <>
                <CameraView
                  style={{ flex: 1 }}
                  ref={cameraRef}
                  facing={cameraFacing}
                  onCameraReady={() => setIsCameraReady(true)}
                />
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.sideBtn}
                    onPress={() => setCameraVisible(false)}>
                    <Text style={styles.controlText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.shutter}
                    onPress={takePhoto}
                    disabled={!isCameraReady}
                  />
                  <TouchableOpacity
                    style={styles.sideBtn}
                    onPress={() =>
                      setCameraFacing((cur) =>
                        cur === "back" ? "front" : "back"
                      )
                    }>
                    <Text style={styles.controlText}>Flip</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.center}>
                <Text>No camera permission</Text>
              </View>
            )}
          </View>
        </Modal>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "bold", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  cameraBtn: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  submitBtn: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 14,
    marginTop: 20,
  },
  btnText: { color: "white", fontWeight: "bold", textAlign: "center" },
  previewImg: {
    width: "100%",
    height: 250,
    marginTop: 10,
    borderRadius: 10,
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  sideBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "gray",
  },
  controlText: { color: "white", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
