import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    const loadUserFromAPI = async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (!stored) return;

        const parsed = JSON.parse(stored); // <-- parse JSON
        const token = parsed.token; // <-- extract token

        if (!token) return;

        const res = await axios.get(
          "http://192.168.68.44:5000/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = res.data;
        console.log("Fetched user data:", user);
        // merge API user + saved token
        setUserData({ ...user, token });

        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phoneNo || "");
        setHouseNo(user.address?.houseNo || "");
        setStreet(user.address?.street || "");
        setLandmark(user.address?.landmark || "");
        setArea(user.address?.area || "");
        setCity(user.address?.city || "");
        setDistrict(user.address?.district || "");
        setState(user.address?.state || "");
        setPincode(user.address?.pincode || "");
      } catch (error) {
        Alert.alert(
          "Error",
          error.response?.data?.msg || "Failed to load profile"
        );
      }
    };

    loadUserFromAPI();
  }, []);

  const handleEditToggle = () => setEditing(!editing);

  const handleUpdate = async () => {
    if (!name || !email || !phone || !area || !city || !state || !pincode) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setUpdating(true);
      const res = await axios.put(
        "http://192.168.68.44:5000/api/auth/profile",
        {
          name,
          email,
          phoneNo: phone,
          address: {
            houseNo,
            street,
            landmark,
            area,
            city,
            district,
            state,
            pincode,
          },
        },
        { headers: { Authorization: `Bearer ${userData.token}` } }
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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
                <Text style={styles.value}>{name}</Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{email}</Text>

                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{phone}</Text>

                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>
                  {houseNo ? houseNo + ", " : ""}
                  {street ? street + ", " : ""}
                  {landmark ? landmark + ", " : ""}
                  {area ? area + ", " : ""}
                  {city ? city + ", " : ""}
                  {district ? district + ", " : ""}
                  {state ? state + ", " : ""}
                  {pincode}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleEditToggle}>
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
                  placeholder="House No"
                  value={houseNo}
                  onChangeText={setHouseNo}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Street"
                  value={street}
                  onChangeText={setStreet}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Landmark"
                  value={landmark}
                  onChangeText={setLandmark}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Area"
                  value={area}
                  onChangeText={setArea}
                />

                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />

                <TextInput
                  style={styles.input}
                  placeholder="District"
                  value={district}
                  onChangeText={setDistrict}
                />

                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Pincode"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
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
                <Text style={[styles.buttonText, { color: "#333" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* <View style={styles.card}>
          <Text style={styles.label}>Token</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {userData?.token || "N/A"}
          </Text>
        </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
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
