// // import AuthGuard from "@/components/AuthGuard";
// // import BottomNav from "@/components/BottomNav";
// // import TopNav from "@/components/TopNav";
// // import { View, Text, ScrollView, StyleSheet } from "react-native";

// // export default function Home() {
// //   return (
// //     <AuthGuard>
// //       <TopNav />
// //       <ScrollView style={styles.container}>
// //         <View style={styles.content}>
// //           <Text style={styles.title}>
// //             Welcome to the Public Grievance System
// //           </Text>
// //           <Text style={styles.subtitle}>
// //             Your platform to voice concerns and get them resolved.
// //           </Text>
// //         </View>
// //       </ScrollView>
// //       <BottomNav />
// //     </AuthGuard>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#f5f5f5",
// //   },
// //   content: {
// //     padding: 20,
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: "bold",
// //     marginBottom: 10,
// //     textAlign: "center",
// //   },
// //   subtitle: {
// //     fontSize: 16,
// //     textAlign: "center",
// //     color: "#666",
// //   },
// // });

// import AuthGuard from "@/components/AuthGuard";
// import BottomNav from "@/components/BottomNav";
// import TopNav from "@/components/TopNav";
// import { View, Text, ScrollView, StyleSheet } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useEffect, useState } from "react";

// export default function Home() {
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem("token"); // key used during setItem
//         if (storedToken) {
//           setToken(storedToken);
//         }
//       } catch (error) {
//         console.error("Error fetching token:", error);
//       }
//     };

//     fetchToken();
//   }, []);

//   return (
//     <AuthGuard>
//       <TopNav />
//       <ScrollView style={styles.container}>
//         <View style={styles.content}>
//           <Text style={styles.title}>
//             Welcome to the Public Grievance System
//           </Text>
//           <Text style={styles.subtitle}>
//             Your platform to voice concerns and get them resolved.
//           </Text>

//           {/* Display stored token info */}
//           {token ? (
//             <Text style={styles.tokenText}>Token: {token}</Text>
//           ) : (
//             <Text style={styles.tokenText}>No token stored</Text>
//           )}
//         </View>
//       </ScrollView>
//       <BottomNav />
//     </AuthGuard>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   content: {
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 16,
//     textAlign: "center",
//     color: "#666",
//   },
//   tokenText: {
//     fontSize: 14,
//     marginTop: 20,
//     textAlign: "center",
//     color: "#333",
//   },
// });


import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    };
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.content}>
        {userData ? (
          <>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.field}>Name: {userData.name}</Text>
            <Text style={styles.field}>Email: {userData.email}</Text>
            <Text style={styles.field}>Phone: {userData.phone}</Text>
            <Text style={styles.field}>Token: {userData.token}</Text>
          </>
        ) : (
          <Text style={styles.field}>No profile data found.</Text>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  field: { fontSize: 16, marginBottom: 10, color: "#333" },
});

