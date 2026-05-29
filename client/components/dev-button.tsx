import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export function DevMenuButton() {
  if (!__DEV__) return null;

  return (
    <TouchableOpacity
      className="absolute bottom-14 right-4 w-11 h-9 rounded-2xl bg-black border border-violet-400 flex items-center justify-center z-50"
      onPress={() => router.push("/dev-menu")}
    >
      <Text className="text-violet-400 font-bold text-sm">DEV</Text>
    </TouchableOpacity>
  );
}