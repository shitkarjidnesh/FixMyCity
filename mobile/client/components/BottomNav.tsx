// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { Link, usePathname } from "expo-router";

// type NavItem = {
//   label: string;
//   href: string;
// };

// const navItems: NavItem[] = [
//   { label: "Home", href: "/" },
//   { label: "About", href: "/about" },
//   // ✅ Add more items here
// ];

// export default function BottomNav() {
//   const pathname = usePathname();

//   return (
//     <View style={styles.container}>
//       {navItems.map((item) => (
//         <Link key={item.href} href={item.href} asChild>
//           <TouchableOpacity style={styles.item}>
//             <Text
//               style={[
//                 styles.label,
//                 pathname === item.href && styles.activeLabel,
//               ]}
//             >
//               {item.label}
//             </Text>
//           </TouchableOpacity>
//         </Link>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderColor: "#ddd",
//     backgroundColor: "#fff",
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },
//   item: {
//     padding: 8,
//   },
//   label: {
//     fontSize: 16,
//     color: "#444",
//   },
//   activeLabel: {
//     color: "blue",
//     fontWeight: "bold",
//   },
// });


import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

export default function BottomNav() {
  const router = useRouter();
  return (
    <View className="flex-row justify-around p-3 bg-gray-200">
      <TouchableOpacity onPress={() => router.push("/home/camera")}>
        <Text>📷 Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/home/complaint")}>
        <Text>📝 Complaint</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/home/community")}>
        <Text>🌍 Community</Text>
      </TouchableOpacity>
    </View>
  );
}

