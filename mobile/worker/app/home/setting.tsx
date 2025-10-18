import { View, Text } from "react-native";
import React from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

export default function setting() {
  return (
    <AuthGuard>
      <TopNav />
      <View>
        <Text>setting</Text>
      </View>
      <BottomNav />
    </AuthGuard>
  );
}
