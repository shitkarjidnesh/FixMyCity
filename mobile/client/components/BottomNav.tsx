import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/home/camera")}
      >
        <Text
          style={[
            styles.icon,
            pathname === "/home/camera" && styles.activeIcon,
          ]}
        >
          📷
        </Text>
        <Text
          style={[
            styles.label,
            pathname === "/home/camera" && styles.activeLabel,
          ]}
        >
          Camera
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/home/complaint")}
      >
        <Text
          style={[
            styles.icon,
            pathname === "/home/complaint" && styles.activeIcon,
          ]}
        >
          📝
        </Text>
        <Text
          style={[
            styles.label,
            pathname === "/home/complaint" && styles.activeLabel,
          ]}
        >
          Complaint
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/home/community")}
      >
        <Text
          style={[
            styles.icon,
            pathname === "/home/community" && styles.activeIcon,
          ]}
        >
          🌍
        </Text>
        <Text
          style={[
            styles.label,
            pathname === "/home/community" && styles.activeLabel,
          ]}
        >
          Community
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#ffffff",
    position: "absolute",
    
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  icon: {
    fontSize: 20,
    color: "#555",
  },
  activeIcon: {
    color: "#2563eb", // blue-600
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  activeLabel: {
    color: "#2563eb",
    fontWeight: "bold",
  },
});
