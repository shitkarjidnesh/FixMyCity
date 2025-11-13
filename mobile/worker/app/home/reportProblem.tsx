// reportProblem.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Photo = {
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

type LocationType = {
  latitude: number;
  longitude: number;
} | null;

type ComplaintType = {
  id: string;
  name: string;
};

type SubType = {
  id: string;
  name: string;
};
type User = {
  token: string;
  name: string;
  email: string;
  userId: string;
  // Add any other properties you store after login
};

const BASE_URL = "http://192.168.68.44:5000";

export default function ReportProblem(): JSX.Element {
  const [userData, setUserData] = useState<User | null>(null);
  // Form fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Complaint types
  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([]);
  const [selectedMainType, setSelectedMainType] = useState<string>("");
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [selectedSubType, setSelectedSubType] = useState<string>("");

  const [description, setDescription] = useState<string>("");
  const [locationState, setLocationState] = useState<LocationType>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();

  const [loadingTypes, setLoadingTypes] = useState<boolean>(true);
  const [subLoading, setSubLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load user data when the component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          // You must PARSE the JSON string back into an object
          const parsedData: User = JSON.parse(storedUserData);
          console.log(parsedData);
          // The FIX: Set the user data into state
          setUserData(parsedData);

          // BONUS: Pre-fill form fields for a better user experience
          if (parsedData.name) setName(parsedData.name);
          if (parsedData.email) setEmail(parsedData.email);
        }
      } catch (error) {
        console.error("Failed to load user data from storage", error);
        Alert.alert("Error", "Could not load your user details.");
      }
    };
    loadUser();
  }, []); // Empty array ensures this runs only once on mount
  // Fetch main complaint types
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTypes(true);
        const res = await axios.get(`${BASE_URL}/api/complaint-types`);
        if (!mounted) return;
        setComplaintTypes(res.data.data); // <--- FIX .data
      } catch (err) {
        console.warn("Could not load complaint types:", err);
        Alert.alert("Network", "Failed to load complaint types from server.");
      } finally {
        if (mounted) setLoadingTypes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch subtypes when main type changes
  useEffect(() => {
    if (!selectedMainType) {
      setSubTypes([]);
      setSelectedSubType("");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setSubLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/complaint-types/${selectedMainType}/subtypes`
        );

        if (!mounted) return;

        const subData: SubType[] = res.data?.data || []; // default to empty array
        setSubTypes(subData);
        console.log("Subtypes response:", res.data);

        // auto-select first subtype if present
        if (subData.length > 0) setSelectedSubType(subData[0].id);
        else setSelectedSubType(""); // reset if no subtypes
      } catch (err) {
        console.warn("Could not load subtypes:", err);
        Alert.alert("Network", "Failed to load subtypes from server.");
        setSubTypes([]);
        setSelectedSubType("");
      } finally {
        if (mounted) setSubLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedMainType]);

  // Get location
  const getLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission",
          "Please enable location permission."
        );
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocationState({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      console.warn(err);
      Alert.alert("Location", "Unable to get location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Take photo
  const takePhoto = async () => {
    if (!cameraRef.current) {
      Alert.alert("Camera", "Camera not ready.");
      return;
    }
    try {
      // Prevent too many photos which can cause OOM on low-memory devices
      const MAX_PHOTOS = 3;
      if (photos.length >= MAX_PHOTOS) {
        Alert.alert(
          "Limit reached",
          `You can attach up to ${MAX_PHOTOS} photos.`
        );
        return;
      }

      const rawPhoto = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });

      // Resize & compress the image to reduce memory/network usage
      const resized = await ImageManipulator.manipulateAsync(
        rawPhoto.uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const loc = await Location.getCurrentPositionAsync({});
      const meta: Photo = {
        uri: resized.uri,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      setPhotos((p) => [...p, meta]);
      // close camera modal and reset ready flag
      setCameraVisible(false);
      setIsCameraReady(false);
    } catch (err) {
      console.warn("takePhoto error:", err);
      Alert.alert("Camera", "Could not take photo.");
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing((cur) => (cur === "back" ? "front" : "back"));
  };

  const removePhoto = (index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  // Submit complaint
  const handleSubmit = async () => {
    if (!name || !email || !address) {
      Alert.alert("Validation", "Please fill name, email and address.");
      return;
    }
    if (!selectedMainType || !selectedSubType) {
      Alert.alert("Validation", "Please select main and sub complaint types.");
      return;
    }
    if (!description) {
      Alert.alert("Validation", "Please enter a description.");
      return;
    }
    if (!locationState) {
      Alert.alert("Validation", "Please capture location.");
      return;
    }
    if (photos.length === 0) {
      Alert.alert("Validation", "Please take at least one photo.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("address", address);
      form.append("mainTypeId", selectedMainType);
      form.append("subTypeId", selectedSubType);
      form.append("description", description);
      form.append("latitude", String(locationState.latitude));
      form.append("longitude", String(locationState.longitude));
      form.append("createdAt", new Date().toISOString());

      photos.forEach((p, idx) => {
        const filename = p.uri.split("/").pop() || `photo_${idx}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";

        // @ts-ignore
        form.append("photos", { uri: p.uri, name: filename, type: mimeType });
        form.append(`photos_meta[${idx}][latitude]`, String(p.latitude));
        form.append(`photos_meta[${idx}][longitude]`, String(p.longitude));
        form.append(`photos_meta[${idx}][timestamp]`, p.timestamp);
      });

      const res = await axios.post(`${BASE_URL}/api/complaints`, form, {
        headers: {
          Authorization: `Bearer ${userData?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Complaint submitted successfully.");
      // reset form
      setName("");
      setEmail("");
      setAddress("");
      setSelectedMainType("");
      setSubTypes([]);
      setSelectedSubType("");
      setDescription("");
      setLocationState(null);
      setPhotos([]);
    } catch (err) {
      console.warn("submit error:", err);
      Alert.alert("Network", "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.heading}>Submit Complaint</Text>

      {/* User Info */}
      <View style={styles.fieldBox}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
      </View>
      <View style={styles.fieldBox}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.fieldBox}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Address / landmark"
        />
      </View>

      {/* Main Type */}
      <View style={styles.fieldBox}>
        <Text style={styles.label}>Main Complaint Type</Text>
        {loadingTypes ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedMainType}
              onValueChange={(val) => setSelectedMainType(String(val))}>
              <Picker.Item label="Select main type..." value="" />
              {complaintTypes.map((t) => (
                <Picker.Item key={t.id} label={t.name} value={t.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Sub Type */}
      <View style={styles.fieldBox}>
        <Text style={styles.label}>Sub Type</Text>
        {subLoading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedSubType}
              onValueChange={(val) => setSelectedSubType(String(val))}
              enabled={subTypes.length > 0}>
              <Picker.Item
                label={
                  subTypes.length
                    ? "Select subtype..."
                    : "Select main type first"
                }
                value=""
              />
              {subTypes.map((s) => (
                <Picker.Item key={s.id} label={s.name} value={s.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.fieldBox}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue..."
        />
      </View>

      {/* Location */}
      <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
        {loadingLocation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>
            {locationState
              ? `📍 ${locationState.latitude.toFixed(4)}, ${locationState.longitude.toFixed(4)}`
              : "Get Current Location"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Camera */}
      <TouchableOpacity
        style={styles.cameraBtn}
        onPress={async () => {
          if (!permission?.granted) await requestPermission();
          setIsCameraReady(false);
          setCameraVisible(true);
        }}>
        <Text style={styles.btnText}>📸 Take Complaint Photo</Text>
      </TouchableOpacity>

      {/* Photos preview */}
      <View style={styles.previewContainer}>
        {photos.map((p, i) => (
          <View key={i} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.previewImg} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removePhoto(i)}>
              <Text style={{ color: "white", fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}>
        <Text style={styles.btnText}>
          {submitting ? "Submitting..." : "Submit Complaint"}
        </Text>
      </TouchableOpacity>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide">
        {/* 1. Add a parent container View */}
        <View style={{ flex: 1 }}>
          {permission?.granted ? (
            <>
              {/* CameraView is now a sibling, not a parent */}
              <CameraView
                style={{ flex: 1 }}
                ref={cameraRef}
                facing={cameraFacing}
                onCameraReady={() => setIsCameraReady(true)}
              />

              {/* 2. Move the overlay elements OUTSIDE of CameraView */}
              {photos.length > 0 && (
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri: photos[photos.length - 1].uri }}
                    style={styles.thumbnail}
                  />
                </View>
              )}

              <View style={styles.cameraControlsRow}>
                <TouchableOpacity
                  style={styles.sideBtn}
                  onPress={() => setCameraVisible(false)}>
                  <Text style={styles.controlText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={takePhoto}
                  disabled={!isCameraReady}
                />

                <TouchableOpacity
                  style={styles.sideBtn}
                  onPress={toggleCameraFacing}>
                  <Text style={styles.controlText}>Flip</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.centered}>
              <Text>No camera permission</Text>
              <TouchableOpacity
                style={styles.closeCameraBtn}
                onPress={() => setCameraVisible(false)}>
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles — keep the same as your original code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#007bff",
    textAlign: "center",
  },
  fieldBox: { marginBottom: 12 },
  label: { fontWeight: "600", marginBottom: 6, color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  pickerWrap: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  locationBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  cameraBtn: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700" },
  previewContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  thumbWrap: { position: "relative", marginRight: 8, marginBottom: 8 },
  previewImg: { width: 100, height: 100, borderRadius: 8 },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#dc3545",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraControlsRow: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  shutterButton: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#007bff",
    alignSelf: "center",
  },
  sideBtn: { backgroundColor: "#00000080", padding: 10, borderRadius: 8 },
  controlText: { color: "#fff", fontWeight: "700" },
  thumbnailContainer: {
    position: "absolute",
    bottom: 140,
    left: 20,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  thumbnail: { width: 60, height: 60 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  closeCameraBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
});
