import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
        setAddress(parsed.address || "");
      }
    };
    loadUser();
  }, []);

  const handleEditToggle = () => setEditing(!editing);

  const handleUpdate = async () => {
    if (!name || !email || !phone || !address) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setUpdating(true);
      const res = await axios.put(
        "http://10.0.2.2:5000/api/users/profile",
        { name, email, phone, address },
        { headers: { Authorization: `Bearer ${userData?.token}` } }
      );

      const updatedData = { ...userData, ...res.data };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
      setUserData(updatedData);
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert(
        "Update Error",
        error.response?.data?.msg || "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (!userData) {
    return (
      <AuthGuard>
        <TopNav />
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
        <BottomNav />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <TopNav />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                userData.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.title}>Profile</Text>

        {!editing ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{userData.name}</Text>

              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userData.email}</Text>

              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{userData.phone}</Text>

              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{userData.address}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleEditToggle}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, updating && { backgroundColor: "#999" }]}
              onPress={handleUpdate}
              disabled={updating}>
              <Text style={styles.buttonText}>
                {updating ? "Updating..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ccc" }]}
              onPress={handleEditToggle}
              disabled={updating}>
              <Text style={[styles.buttonText, { color: "#333" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Token</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {userData?.token || "N/A"}
          </Text>
        </View>
      </ScrollView>
      <BottomNav />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontWeight: "bold", fontSize: 14, marginTop: 10 },
  value: { fontSize: 16, marginTop: 2, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
