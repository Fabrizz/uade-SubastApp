import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, ChevronLeft } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      // Intermedio: Inicia negro profundo (estilo login) y termina en el turquesa (estilo mockup)
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]} 
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-10 px-2">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={28} color="white" strokeWidth={2.5} />
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

        {/* Contenedor central para alinear la tarjeta verticalmente */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
          {/* Card ajustada a su contenido */}
          <View className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 pt-8 pb-10 w-full">
            <Text className="text-white text-2xl font-bold mb-8 text-center">
              Agregar Metodo
            </Text>

            <View className="items-center gap-4">
              {[
                { id: "card", label: "Tarjeta", route: "/add-card" as const },
                { id: "check", label: "Cheque", route: "/add-check" as const },
                { id: "bank", label: "Cuenta bancaria", route: "/add-bank-account" as const },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  activeOpacity={0.8}
                  onPress={() => method.route && router.push(method.route)}
                  className="rounded-2xl overflow-hidden shadow-lg shadow-[#AF2BBF]/20 w-64"
                >
                  <LinearGradient
                    // Gradiente morado que sigue la forma del mockup pero con la vibra del Login
                    colors={["#A14EBF", "#9102A2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-between py-3.5 px-6"
                  >
                    <Text className="text-white font-bold text-base">
                      {method.label}
                    </Text>
                    <ArrowRight size={20} color="white" strokeWidth={2.5} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}
