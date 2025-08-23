// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }


import { Stack } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="home/index" />
    </Stack>
  );
}
