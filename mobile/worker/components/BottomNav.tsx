import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/home/camera")}>
          <Text
            style={[
              styles.icon,
              pathname === "/home/camera" && styles.activeIcon,
            ]}>
            📷
          </Text>
          <Text
            style={[
              styles.label,
              pathname === "/home/camera" && styles.activeLabel,
            ]}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/home/complaint")}>
          <Text
            style={[
              styles.icon,
              pathname === "/home/complaint" && styles.activeIcon,
            ]}>
            📝
          </Text>
          <Text
            style={[
              styles.label,
              pathname === "/home/complaint" && styles.activeLabel,
            ]}>
            Complaint
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/home/community")}>
          <Text
            style={[
              styles.icon,
              pathname === "/home/community" && styles.activeIcon,
            ]}>
            🌍
          </Text>
          <Text
            style={[
              styles.label,
              pathname === "/home/community" && styles.activeLabel,
            ]}>
            Community
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    height: 60,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1 },
  icon: { fontSize: 22, color: "#555" },
  activeIcon: { color: "#2563eb" },
  label: { fontSize: 12, color: "#555", marginTop: 2 },
  activeLabel: { color: "#2563eb", fontWeight: "bold" },
});
