import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("workerData");

        // ✅ Navigate based on token existence
        if (token) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Error checking token:", err);
        router.replace("/login");
      }
    };

    // Add small splash delay (optional)
    const timer = setTimeout(() => {
      checkAuth();
    }, 2000); // 2 seconds splash

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Optional Splash Logo */}
      <Image
        source={require("../assets/logo.png")} // or remove this line if no logo
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#1e90ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
});
