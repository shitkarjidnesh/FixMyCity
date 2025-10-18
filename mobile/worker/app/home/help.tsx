import { View, Text } from "react-native";
import React from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

export default function help() {
  return (
    <AuthGuard>
      <TopNav />
      <View>
        <Text>help</Text>
      </View>
      <BottomNav />
    </AuthGuard>
  );
}
