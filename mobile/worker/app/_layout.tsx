import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // hides default header
        animation: "slide_from_right", // nice smooth transition
      }}
    />
  );
}
