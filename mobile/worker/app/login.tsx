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
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function WorkerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  useEffect(() => {
    let t: any;
    if (forgotMode && otpSent && timer > 0) {
      t = setInterval(() => setTimer((x) => x - 1), 1000);
    }
    if (otpSent && timer <= 0) {
      Alert.alert("OTP Expired", "Request new OTP");
      setOtpSent(false);
      setOtp("");
      setTimer(300);
    }
    return () => clearInterval(t);
  }, [forgotMode, otpSent, timer]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const login = async () => {
    if (!email || !password) return Alert.alert("Required", "Email + password");

    try {
      const r = await axios.post("http://192.168.68.44:5000/api/worker/login", {
        email,
        password,
      });
      if (r.data.success) {
        await AsyncStorage.setItem("workerData", JSON.stringify(r.data));
        router.replace("/home");
      } else Alert.alert("Failed", r.data.error);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Login failed");
    }
  };

  const sendOtp = async () => {
    if (!email) return Alert.alert("Enter email");
    try {
      const r = await axios.post(
        "http://192.168.68.44:5000/api/otp/requestworker-otp",
        { email }
      );
      if (r.data.success) {
        setOtpSent(true);
        setTimer(300);
        Alert.alert("OTP sent");
      } else Alert.alert("Fail", r.data.message);
    } catch {
      Alert.alert("Fail", "OTP request failed");
    }
  };

  const resetPwd = async () => {
    if (!otp || !newPassword || !confirmPassword)
      return Alert.alert("Required", "All fields");
    if (newPassword !== confirmPassword)
      return Alert.alert("Mismatch", "Passwords not same");

    try {
      const r = await axios.post(
        "http://192.168.68.44:5000/api/worker/verify-reset-otp",
        { email, otp, password: newPassword, confirmPassword }
      );
      if (r.data.success) {
        Alert.alert("Done", "Password reset");
        setForgotMode(false);
        setOtpSent(false);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setPassword("");
      } else {
        Alert.alert("Fail", r.data.message);
        setOtp("");
        setOtpSent(false);
        setTimer(300);
      }
    } catch {
      Alert.alert("Error", "Reset failed");
      setOtp("");
      setOtpSent(false);
      setTimer(300);
    }
  };

  return (
    <SafeAreaView style={s.a}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.f}>
        <ScrollView contentContainerStyle={s.c}>
          <Text style={s.wc}>Welcome to FixMyCity</Text>
          <Text style={s.ws}>Worker Access Portal</Text>
          <Text style={s.h}>
            {forgotMode ? "Worker Reset Password" : "Worker Login"}
          </Text>
          <TextInput
            style={s.i}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {forgotMode ? (
            otpSent ? (
              <>
                <TextInput
                  style={s.i}
                  placeholder={`Enter OTP (${fmt(timer)})`}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                />

                <View style={s.pw}>
                  <TextInput
                    style={s.pi}
                    placeholder="New Password"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    style={s.e}
                    onPress={() => setShowPassword((x) => !x)}>
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={s.i}
                  placeholder="Confirm Password"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={s.b} onPress={resetPwd}>
                  <Text style={s.bt}>Reset Password</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={s.b} onPress={sendOtp}>
                <Text style={s.bt}>Send OTP</Text>
              </TouchableOpacity>
            )
          ) : (
            <>
              <View style={s.pw}>
                <TextInput
                  style={s.pi}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={s.e}
                  onPress={() => setShowPassword((x) => !x)}>
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={s.b} onPress={login}>
                <Text style={s.bt}>Login</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => setForgotMode((x) => !x)}>
            <Text style={s.l}>
              {forgotMode ? "Back to Login" : "Forgot Password?"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  a: { flex: 1, backgroundColor: "#f3f4f6" },
  f: { flex: 1 },
  c: { flexGrow: 1, justifyContent: "center", padding: 24 },
  h: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  i: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  b: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  bt: { color: "#fff", fontSize: 16, fontWeight: "600" },
  l: { textAlign: "center", color: "#2563eb", fontWeight: "500", fontSize: 15 },
  pw: { position: "relative", marginBottom: 16 },
  pi: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    backgroundColor: "#fff",
  },
  e: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  wc: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    color: "#1e293b",
  },
  ws: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 18,
    color: "#475569",
  },
});
