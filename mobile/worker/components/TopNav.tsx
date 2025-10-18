import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ExternalPathString,
  RelativePathString,
  UnknownInputParams,
  useRouter,
} from "expo-router";

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

  const handleNavigate = (
    e:
      | string
      | { pathname: RelativePathString; params?: UnknownInputParams }
      | { pathname: ExternalPathString; params?: UnknownInputParams }
      | { pathname: `/about`; params?: UnknownInputParams }
      | { pathname: `/`; params?: UnknownInputParams }
      | { pathname: `/login`; params?: UnknownInputParams }
      | { pathname: `/register`; params?: UnknownInputParams }
      | { pathname: `/home/community`; params?: UnknownInputParams }
      | { pathname: `/_sitemap`; params?: UnknownInputParams }
      | { pathname: `/home/camera`; params?: UnknownInputParams }
      | { pathname: `/home/complaint`; params?: UnknownInputParams }
      | { pathname: `/home/cummunity`; params?: UnknownInputParams }
      | { pathname: `/home/help`; params?: UnknownInputParams }
      | { pathname: `/home`; params?: UnknownInputParams }
      | { pathname: `/home/profile`; params?: UnknownInputParams }
      | { pathname: `/home/setting`; params?: UnknownInputParams }
      | { pathname: `/home/reportProblem`; params?: UnknownInputParams },
  ) => {
    setMenuVisible(false);
    router.push(e);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Public Grievance System</Text>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <>
          {/* Overlay for click outside */}
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/")}>
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/profile")}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/help")}>
              <Text style={styles.menuText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/reportProblem")}>
              <Text style={styles.menuText}>Report a Problem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/camera")}>
              <Text style={styles.menuText}>camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/about")}>
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/setting")}>
              <Text style={styles.menuText}>setting</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/home/community")}>
              <Text style={styles.menuText}>Community</Text>
            </TouchableOpacity>

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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight  : 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
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
    top: Platform.OS === "android" ? StatusBar.currentHeight + 70 : 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    paddingVertical: 10,
    width: 180,
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
