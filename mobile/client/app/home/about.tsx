import { View, Text, StyleSheet, ScrollView } from "react-native";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import AuthGuard from "@/components/AuthGuard";

export default function About() {
  return (
    <AuthGuard>
      <View style={styles.container}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>About FixMyCity</Text>

          <View style={styles.card}>
            <Text style={styles.paragraph}>
              FixMyCity is a community-driven civic issue reporting platform.
              Citizens can report problems such as potholes, broken
              streetlights, garbage dumping, or damaged public property by
              uploading a photo, location, and description.
            </Text>

            <Text style={styles.paragraph}>
              The system ensures that complaints are directed to the right
              municipal department. Once resolved, authorities can upload proof
              of completion, giving citizens transparency and accountability.
            </Text>

            <Text style={styles.paragraph}>
              Our mission is to create cleaner, safer, and better-managed cities
              by connecting citizens and local authorities in a seamless digital
              process.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Key Features:</Text>
          <View style={styles.featuresList}>
            <Text style={styles.listItem}>📍 Geo-tagged photo complaints</Text>
            <Text style={styles.listItem}>
              🗂️ Category-based issue reporting
            </Text>
            <Text style={styles.listItem}>⏱️ Real-time complaint tracking</Text>
            <Text style={styles.listItem}>✅ Proof of resolution updates</Text>
            <Text style={styles.listItem}>
              💬 Transparent citizen–authority communication
            </Text>
          </View>
        </ScrollView>
        <BottomNav />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120, // bottom nav space
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e40af",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  paragraph: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    marginBottom: 12,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2563eb",
  },
  featuresList: {
    marginLeft: 12,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 10,
    color: "#374151",
  },
});
