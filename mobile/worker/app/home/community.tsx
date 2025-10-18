import { View, Text, StyleSheet } from "react-native";
import React from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

export default function cummunity() {
  return (
    <AuthGuard>
      <TopNav />
      <View style={styles.container}>
        <Text style={styles.title}>Community Page</Text>
        <Text style={styles.subtitle}>Welcome to our community page!</Text>
      </View>
      <BottomNav />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
});

