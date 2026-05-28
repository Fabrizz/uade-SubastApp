import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROUTES = [
  { name: "Auth: Login", path: "/auth/login", icon: "log-in-outline" },
  { name: "Auth: Register", path: "/auth/register", icon: "person-add-outline" },
  { name: "Tabs: Inicio", path: "/(tabs)", icon: "home-outline" },
  { name: "Tabs: Notificaciones", path: "/(tabs)/notifications", icon: "notifications-outline" },
  { name: "Tabs: Subastas", path: "/(tabs)/auctions", icon: "hammer-outline" },
  { name: "Tabs: Perfil", path: "/(tabs)/profile", icon: "person-outline" },
  { name: "Pantalla: Detalle Subasta (Test ID: 1)", path: "/(tabs)/auctions/1", icon: "eye-outline" },
  { name: "Pantalla: Métodos de Pago", path: "/payment-methods", icon: "card-outline" },
];

export default function DevMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Dev Menu / Sitemap</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-neutral-400 text-sm mb-6">
          Navega rápidamente a cualquier pantalla de la aplicación durante el desarrollo.
        </Text>

        {ROUTES.map((route, index) => (
          <Link href={route.path as any} asChild key={index}>
            <TouchableOpacity className="flex-row items-center bg-neutral-900 p-4 rounded-xl mb-3 border border-neutral-800">
              <View className="bg-neutral-800 p-2 rounded-lg mr-4">
                <Ionicons name={route.icon as any} size={20} color="#4ade80" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {route.name}
                </Text>
                <Text className="text-neutral-500 text-xs mt-1">
                  {route.path}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
