import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertTriangle, ArrowLeft, Bell, Trophy, X } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: "warning", 
      title: "Multa generada", 
      description: "Tienes una multa pendiente de $5 USD por cancelación tardía.", 
      time: "Hace 2h" 
    },
    { 
      id: 2, 
      type: "success", 
      title: "¡Subasta ganada!", 
      description: "Felicidades, ganaste la subasta de Zapatillas Nike Air Max.", 
      time: "Ayer" 
    },
    { 
      id: 3, 
      type: "success", 
      title: "¡Subasta ganada!", 
      description: "Felicidades, ganaste la subasta de Reloj Premium.", 
      time: "12/04" 
    },
    { 
      id: 4, 
      type: "info", 
      title: "Nueva subasta disponible", 
      description: "Hay un nuevo artículo en tu categoría favorita: Camioneta Clásica.", 
      time: "10/04" 
    },
    { 
      id: 5, 
      type: "info", 
      title: "Recordatorio", 
      description: "Tu subasta de 'PlayStation 5' finaliza en 2 horas.", 
      time: "08/04" 
    },
  ]);

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={22} color="#f43f5e" />;
      case "success":
        return <Trophy size={22} color="#10b981" />; // Emerald para ganar
      default:
        return <Bell size={22} color="#2dd4bf" />; // El verde/turquesa principal de la app
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-rose-500/10";
      case "success":
        return "bg-emerald-500/10";
      default:
        return "bg-teal-500/10";
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e15"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120, // Espacio para el Tab Bar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Atrás y Logo */}
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

        {/* Título Principal */}
        <Text className="text-white text-3xl font-bold tracking-wide mb-6 px-2">
          Notificaciones
        </Text>

        {/* Lista de Notificaciones Estilo "App Normal" */}
        <View className="gap-3">
          {notifications.map((notif) => (
            <View 
              key={notif.id}
              className="flex-row items-start bg-[#1a1a1a] p-4 shadow-lg shadow-black/20"
              style={{ borderRadius: 20 }}
            >
              {/* Ícono de la Notificación */}
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getIconBg(notif.type)}`}>
                {getIcon(notif.type)}
              </View>

              {/* Contenido (Textos) */}
              <View className="flex-1 mt-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white font-bold text-base tracking-wide flex-1" numberOfLines={1}>
                    {notif.title}
                  </Text>
                  <Text className="text-neutral-500 text-xs font-semibold ml-2">
                    {notif.time}
                  </Text>
                </View>

                <Text className="text-neutral-400 text-sm leading-5 pr-4" numberOfLines={2}>
                  {notif.description}
                </Text>
              </View>

              {/* Botón de Eliminar (Sutil) */}
              <TouchableOpacity
                onPress={() => handleDelete(notif.id)}
                activeOpacity={0.6}
                className="mt-1 p-1 ml-1"
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={18} color="#525252" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}