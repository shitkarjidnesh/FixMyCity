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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300);

  const router = useRouter();

  // Timer countdown
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

  // Validate DOB (minimum age 13)
  const validateDob = (selectedDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    if (
      age < 13 ||
      (age === 13 && monthDiff < 0) ||
      (age === 13 &&
        monthDiff === 0 &&
        today.getDate() < selectedDate.getDate())
    ) {
      Alert.alert(
        "Invalid DOB",
        "You must be at least 13 years old to register."
      );
      return false;
    }
    return true;
  };

  const onChangeDob = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && validateDob(selectedDate)) {
      setDob(selectedDate);
    }
  };

  const formattedDob = dob.toISOString().split("T")[0]; // yyyy-mm-dd

  // Request OTP
  const requestOtp = async () => {
    if (
      !name ||
      !email ||
      !phone ||
      !area ||
      !city ||
      !state ||
      !pincode ||
      !gender ||
      !dob ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all required fields");
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
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to request OTP");
    }
  };

  const verifyOtpAndRegister = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }
    try {
      const res = await axios.post("http://10.0.2.2:5000/api/otp/verify-otp", {
        name,
        email,
        phone,
        password,
        otp,
        gender,
        dob: formattedDob,
        address: {
          houseNo,
          street,
          landmark,
          area,
          city,
          state,
          pincode,
        },
      });

      if (res.data.success) {
        Alert.alert("Success", "Registration complete");
        router.replace("/login");
      } else {
        Alert.alert("Error", res.data.message || "OTP invalid or expired");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Registration failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            style={styles.input}
          />
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Address</Text>
          <TextInput
            placeholder="House No"
            value={houseNo}
            onChangeText={setHouseNo}
            style={styles.input}
          />
          <TextInput
            placeholder="Street"
            value={street}
            onChangeText={setStreet}
            style={styles.input}
          />
          <TextInput
            placeholder="Landmark"
            value={landmark}
            onChangeText={setLandmark}
            style={styles.input}
          />
          <TextInput
            placeholder="Area *"
            value={area}
            onChangeText={setArea}
            style={styles.input}
          />
          <TextInput
            placeholder="City *"
            value={city}
            onChangeText={setCity}
            style={styles.input}
          />
          <TextInput
            placeholder="State *"
            value={state}
            onChangeText={setState}
            style={styles.input}
          />
          <TextInput
            placeholder="Pincode *"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}>
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}>
            <Text style={styles.dateText}>DOB: {formattedDob}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={onChangeDob}
            />
          )}

          {/* Password Fields */}
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
  sectionLabel: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dateButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    color: "#333",
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
    paddingRight: 40,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }],
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

  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
});
