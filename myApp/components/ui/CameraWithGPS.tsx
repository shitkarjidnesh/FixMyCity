import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
} from "react-native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import moment from "moment";

export default function CameraWithGPS() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [meta, setMeta] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const camStatus = await Camera.requestCameraPermissionsAsync();
    const locStatus = await Location.requestForegroundPermissionsAsync();

    setCameraPermission(camStatus.status);
    setLocationPermission(locStatus.status);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      // Location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Address
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

      setPhotoUri(photo.uri);
      setMeta({
        latitude,
        longitude,
        address: `${address.name || ""}, ${address.street || ""}, ${
          address.city || ""
        }`,
        timestamp,
      });
    }
  };

  if (cameraPermission !== "granted" || locationPermission !== "granted") {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera and Location permissions are required.
        </Text>

        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#555" }]}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <Camera style={styles.camera} ref={cameraRef} />
      ) : (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      {meta && (
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>Lat: {meta.latitude}</Text>
          <Text style={styles.metaText}>Lon: {meta.longitude}</Text>
          <Text style={styles.metaText}>Address: {meta.address}</Text>
          <Text style={styles.metaText}>Date/Time: {meta.timestamp}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    alignItems: "center",
    margin: 5,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  metaBox: { backgroundColor: "#fff", padding: 10 },
  metaText: { fontSize: 14, marginVertical: 2 },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: { fontSize: 16, marginBottom: 20, textAlign: "center" },
});
