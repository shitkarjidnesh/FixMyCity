// import { View, Text } from "react-native";
// import BottomNav from "../components/BottomNav";

// export default function Home() {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>Welcome to FixMyCity</Text>
//       <BottomNav></BottomNav>
//     </View>
//   );
// }


import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) router.replace("/home");
      else router.replace("/login");
    }, 2000);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold">Welcome to FixMyCity</Text>
      <ActivityIndicator size="large" color="blue" className="mt-4" />
    </View>
  );
}
