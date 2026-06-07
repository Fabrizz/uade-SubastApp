import { useAuth } from "@/context/auth";
import { API_BASE } from "@/lib/api";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import {
  BarChart2,
  Bell,
  BookOpen,
  Building2,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Hammer,
  Home,
  KeyRound,
  LogIn,
  LogOut,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SWAGGER_URL = "https://cly-subastapp.fabriziob.com/swagger-ui/index.html";

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
  "shield-outline": ShieldAlert,
  "key-outline": KeyRound,
} as const;

const ROUTES = [
  { name: "Auth: Login", path: "/auth/login", icon: "log-in-outline" },
  { name: "Auth: Register", path: "/auth/register", icon: "person-add-outline" },
  { name: "Auth: Activar Cuenta", path: "/auth/start", icon: "key-outline" },
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
  const { isAuthenticated, isLoading, user, token, tokenExpiration, logout } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <X size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">DEV MENU</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Auth status card */}
        <View className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <ShieldCheck size={18} color={isLoading ? "#a3a3a3" : isAuthenticated ? "#4ade80" : "#f87171"} />
            <Text className="text-white font-bold text-base ml-2">Estado de Auth</Text>
            <View
              className="ml-auto px-2 py-0.5 rounded-full"
              style={{ backgroundColor: isLoading ? "#525252" : isAuthenticated ? "#14532d" : "#450a0a" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: isLoading ? "#a3a3a3" : isAuthenticated ? "#4ade80" : "#f87171" }}
              >
                {isLoading ? "Cargando..." : isAuthenticated ? "Autenticado" : "No autenticado"}
              </Text>
            </View>
          </View>
          <View className="gap-1">
            <View className="flex-row">
              <Text className="text-neutral-500 text-xs w-20">Target</Text>
              <Text className="text-neutral-300 text-xs flex-1">{API_BASE ?? "—"}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-neutral-500 text-xs w-20">Email</Text>
              <Text className="text-neutral-300 text-xs flex-1">{user?.email ?? "—"}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-neutral-500 text-xs w-20">Categoría</Text>
              <Text className="text-neutral-300 text-xs flex-1">{user?.category ?? "—"}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-neutral-500 text-xs w-20">Token</Text>
              <Text className="text-neutral-300 text-xs flex-1" numberOfLines={1}>
                {token ? `${token.slice(0, 24)}…` : "—"}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-neutral-500 text-xs w-20">Expira</Text>
              <Text className="text-neutral-300 text-xs flex-1">
                {tokenExpiration ? tokenExpiration.toLocaleString() : "—"}
              </Text>
            </View>
          </View>
          {isAuthenticated && (
            <TouchableOpacity
              onPress={() => logout()}
              activeOpacity={0.8}
              className="flex-row items-center mt-4 pt-3 border-t border-neutral-700"
            >
              <LogOut size={14} color="#f87171" />
              <Text style={{ color: "#f87171" }} className="text-xs font-semibold ml-2">
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Swagger docs */}
        <TouchableOpacity
          onPress={() => openBrowserAsync(SWAGGER_URL, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC })}
          className="flex-row items-center bg-blue-950 border border-blue-800 p-4 rounded-xl mb-6"
          activeOpacity={0.8}
        >
          <View className="bg-blue-900 p-2 rounded-lg mr-4">
            <BookOpen size={20} color="#93c5fd" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-200 font-semibold text-base">API Docs</Text>
            <Text className="text-blue-500 text-xs mt-0.5">Swagger UI</Text>
          </View>
          <ChevronRight size={20} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { router.dismiss(); router.push("/admin"); }}
          className="flex-row items-center bg-purple-950 border border-purple-800 p-4 rounded-xl mb-6"
          activeOpacity={0.8}
        >
          <View className="bg-purple-900 p-2 rounded-lg mr-4">
            <BookOpen size={20} color="#a855f7" />
          </View>
          <View className="flex-1">
            <Text className="text-purple-200 font-semibold text-base">Panel de administración</Text>
            <Text className="text-purple-500 text-xs mt-0.5">/admin/(...)</Text>
          </View>
          <ChevronRight size={20} color="#a855f7" />
        </TouchableOpacity>

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
