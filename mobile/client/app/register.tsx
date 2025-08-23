import { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    // Mock register
    router.replace("/login");
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-100">
      <Text className="text-2xl font-bold mb-6 text-center">Register</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="border p-2 mb-3 rounded"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border p-2 mb-3 rounded"
      />
      <Button title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="mt-4 text-blue-600 text-center">Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
