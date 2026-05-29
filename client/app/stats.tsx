import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Banknote, Gavel, Star, Trophy } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#121212]">
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 40,
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
            <ArrowLeft size={28} color="#A14EBF" strokeWidth={2.5} />
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
                style={{ width: 32, height: 32, tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-2xl font-bold tracking-wide">
              SubastApp
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Tarjeta Principal */}
        <View 
          className="bg-neutral-900 border border-neutral-800 p-6 w-full mb-6 relative overflow-hidden"
          style={{ borderRadius: 32 }}
        >
          {/* Subtle gradient glow in background */}
          <LinearGradient
            colors={["rgba(161, 78, 191, 0.15)", "transparent"]}
            className="absolute top-0 right-0 left-0 bottom-0"
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          <Text className="text-white text-3xl font-extrabold mb-3 tracking-wide">
            Tus Estadísticas
          </Text>
          <Text className="text-neutral-400 text-sm mb-6 leading-5 pr-8">
            Tu resumen detallado de actividad en subastas de alta precisión.
          </Text>
          <View className="self-start bg-[#A14EBF] px-4 py-2" style={{ borderRadius: 12 }}>
            <Text className="text-white font-bold text-xs tracking-wider">
              Actualizado hoy
            </Text>
          </View>
        </View>

        {/* Tasa de Éxito */}
        <View 
          className="bg-neutral-900 border border-neutral-800 p-6 w-full mb-6 flex-row items-center justify-between"
          style={{ borderRadius: 24 }}
        >
          <View>
            <Text className="text-neutral-400 text-xs font-bold tracking-wider uppercase mb-1">
              Tasa de éxito
            </Text>
            <Text className="text-[#2dd4bf] text-4xl font-black">
              68%
            </Text>
          </View>

          {/* Target Icon */}
          <View 
            className="w-16 h-16 rounded-full border-[6px] border-[#2dd4bf] items-center justify-center bg-black"
          >
            <View className="w-8 h-8 rounded-full bg-[#115e59] items-center justify-center">
               <Star size={14} color="#2dd4bf" strokeWidth={3} />
            </View>
          </View>
        </View>

        {/* Participadas & Ganadas Row */}
        <View className="flex-row gap-4 mb-6">
          <View 
            className="flex-1 bg-neutral-900 border border-neutral-800 p-5"
            style={{ borderRadius: 24 }}
          >
            <View className="w-10 h-10 rounded-xl bg-[#1e293b] items-center justify-center mb-4">
              <Gavel size={20} color="#60a5fa" strokeWidth={2} style={{ transform: [{ scaleX: -1 }] }} />
            </View>
            <Text className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase mb-1">
              Participadas
            </Text>
            <Text className="text-white text-2xl font-black">
              124
            </Text>
          </View>

          <View 
            className="flex-1 bg-neutral-900 border border-neutral-800 p-5"
            style={{ borderRadius: 24 }}
          >
            <View className="w-10 h-10 rounded-xl bg-[#115e59] items-center justify-center mb-4">
              <Trophy size={20} color="#2dd4bf" strokeWidth={2} />
            </View>
            <Text className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase mb-1">
              Ganadas
            </Text>
            <Text className="text-white text-2xl font-black">
              84
            </Text>
          </View>
        </View>

        {/* Total pujado */}
        <View 
          className="bg-neutral-900 border border-neutral-800 p-6 w-full mb-6"
          style={{ borderRadius: 24 }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-neutral-400 text-[11px] font-bold tracking-wider uppercase">
              Total pujado
            </Text>
            <Banknote size={20} color="#475569" strokeWidth={2} />
          </View>
          
          <Text className="text-[#93c5fd] text-3xl font-black mb-5">
            €45,280.00
          </Text>

          {/* Progress Bar */}
          <View className="h-2 w-full bg-neutral-800 rounded-full flex-row">
            <View className="h-full bg-[#60a5fa] rounded-full" style={{ width: '75%' }} />
          </View>
        </View>

        {/* Ahorro Total (Tarjeta semi-visible en el mockup original si se sube) */}
        <View 
          className="bg-[#A14EBF] p-6 w-full mb-8 relative overflow-hidden"
          style={{ borderRadius: 24 }}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.2)", "transparent"]}
            className="absolute top-0 right-0 left-0 bottom-0"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text className="text-white/80 text-[11px] font-bold tracking-wider uppercase mb-1">
            Ahorro total estimado
          </Text>
          <Text className="text-white text-3xl font-black">
            €12,450.00
          </Text>
        </View>

        {/* Actividad Mensual Chart */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4 px-1">
            <Text className="text-white text-lg font-bold tracking-wide">
              Actividad Mensual
            </Text>
            <TouchableOpacity>
              <Text className="text-[#A14EBF] text-xs font-bold">
                Ver detalle
              </Text>
            </TouchableOpacity>
          </View>

          <View 
            className="bg-neutral-900 border border-neutral-800 w-full h-40 flex-row items-end justify-between px-4 pb-0 pt-6 overflow-hidden"
            style={{ borderRadius: 24 }}
          >
            {/* Barras del gráfico simuladas */}
            <View className="w-[12%] bg-[#1a1a1a] rounded-t-lg" style={{ height: '20%' }} />
            <View className="w-[12%] bg-[#262626] rounded-t-lg" style={{ height: '35%' }} />
            <View className="w-[12%] bg-[#2dd4bf] rounded-t-lg" style={{ height: '65%' }} />
            <View className="w-[12%] bg-[#4c1d95] rounded-t-lg" style={{ height: '40%' }} />
            <View className="w-[12%] bg-[#d946ef] rounded-t-lg" style={{ height: '90%' }} />
            <View className="w-[12%] bg-[#1a1a1a] rounded-t-lg" style={{ height: '15%' }} />
            <View className="w-[12%] bg-[#262626] rounded-t-lg" style={{ height: '45%' }} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
