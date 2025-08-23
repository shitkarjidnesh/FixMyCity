import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function TopNav() {
  const router = useRouter();
  return (
    <View className="flex-row justify-between items-center p-4 bg-blue-500">
      <Text className="text-white text-xl font-bold">FixMyCity</Text>
      <TouchableOpacity onPress={() => router.push("/home/profile")}>
        <Text className="text-white text-lg">☰</Text>
      </TouchableOpacity>
    </View>
  );
}
