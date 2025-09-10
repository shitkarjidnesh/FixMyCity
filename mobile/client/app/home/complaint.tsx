import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ComplaintPage() {
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("complaints");
        if (stored) {
          setComplaints(JSON.parse(stored));
        }
      } catch (err) {
        console.log("Error retrieving complaints:", err);
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stored Complaints</Text>
      {complaints.length > 0 ? (
        complaints.map((c, i) => (
          <View key={i} style={styles.card}>
            <Image source={{ uri: c.imageUri }} style={styles.image} />
            <Text>
              Lat: {c.coords.latitude.toFixed(5)} | Lng:{" "}
              {c.coords.longitude.toFixed(5)}
            </Text>
            <Text>Time: {c.timestamp}</Text>
          </View>
        ))
      ) : (
        <Text>No complaints saved yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  image: { width: "100%", height: 200, marginBottom: 10, borderRadius: 8 },
});
