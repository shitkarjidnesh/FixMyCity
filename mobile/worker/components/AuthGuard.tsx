import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import jwtDecode from "jwt-decode";

interface Props {
  children: React.ReactNode;
}

interface TokenPayload {
  exp: number; // expiry timestamp
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const logoutAndRedirect = async () => {
    await AsyncStorage.removeItem("workerData");
    Alert.alert("Session expired", "Please login again.");
    router.replace("/login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem("workerData");
        if (!stored) return logoutAndRedirect();

        const parsed = JSON.parse(stored);
        const token = parsed?.token; // ensure structure matches your storage format

        if (!token) return logoutAndRedirect();

        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (!decoded?.exp || decoded.exp < currentTime) {
          return logoutAndRedirect();
        }

        setLoading(false);
      } catch (err) {
        console.error("AuthGuard error:", err);
        logoutAndRedirect();
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
