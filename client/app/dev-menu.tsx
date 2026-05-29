import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  BarChart2,
  Bell,
  Building2,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Hammer,
  Home,
  LogIn,
  PlusCircle,
  User,
  UserPlus,
  X,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ICON_MAP = {
  "log-in-outline": LogIn,
  "person-add-outline": UserPlus,
  "home-outline": Home,
  "notifications-outline": Bell,
  "hammer-outline": Hammer,
  "person-outline": User,
  "eye-outline": Eye,
  "card-outline": CreditCard,
  "add-circle-outline": PlusCircle,
  "document-text-outline": FileText,
  "business-outline": Building2,
  "stats-chart-outline": BarChart2,
  "checkmark-circle-outline": CheckCircle,
} as const;

const ROUTES = [
  { name: "Auth: Login", path: "/auth/login", icon: "log-in-outline" },
  { name: "Auth: Register", path: "/auth/register", icon: "person-add-outline" },
  { name: "Tabs: Inicio", path: "/(tabs)", icon: "home-outline" },
  { name: "Tabs: Notificaciones", path: "/(tabs)/notifications", icon: "notifications-outline" },
  { name: "Tabs: Subastas", path: "/(tabs)/auctions", icon: "hammer-outline" },
  { name: "Tabs: Perfil", path: "/profile", icon: "person-outline" },
  { name: "Perfil: Estadísticas", path: "/profile/stats", icon: "stats-chart-outline" },
  { name: "Perfil: Métodos de Pago", path: "/profile/payment", icon: "card-outline" },
  { name: "Perfil: Agregar Método", path: "/profile/payment/new", icon: "add-circle-outline" },
  { name: "Perfil: Agregar Tarjeta", path: "/profile/payment/new/add-card", icon: "add-circle-outline" },
  { name: "Perfil: Cargar Cheque", path: "/profile/payment/new/add-check", icon: "document-text-outline" },
  { name: "Perfil: Vincular Cuenta", path: "/profile/payment/new/add-bank-account", icon: "business-outline" },
  { name: "Pantalla: Detalle Subasta (Test ID: 1)", path: "/(tabs)/auctions/1", icon: "eye-outline" },
  { name: "Pantalla: Subastar Artículo", path: "/auctions/new", icon: "hammer-outline" },
  { name: "Pantalla: Subasta Aceptada", path: "/auctions/new/auction-accepted", icon: "checkmark-circle-outline" },
] satisfies { name: string; path: string; icon: keyof typeof ICON_MAP }[];

export default function DevMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <X size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Dev Menu / Sitemap</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-neutral-400 text-sm mb-6">
          Navega rápidamente a cualquier pantalla de la aplicación durante el desarrollo.
        </Text>

        {ROUTES.map((route, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => { router.dismiss(); router.push(route.path as any); }}
            className="flex-row items-center bg-neutral-900 p-4 rounded-xl mb-3 border border-neutral-800"
          >
            <View className="bg-neutral-800 p-2 rounded-lg mr-4">
              {React.createElement(ICON_MAP[route.icon], { size: 20, color: "#4ade80" })}
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">
                {route.name}
              </Text>
              <Text className="text-neutral-500 text-xs mt-1">
                {route.path}
              </Text>
            </View>
            <ChevronRight size={20} color="#555" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
