import { View, Text } from "react-native";
import BottomNav from "../../components/BottomNav";
import TopNav from "../../components/TopNav";

export default function Home() {
  return (
    <View className="flex-1 bg-white">
      <TopNav />
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">FixMyCity Home</Text>
      </View>
      <BottomNav />
    </View>
  );
}
