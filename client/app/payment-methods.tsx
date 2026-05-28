import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CreditCard, Plus } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOCK_METHODS = [
  { id: "1", name: "Visa terminada en 4242", type: "visa" },
  { id: "2", name: "MasterCard terminada en 1234", type: "mastercard" },
  { id: "3", name: "Mercado Pago", type: "wallet" },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#000000", "#3f0146", "#9102A2"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header */}
        <View className="flex-row items-center justify-between mb-10">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
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

        <Text className="text-white text-3xl font-bold tracking-wide mb-8">
          Métodos de pago
        </Text>

        {/* Lista de métodos - Login Card Aesthetic */}
        {MOCK_METHODS.map((method) => (
          <View 
            key={method.id} 
            className="mb-5 p-6 rounded-2xl bg-neutral-900 w-full"
          >
            <View className="flex-row items-center mb-5">
              <View className="w-10 h-10 rounded-xl bg-[#262626] border border-[#404040] items-center justify-center mr-4">
                <CreditCard size={20} color="#00c9b1" />
              </View>
              <Text className="text-white font-bold text-lg flex-1">
                {method.name}
              </Text>
            </View>

            <View className="flex-row gap-3">
              {/* Botón Eliminar - Secondary Action */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-[0.4] rounded-xl overflow-hidden"
              >
                <View className="bg-[#262626] border border-[#404040] py-3.5 items-center justify-center rounded-xl">
                  <Text className="text-neutral-300 font-bold text-sm">Eliminar</Text>
                </View>
              </TouchableOpacity>

              {/* Botón Modificar - Primary Action */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-[0.6] rounded-xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3.5 items-center justify-center"
                >
                  <Text className="text-black font-bold text-sm">
                    Modificar
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View className="h-6" />

        {/* Botón Agregar Metodo - Full Width Login Style */}
        <TouchableOpacity
          onPress={() => router.push('/add-payment-method')}
          activeOpacity={0.85}
          style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, width: "100%" }}
        >
          <LinearGradient
            colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 }}
          >
            <Plus size={20} color="#000" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
              Agregar Método
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
