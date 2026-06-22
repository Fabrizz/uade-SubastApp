import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export function DevMenuButton() {
  if (!__DEV__) return null;

  if (process.env.EXPO_PUBLIC_DEV_BUTTON ?? false) return null;

  return (
    <TouchableOpacity
      className="absolute right-0 bottom-14 w-11 h-9 rounded-l-xl bg-black border-l border-t border-b border-violet-400 flex items-center justify-center z-50"
      onPress={() => router.push("/dev-menu")}
    >
      <Text className="text-violet-400 font-bold text-sm">DEV</Text>
    </TouchableOpacity>
  );
}