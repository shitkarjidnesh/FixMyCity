// import { useState } from "react";
// import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// // for Android Emulator -> use 10.0.2.2
// // for iOS Simulator -> use localhost
// // for real device -> use your LAN IP (e.g., 192.168.x.x)

// const API_URL = "http://10.0.2.2:5000/api/auth";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();

//   const handleLogin = async () => {
//     if (email && password) {
//       await AsyncStorage.setItem("token", "dummy-auth-token");
//       router.replace("/home");
//     }
//   };

//   return (
//     <View className="flex-1 justify-center px-6 bg-gray-100">
//       <Text className="text-2xl font-bold mb-6 text-center">Login</Text>
//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         className="border p-2 mb-3 rounded"
//       />
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//         className="border p-2 mb-3 rounded"
//       />
//       <Button title="Login" onPress={handleLogin} />
//       <TouchableOpacity onPress={() => router.push("/register")}>
//         <Text className="mt-4 text-blue-600 text-center">
//           New user? Register here
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }





import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import BottomNav from "../components/BottomNav";
import TopNav from "../components/TopNav";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const res = await axios.post("http://10.0.2.2:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
        router.replace("/home"); // Navigate to home screen
      } else {
        Alert.alert("Login Failed", "Invalid response from server");
      }
    } catch (error: any) {
      Alert.alert(
        "Login Error",
        error.response?.data?.msg || "Something went wrong"
      );
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-100">
     <TopNav></TopNav>
      <Text className="text-2xl font-bold mb-6 text-center">Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="border p-2 mb-3 rounded bg-white"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border p-2 mb-3 rounded bg-white"
      />

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text className="mt-4 text-blue-600 text-center">
          New user? Register here
        </Text>
      </TouchableOpacity>
      <BottomNav></BottomNav>
    </View>
  );
}





