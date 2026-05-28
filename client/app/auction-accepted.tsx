import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Banknote, Calendar, Check, MapPin, Percent, ShieldCheck, X } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuctionAcceptedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]}
      style={{ flex: 1 }}
    >
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
        {/* Header - Atrás y Logo */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity 
            onPress={() => router.back()} 
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

          {/* Espaciador para centrar el logo correctamente */}
          <View className="w-10" />
        </View>

        {/* Título y Estado */}
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-white text-2xl font-bold tracking-wide">
            Artículos enviados
          </Text>
          <View className="px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/10 rounded-full">
            <Text className="text-emerald-400 font-extrabold text-[11px] tracking-widest uppercase">
              Aceptado
            </Text>
          </View>
        </View>

        {/* Lista de Artículos */}
        <View className="gap-6 mb-8">
          
          {/* Tarjeta Articulo 1 */}
          <View className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 shadow-xl shadow-black/40 relative overflow-hidden">
            {/* Pequeño resplandor esmeralda */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <Text className="text-white text-lg font-bold mb-4">Artículo 1</Text>
            
            <View className="gap-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                  <Calendar size={16} color="#A14EBF" />
                </View>
                <Text className="text-neutral-300 text-sm flex-1">Fecha y hora de la subasta acordada</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                    <Banknote size={16} color="#2dd4bf" />
                  </View>
                  <Text className="text-neutral-300 text-sm">Base: $1,200,000</Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                    <Percent size={16} color="#60a5fa" />
                  </View>
                  <Text className="text-neutral-300 text-sm">Comisión</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                  <MapPin size={16} color="#f43f5e" />
                </View>
                <Text className="text-neutral-300 text-sm flex-1">Lugar de la subasta</Text>
              </View>
            </View>
          </View>

          {/* Tarjeta Articulo 2 */}
          <View className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 shadow-xl shadow-black/40 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            <Text className="text-white text-lg font-bold mb-4">Artículo 2</Text>
            
            <View className="gap-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                  <Calendar size={16} color="#A14EBF" />
                </View>
                <Text className="text-neutral-300 text-sm flex-1">Fecha y hora de la subasta acordada</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                    <Banknote size={16} color="#2dd4bf" />
                  </View>
                  <Text className="text-neutral-300 text-sm">Base: $1,200,000</Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                    <Percent size={16} color="#60a5fa" />
                  </View>
                  <Text className="text-neutral-300 text-sm">Comisión</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                  <MapPin size={16} color="#f43f5e" />
                </View>
                <Text className="text-neutral-300 text-sm flex-1">Lugar de la subasta</Text>
              </View>
            </View>
          </View>

        </View>

        <View className="bg-black/60 p-5 rounded-3xl mt-4">
          {/* Póliza de Seguros */}
          <View className="flex-row items-center justify-center mb-6">
            <ShieldCheck size={20} color="#2dd4bf" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text className="text-white text-sm font-semibold tracking-wide">
              Póliza de seguros contratada
            </Text>
          </View>

          {/* Botones de Acción */}
          <View className="flex-row gap-4 mb-5">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="flex-1 bg-rose-500/10 border border-rose-500/30 flex-row items-center justify-center py-[17px]"
              style={{ borderRadius: 20 }}
            >
              <X size={20} color="#fb7185" strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text className="text-rose-400 font-bold text-lg tracking-wide">Rechazo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="flex-1 overflow-hidden shadow-lg shadow-[#9102A2]/50"
              style={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={["#A14EBF", "#9102A2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center py-[18px] flex-row"
              >
                <Check size={20} color="white" strokeWidth={3} style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg tracking-wide">Acepto</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Costo de devolución footer */}
          <Text className="text-center text-white/70 text-xs italic tracking-wider">
            El costo de devolucion es de $5 usd.
          </Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}
