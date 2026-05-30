import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ItemDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Fallbacks if navigation params are not passed
  const title = (params.title as string) || "Item";
  const description = (params.description as string) || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu";
  const imageUri = (params.image as string) || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800";
  const shipping = (params.shipping as string) || "Geneva, Switzerland";

  const parts = shipping.split(",");
  const city = parts[0]?.trim() || "Geneva";
  const country = parts[1]?.trim() || "Switzerland";

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120, // Space for CustomTabBar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={28} color="#9102A2" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{
                shadowColor: "#d946ef",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                elevation: 10,
                backgroundColor: "transparent",
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-2xl font-bold tracking-wide">
              SubastApp
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-extrabold mb-6 px-1">
          {title}
        </Text>

        {/* Item Image */}
        <View className="mb-6 rounded-[32px] overflow-hidden shadow-2xl shadow-black/80">
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: 260 }}
            resizeMode="cover"
          />
        </View>

        {/* Description Card */}
        <View className="bg-[#181818] border border-neutral-900 p-6 mb-6 rounded-[28px]">
          <Text className="text-neutral-300 text-sm leading-6">
            {description}
          </Text>
        </View>

        {/* Shipping Location Card */}
        <View className="bg-[#181818] border border-neutral-900 p-5 rounded-[24px] flex-row items-center justify-between shadow-xl shadow-black/30">
          <View className="flex-row items-center gap-4 flex-1">
            <MapPin size={24} color="#00e5c0" />
            <View className="flex-1">
              <Text className="text-neutral-400 text-xs">
                Ships from <Text className="text-white font-bold">{city},</Text>
              </Text>
              <Text className="text-white font-bold text-sm mt-0.5">
                {country}
              </Text>
            </View>
          </View>
          
          {/* Map mini preview */}
          <View className="w-20 h-12 bg-emerald-950/20 rounded-lg overflow-hidden border border-emerald-900/30">
            <View className="flex-1 bg-[#2dd4bf]/10 items-center justify-center">
              <View className="w-4 h-4 rounded-full bg-[#2dd4bf]/20 absolute" />
              <View className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
            </View>
          </View>
        </View>

        {/* Historia Card (Conditional for Art items) */}
        {params.history && (
          <View className="bg-[#181818] border border-neutral-900 p-6 mt-6 rounded-[28px]">
            <Text className="text-white text-2xl font-bold mb-4">
              Historia
            </Text>
            <Text className="text-neutral-300 text-sm leading-6">
              {params.history as string}
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
