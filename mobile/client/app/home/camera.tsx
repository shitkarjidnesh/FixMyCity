// import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
// import * as Location from "expo-location";
// import { useState, useEffect } from "react";
// import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// export default function App() {
//   const [facing, setFacing] = useState<CameraType>("back");
//   const [permission, requestPermission] = useCameraPermissions();
//   const [location, setLocation] = useState<Location.LocationObject | null>(
//     null
//   );
//   const [locPermission, setLocPermission] = useState<boolean>(false);

//   // Request location permission + start continuous updates
//   useEffect(() => {
//     let subscription: Location.LocationSubscription | null = null;

//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === "granted") {
//         setLocPermission(true);

//         subscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 1000, // update every 3 seconds
//             distanceInterval: 0.5, // or every 1 meter moved
//           },
//           (loc) => setLocation(loc)
//         );
//       }
//     })();

//     // cleanup on unmount
//     return () => {
//       if (subscription) {
//         subscription.remove();
//       }
//     };
//   }, []);

//   if (!permission) {
//     return <View />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>
//           We need your permission to show the camera
//         </Text>
//         <Button onPress={requestPermission} title="grant permission" />
//       </View>
//     );
//   }

//   function toggleCameraFacing() {
//     setFacing((current) => (current === "back" ? "front" : "back"));
//   }

//   return (
//     <View style={styles.container}>
//       <CameraView style={styles.camera} facing={facing}>
//         {/* Overlay location text */}
//         <View style={styles.overlay}>
//           <Text style={styles.locationText}>
//             {locPermission && location
//               ? `Lat: ${location.coords.latitude.toFixed(
//                   5
//                 )}, Lng: ${location.coords.longitude.toFixed(5)}`
//               : "Fetching location..."}
//           </Text>
//         </View>
//       </CameraView>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
//           <Text style={styles.text}>Flip Camera</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   overlay: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     padding: 8,
//     borderRadius: 8,
//   },
//   locationText: {
//     color: "white",
//     fontSize: 16,
//   },
//   message: {
//     textAlign: "center",
//     paddingBottom: 10,
//   },
//   buttonContainer: {
//     position: "absolute",
//     bottom: 64,
//     flexDirection: "row",
//     backgroundColor: "transparent",
//     width: "100%",
//     paddingHorizontal: 64,
//   },
//   button: {
//     flex: 1,
//     alignItems: "center",
//   },
//   text: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "white",
//   },
// });
import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const cameraRef = useRef<any>(null);

  // location subscription
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 1 },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
      return () => sub.remove();
    })();
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setPhotos((prev) => [
        ...prev,
        {
          uri: photo.uri,
          coords: location,
          time: timestamp,
        },
      ]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} ref={cameraRef} />
      <View style={styles.capture}>
        <TouchableOpacity onPress={takePicture}>
          <Text style={styles.btn}>📷</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.uri }} style={{ width: 100, height: 100 }} />
            <Text>{item.time}</Text>
            <Text>Lat: {item.coords?.latitude}</Text>
            <Text>Lng: {item.coords?.longitude}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  capture: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    padding: 10,
  },
  btn: { fontSize: 32, color: "white" },
  card: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
});
