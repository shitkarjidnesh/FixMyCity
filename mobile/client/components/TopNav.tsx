import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";

export default function TopNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // drawer width

  const toggleMenu = () => {
    if (open) {
      Animated.timing(slideAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setOpen(false));
    } else {
      setOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        backgroundColor: "#2563eb",
        zIndex: 500,
      }}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>FixMyCity</Text>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer + Backdrop overlay */}
      {open && (
        <>
          {/* Backdrop covers entire screen */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={toggleMenu}
          />

          {/* Drawer slides in */}
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push("/home/profile");
              }}
            >
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push("/home/settings");
              }}
            >
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push("/home/help");
              }}
            >
              <Text style={styles.menuText}>Help</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2563eb",
    elevation: 8,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: "white",
    fontSize: 26,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,

    paddingTop: 77,
    zIndex: 200,
    elevation: 6,
  },
  menuText: {
    fontSize: 18,
    color: "white",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 100,
    height: height, // ensures full screen coverage
    width: 250,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
});
