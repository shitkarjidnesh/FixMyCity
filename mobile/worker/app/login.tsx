import { useState, useEffect } from "react";
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
import axios from "axios";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  // Forgot password states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (forgotMode && otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (forgotMode && otpSent && timer <= 0) {
      Alert.alert("OTP expired", "Please request a new OTP");
      setOtpSent(false);
      setOtp("");
      setTimer(300);
    }
    return () => clearInterval(interval);
  }, [forgotMode, otpSent, timer]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    //  const role = "worker";

    try {
      const res = await axios.post(
        "http://192.168.68.44:5000/api/worker/login",
        {
          email,
          password,
          //          role,
        }
      );

      if (res.data.success) {
        await AsyncStorage.setItem("workerData", JSON.stringify(res.data));
        Alert.alert("Success", res.data.message || "Login successful!");
        router.replace("/home/profile");
      } else {
        Alert.alert("Login Failed", res.data.error || "Something went wrong.");
      }
    } catch (error: any) {
      console.error("Frontend login error:", error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "An error occurred during login.";
        Alert.alert("Login Error", message);
      } else {
        Alert.alert("Login Error", "Unexpected error occurred.");
      }
    }
  };

  // Forgot password functions
  const requestOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Enter your email first");
      return;
    }
    try {
      const res = await axios.post(
        "http://192.168.68.44:5000/api/otp/request-otp",
        { email }
      );
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

  const verifyOtpAndReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(
        "http://192.168.68.44:5000/api/auth/verify-reset-otp",
        {
          email,
          otp,
          password: newPassword,
          confirmPassword,
        }
      );
      if (res.data.success) {
        Alert.alert("Success", "Password reset successfully");
        setForgotMode(false);
        setOtp("");
        setOtpSent(false);
        setNewPassword("");
        setConfirmPassword("");
        setPassword("");
      } else {
        Alert.alert("Error", res.data.message || "OTP verification failed");
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
          <Text style={styles.infoText}>
            Welcome To FixMyCity!{" "}
            {forgotMode
              ? "Reset your password."
              : "Please log in to access your account."}
          </Text>

          <Text style={styles.title}>
            {forgotMode ? "Forgot Password" : "Login"}
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {forgotMode ? (
            <>
              {!otpSent ? (
                <TouchableOpacity style={styles.button} onPress={requestOtp}>
                  <Text style={styles.buttonText}>Send OTP</Text>
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
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="New Password"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
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
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={verifyOtpAndReset}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <>
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

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => setForgotMode(!forgotMode)}>
            <Text style={styles.link}>
              {forgotMode ? "Back to Login" : "Forgot Password?"}
            </Text>
          </TouchableOpacity>

          {!forgotMode && (
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.link}>New user? Register here</Text>
            </TouchableOpacity>
          )}
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
    fontSize: 20,
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
  passwordWrapper: { position: "relative", marginBottom: 16 },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
});
