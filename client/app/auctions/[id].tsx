import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, MapPin } from "lucide-react-native";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock data for the view
  const item = {
    title: "Nombre de subasta",
    subtitle: "Objeto/s a Subastar",
    tier: "ORO",
    dateLocation: "4/11/2026 - GENEVA SWITZELANSD",
    image: { uri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800" },
    startTime: "14:00hs",
    endTime: "14:00hs",
    basePrice: "$14,250.00",
    items: [
      "Item X - Descripcion",
      "Item Arte X- Descripcion",
      "Item X - Descripcion",
      "Item X - Descripcion",
    ],
    owner: "Tomas Arteach (Owner)",
    shipping: "Geneva,\nSwitzerland",
  };

  return (
    <View className="flex-1 bg-[#1c1c1c]">
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 20),
          paddingBottom: Math.max(insets.bottom, 20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Logo + LIVE badge */}
        <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-1">
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            {/* Glow effect container */}
            <View className="items-center justify-center p-1">
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-xl tracking-wide ml-1 font-montserrat-bold">
              SubastApp
            </Text>
          </View>
          <View className="bg-red-800 px-4 py-1.5 rounded-xl">
            <Text className="text-white text-xs tracking-widest font-manrope-bold">
              LIVE
            </Text>
          </View>
        </View>

        {/* Title Section */}
        <View className="px-4 mb-4">
          <Text className="text-white text-3xl mb-1 font-montserrat-bold">
            {item.title}
          </Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-white text-base font-manrope-semibold">
              {item.subtitle}
            </Text>
            <Text className="text-[#b8860b] text-2xl font-montserrat-extrabold">{item.tier}</Text>
          </View>
          <Text className="text-fuchsia-500 text-[10px] tracking-widest uppercase font-manrope-bold">
            {item.dateLocation}
          </Text>
        </View>

        {/* Image */}
        <View className="px-4 mb-5">
          <Image
            source={item.image}
            style={{ width: "100%", height: 250, borderRadius: 24 }}
            resizeMode="cover"
          />
        </View>

        {/* Action Row: Inicio | Unirse | Fin */}
        <View className="flex-row justify-between items-center px-4 mb-6">
          <View className="bg-[#a800c2] px-3 py-2.5 rounded-2xl items-center flex-1 mr-3">
            <Text className="text-white text-xs mb-0.5 font-manrope-bold">Inicio</Text>
            <Text className="text-white text-xs font-manrope-bold">{item.startTime}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-[2] mr-3 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={["#4ade80", "#2dd4bf"]} // Green to teal gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3.5 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="hammer-outline" size={20} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
              <Text className="text-white text-lg font-manrope-bold">Unirse</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View className="bg-[#a800c2] px-3 py-2.5 rounded-2xl items-center flex-1">
            <Text className="text-white text-xs mb-0.5 font-manrope-bold">Fin</Text>
            <Text className="text-white text-xs font-manrope-bold">{item.endTime}</Text>
          </View>
        </View>

        {/* Base Price Card */}
        <View className="px-4 mb-4">
          <View className="border border-neutral-800 rounded-3xl p-5 bg-[#151515]">
            <View className="items-end">
              <Text className="text-white text-xs mb-1 font-manrope-bold">
                Precio Base
              </Text>
              <Text className="text-[#d946ef] text-4xl mb-3 font-montserrat-extrabold">
                {item.basePrice}
              </Text>
              <View className="bg-[#4ade80] px-3 py-1 rounded-full">
                <Text className="text-[#0f3330] text-[10px] tracking-widest font-manrope-bold">
                  COMIENZA PRONTO
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items List Card */}
        <View className="px-4 mb-6">
          <View className="border border-neutral-800 rounded-3xl p-2 bg-[#151515]">
            {item.items.map((desc, idx) => (
              <View
                key={idx}
                className={`flex-row justify-between items-center p-4 ${
                  idx !== item.items.length - 1 ? "border-b border-neutral-800" : ""
                }`}
              >
                <Text className="text-neutral-300 text-sm font-manrope-medium">{desc}</Text>
                <Ionicons name="information-circle-outline" size={22} color="#4ade80" />
              </View>
            ))}
          </View>
        </View>
        {/* Bottom Cards */}
        <View className="px-4 mt-2">
          {/* Shipping Card */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center justify-between mb-3 border border-neutral-800 shadow-xl shadow-black">
            <View className="flex-row items-center gap-3 flex-1">
              <MapPin size={24} color="#4ade80" />
              <View>
                <Text className="text-neutral-400 text-xs font-manrope">Ships from</Text>
                <Text className="text-white font-manrope-bold">{item.shipping.replace("\n", " ")}</Text>
              </View>
            </View>
            <View className="w-16 h-10 bg-neutral-700 rounded-lg overflow-hidden">
               {/* Mock map thumbnail */}
               <View className="flex-1 bg-[#4ade80]/20 border border-[#4ade80]/30" />
            </View>
          </View>

          {/* Owner Card */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center gap-3 border border-neutral-800 shadow-xl shadow-black">
            <FileText size={24} color="#4ade80" />
            <Text className="text-neutral-300 text-sm font-manrope-medium">{item.owner}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
