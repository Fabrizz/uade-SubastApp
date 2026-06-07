import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertTriangle, ArrowLeft, Bell, Trophy, WifiOff, WifiSync, X } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWebSocket, WsNotification } from "@/context/websocket";

function formatDate(iso: string): string {
  const date = new Date(iso);
  const diffH = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (diffH < 1) return "Hace unos minutos";
  if (diffH < 24) return `Hace ${diffH}h`;
  if (diffH < 48) return "Ayer";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function getIcon(type: WsNotification["type"]) {
  switch (type) {
    case "warning": return <AlertTriangle size={22} color="#f43f5e" />;
    case "success": return <Trophy size={22} color="#10b981" />;
    case "category_update": return <Trophy size={22} color="#a78bfa" />;
    default: return <Bell size={22} color="#2dd4bf" />;
  }
}

function getIconBg(type: WsNotification["type"]) {
  switch (type) {
    case "warning": return "bg-rose-500/10";
    case "success": return "bg-emerald-500/10";
    case "category_update": return "bg-violet-500/10";
    default: return "bg-teal-500/10";
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, removeNotification, isConnected, isConnecting, connectionError } = useWebSocket();

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e15"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : null}
            className="w-10 h-10 items-center justify-center bg-black/20 rounded-full"
          >
            <ArrowLeft size={24} color="white" strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{
                shadowColor: "#d946ef",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 15,
                backgroundColor: "transparent",
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 36, height: 36, tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-wide">
              SubastApp
            </Text>
          </View>

          <View className="w-10" />
        </View>

        <View className="mb-6 px-2 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-3xl font-bold tracking-wide">
              Notificaciones
            </Text>
            <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${isConnected ? "bg-teal-500/15" : isConnecting ? "bg-neutral-800" : "bg-neutral-800"}`}>
              {isConnected
                ? <WifiSync size={13} color="#2dd4bf" strokeWidth={2.5} />
                : isConnecting
                  ? <ActivityIndicator size={13} color="#525252" />
                  : <WifiOff size={13} color="#525252" strokeWidth={2.5} />}
              <Text className={`text-xs font-semibold ${isConnected ? "text-teal-400" : "text-neutral-500"}`}>
                {isConnected ? "Conectado" : isConnecting ? "Conectando..." : "Sin conexión"}
              </Text>
            </View>
          </View>
          {connectionError && (
            <View className="flex-row items-center gap-1.5">
              <WifiOff size={11} color="#525252" strokeWidth={2} />
              <Text className="text-neutral-500 text-xs flex-1" numberOfLines={2}>
                {connectionError}
              </Text>
            </View>
          )}
        </View>

        {notifications.length === 0 ? (
          <View className="items-center justify-center py-20 gap-3">
            <Bell size={40} color="#404040" />
            <Text className="text-neutral-500 text-base font-semibold">
              No hay notificaciones
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {notifications.map((notif) => (
              <View
                key={notif.id}
                className="flex-row items-start bg-[#1a1a1a] p-4 shadow-lg shadow-black/20"
                style={{ borderRadius: 20 }}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </View>

                <View className="flex-1 mt-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-bold text-base tracking-wide flex-1" numberOfLines={1}>
                      {notif.title}
                    </Text>
                    <Text className="text-neutral-500 text-xs font-semibold ml-2">
                      {formatDate(notif.createdAt)}
                    </Text>
                  </View>
                  <Text className="text-neutral-400 text-sm leading-5 pr-4" numberOfLines={2}>
                    {notif.description}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeNotification(notif.id)}
                  activeOpacity={0.6}
                  className="mt-1 p-1 ml-1"
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <X size={18} color="#525252" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
