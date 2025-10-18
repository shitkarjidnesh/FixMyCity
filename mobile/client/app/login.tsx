import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import axios and the isAxiosError type guard
import axios from "axios";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

  const   role = "user";

    try {
      const res = await axios.post("http://192.168.68.44:5000/api/auth/login", {
        email,
        password,
        role,
        
            });

      await AsyncStorage.setItem("userData", JSON.stringify(res.data));
      router.replace("/home");
    } catch (error) {
      // Check if the error is an Axios error
      if (axios.isAxiosError(error)) {
        // Now TypeScript knows `error` is an AxiosError,
        // so you can safely access `error.response`
        Alert.alert(
          "Login Error",
          error.response?.data?.msg || "An error occurred during login."
        );
      } else {
        // Handle cases where the error is not from Axios
        Alert.alert("Login Error", "An unexpected error occurred.");
        console.error("Unexpected error:", error);
      }
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
          <Text style={styles.infoText}>
            Welcome To FixMyCity! Please log in to access your account and
            report issues.
          </Text>

          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>New user? Register here</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  infoText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "blue",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "500",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
