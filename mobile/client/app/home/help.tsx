import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import React from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import { MaterialIcons } from "@expo/vector-icons"; // For icons

export default function Help() {
  return (
    <AuthGuard>
      <TopNav />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Help & Support</Text>

        {/* Quick Tips */}
        <View style={styles.quickTipsContainer}>
          <View style={styles.tipCard}>
            <MaterialIcons name="photo-camera" size={24} color="#fff" />
            <Text style={styles.tipText}>Upload Clear Photos</Text>
          </View>
          <View style={styles.tipCard}>
            <MaterialIcons name="location-on" size={24} color="#fff" />
            <Text style={styles.tipText}>Enable Location</Text>
          </View>
          <View style={styles.tipCard}>
            <MaterialIcons name="description" size={24} color="#fff" />
            <Text style={styles.tipText}>Provide Details</Text>
          </View>
          <View style={styles.tipCard}>
            <MaterialIcons name="check-circle" size={24} color="#fff" />
            <Text style={styles.tipText}>Track Status</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Welcome to FixMyCity Help! Here you can find guidance on how to report
          issues, track complaints, and get assistance from our support team.
        </Text>

        <Text style={styles.sectionTitle}>How to Report an Issue:</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>
            1. Go to the "Report Problem" section.
          </Text>
          <Text style={styles.listItem}>
            2. Fill in your details: name, email, and address.
          </Text>
          <Text style={styles.listItem}>
            3. Select the main and subcategory of the issue.
          </Text>
          <Text style={styles.listItem}>
            4. Add a description and take a geo-tagged photo.
          </Text>
          <Text style={styles.listItem}>
            5. Submit your complaint. You'll get updates once resolved.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>FAQs:</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>
            Q: Can I submit multiple complaints at once?
          </Text>
          <Text style={styles.answer}>
            A: Yes, but each complaint must be submitted separately with its own
            photo and description.
          </Text>

          <Text style={styles.listItem}>Q: How do I track my complaint?</Text>
          <Text style={styles.answer}>
            A: Go to "My Complaints" to see the status of each submitted
            complaint in real-time.
          </Text>

          <Text style={styles.listItem}>Q: Who resolves the complaints?</Text>
          <Text style={styles.answer}>
            A: Complaints are directed to the relevant municipal department
            responsible for that issue.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Support:</Text>
        <Text style={styles.paragraph}>
          For urgent assistance or unresolved complaints, contact us at:
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:support@fixmycity.com")}>
          <Text style={styles.link}>📧 support@fixmycity.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("tel:+911234567890")}>
          <Text style={styles.link}>📞 +91 12345 67890</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120, // for BottomNav space
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e40af",
  },
  quickTipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tipCard: {
    width: "48%",
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 10,
    flexShrink: 1,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
    marginBottom: 15,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 10,
    marginTop: 15,
  },
  list: {
    marginLeft: 10,
    marginBottom: 15,
  },
  listItem: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "500",
  },
  answer: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 10,
    marginLeft: 10,
  },
  link: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 8,
  },
});
