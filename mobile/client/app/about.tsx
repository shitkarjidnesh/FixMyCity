import { View, Text, StyleSheet, ScrollView } from "react-native";
import BottomNav from "../components/BottomNav";
import TopNav from "@/components/TopNav";


export default function About() {
  return (
    <View style={styles.container}>
      <TopNav></TopNav>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>About FixMyCity</Text>
        <Text style={styles.paragraph}>
          FixMyCity is a community-driven civic issue reporting platform.
          Citizens can report problems such as potholes, broken streetlights,
          garbage dumping, or damaged public property by uploading a photo,
          location, and description.
        </Text>

        <Text style={styles.paragraph}>
          The system ensures that complaints are directed to the right municipal
          department. Once resolved, authorities can upload proof of completion,
          giving citizens transparency and accountability.
        </Text>

        <Text style={styles.paragraph}>
          Our mission is to create cleaner, safer, and better-managed cities by
          connecting citizens and local authorities in a seamless digital
          process.
        </Text>

        <Text style={styles.sectionTitle}>Key Features:</Text>
        <Text style={styles.listItem}>• Geo-tagged photo complaints</Text>
        <Text style={styles.listItem}>• Category-based issue reporting</Text>
        <Text style={styles.listItem}>• Real-time complaint tracking</Text>
        <Text style={styles.listItem}>• Proof of resolution updates</Text>
        <Text style={styles.listItem}>
          • Transparent citizen–authority communication
        </Text>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  paragraph: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 15,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#2563eb",
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
});
