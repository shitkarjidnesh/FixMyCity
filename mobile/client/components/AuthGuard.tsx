// AuthGuard.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import jwtDecode from "jwt-decode"; // works with v3.x

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          Alert.alert("Unauthorized", "Please login to continue.");
          router.replace("/login");
          return;
        }

        const parsedData = JSON.parse(userData);
        const token = parsedData.token;
        if (!token) {
          Alert.alert("Unauthorized", "Please login to continue.");
          router.replace("/login");
          return;
        }

        // Decode JWT and check expiration
        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000; // current time in seconds
        if (decoded.exp < now) {
          Alert.alert("Session Expired", "Please login again.");
          await AsyncStorage.removeItem("userData");
          router.replace("/login");
          return;
        }

        setLoading(false); // token valid → allow access
      } catch (err) {
        console.error("AuthGuard error:", err);
        await AsyncStorage.removeItem("userData");
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}
