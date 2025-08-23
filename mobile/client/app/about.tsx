import { View, Text } from "react-native";
import BottomNav from "../components/BottomNav";
export default function About() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>About us</Text>
      <BottomNav></BottomNav>
    </View>
  );
}
