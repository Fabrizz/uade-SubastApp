import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuctionVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#171717", "#0f766e", "#2dd4bf"]}
      locations={[0, 0.6, 1]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false, presentation: "fullScreenModal" }} />
      <StatusBar style="light" />
      
      <View style={{ flex: 1 }}>
        {/* Header - Logo Glowing Fijo Arriba */}
        <View 
          className="absolute w-full items-center z-10"
          style={{ top: insets.top + 40 }}
        >
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
                style={{ width: 40, height: 40, tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-wide">
              SubastApp
            </Text>
          </View>
        </View>

        {/* Contenedor de la Tarjeta Centrada */}
        <View className="flex-1 justify-center px-6 pt-16">
          <View 
            className="bg-black p-8 w-full shadow-2xl shadow-black/50"
            style={{ borderRadius: 32 }}
          >
            <Text className="text-white text-2xl font-bold tracking-wide leading-8 mb-8">
              Estamos verificando su solicitud de subasta.
            </Text>

            <Text className="text-neutral-300 text-sm leading-6 mb-12">
              Nuestro equipo esta verificando su solicitud de subasta, este proceso puede tomar hasta una semana, lo notificaremos por mail cuando haya sido realizado, gracias
            </Text>

            {/* Volver Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="bg-[#A14EBF] flex-row items-center p-4 px-6"
              style={{ borderRadius: 20 }}
            >
              <ArrowLeft size={24} color="white" strokeWidth={2.5} style={{ marginRight: 12 }} />
              <Text className="flex-1 text-center text-white font-bold text-lg tracking-wide pr-8">
                Volver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
