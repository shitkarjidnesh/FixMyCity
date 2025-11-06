import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TopNav() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleNavigate = (path: string) => {
    setMenuVisible(false);
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* 🔹 Left side logo + title */}
        <View style={styles.leftSection}>
          <Image
            source={require("../assets/logo.png")} // ✅ adjust path as per your folder
            style={styles.logo}
          />
          <Text style={styles.headerText}>Public Grievance System</Text>
        </View>

        {/* 🔹 Right side menu button */}
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Dropdown menu */}
      {menuVisible && (
        <>
          {/* Overlay to close menu when tapping outside */}
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuContainer}>
            {[
              { label: "Home", route: "home/" },
              { label: "Profile", route: "/home/profile" },
              { label: "Help", route: "/home/help" },
              { label: "Report a Problem", route: "/home/reportProblem" },
              // { label: "Camera", route: "/home/camera" },
              { label: "About", route: "/home/about" },
              // { label: "Settings", route: "/home/setting" },
              // { label: "Community", route: "/home/community" },
              { label: "View Complaints", route: "/home/workerComplaintList" },
              { label: "View On Map", route: "/home/workerComplaintsMap" },
            ].map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.route)}>
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderTopWidth: 1, borderTopColor: "#ddd" },
              ]}
              onPress={handleLogout}>
              <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: "contain",
    backgroundColor: "white",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flexShrink: 1,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 28,
    color: "#fff",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  menuContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 70 : 70,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    paddingVertical: 10,
    width: 200,
    zIndex: 20,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});
