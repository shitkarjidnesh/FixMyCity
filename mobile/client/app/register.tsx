import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Validate phone number (simple check, 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://10.0.2.2:5000/api/auth/register", {
        name,
        email,
        phone,
        address,
        password,
      });

      if (res.data.msg?.toLowerCase().includes("success")) {
        if (res.data.token) {
          await AsyncStorage.setItem("token", res.data.token);
        }
        Alert.alert("Success", res.data.msg);
        router.replace("/login");
      } else {
        Alert.alert("Error", res.data.msg || "Registration failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "500",
  },
});
