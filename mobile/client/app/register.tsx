import { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons"; // For eye icon

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300);

  const router = useRouter();

  // OTP timer
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (otpSent && timer <= 0) {
      Alert.alert("OTP expired", "Please request a new OTP");
      setOtpSent(false);
      setOtp("");
      setTimer(300);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Request OTP
  const requestOtp = async () => {
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields before requesting OTP");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    try {
      const res = await axios.post("http://10.0.2.2:5000/api/otp/request-otp", {
        email,
      });
      if (res.data.success) {
        Alert.alert("OTP Sent", "Check your email for the OTP");
        setOtpSent(true);
        setTimer(300);
      } else {
        Alert.alert("Error", res.data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to request OTP");
    }
  };

  // Verify OTP & register
  const verifyOtpAndRegister = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }
    try {
      const res = await axios.post("http://10.0.2.2:5000/api/otp/verify-otp", {
        name,
        email,
        phoneNo: phone,
        address,
        password,
        otp,
      });
      if (res.data.success) {
        Alert.alert("Success", res.data.message || "Registration complete");
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setOtpSent(false);
        setTimer(300);
        router.replace("/login");
      } else {
        Alert.alert("OTP Error", res.data.message || "OTP invalid or expired");
        setOtp("");
        setOtpSent(false);
        setTimer(300);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Verification failed"
      );
      setOtp("");
      setOtpSent(false);
      setTimer(300);
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

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {!otpSent ? (
            <TouchableOpacity style={styles.button} onPress={requestOtp}>
              <Text style={styles.buttonText}>Request OTP</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                placeholder={`Enter OTP (${formatTime(timer)})`}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={verifyOtpAndRegister}>
                <Text style={styles.buttonText}>Verify OTP & Register</Text>
              </TouchableOpacity>
            </>
          )}

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
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  flex: { flex: 1 },
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "500",
  },
  passwordWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40, // space for the icon
    backgroundColor: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }], // vertically center the icon
  },
});
