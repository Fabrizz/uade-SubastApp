import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { AlertTriangle, Bell, Trophy, WifiOff, WifiSync, X } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

import HeaderComp from "@/components/HeaderComp";
import ScrollViewPad from "@/components/ui/ScrollViewPad";
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
  const { notifications, removeNotification, isConnected, isConnecting, connectionError } = useWebSocket();

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e15"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <HeaderComp />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-montserrat-bold">
            Notificaciones
          </Text>
          <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${isConnected ? "bg-emerald-500/15" : isConnecting ? "bg-neutral-800" : "bg-neutral-800"}`}>
            {isConnected
              ? <WifiSync size={13} color="#2dd4bf" strokeWidth={2.5} />
              : isConnecting
                ? <ActivityIndicator size={13} color="#34d399" />
                : <WifiOff size={13} color="#525252" strokeWidth={2.5} />}
            <Text className={`text-xs font-semibold ${isConnected ? "text-emerald-400" : "text-neutral-500"}`}>
              {isConnected ? "Conectado" : isConnecting ? "Conectando..." : "Sin conexión"}
            </Text>
          </View>
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

        <ScrollViewPad />
      </ScrollView>
    </LinearGradient>
  );
}
