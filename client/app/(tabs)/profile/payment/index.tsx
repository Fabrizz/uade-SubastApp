import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, CreditCard, Plus } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

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
            <ChevronLeft size={24} color="white" />
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
              <View className="w-10 h-10 rounded-xl bg-[#383838] border border-[#555555] items-center justify-center mr-4">
                <CreditCard size={20} color="#00c9b1" />
              </View>
              <Text className="text-white font-bold text-lg flex-1">
                {method.name}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Button
                label="Eliminar"
                onPress={() => {}}
                activeOpacity={0.7}
                className="flex-[0.4] bg-[#383838] border border-[#555555]"
                textClassName="text-neutral-300"
                innerClassName="px-4 py-3.5"
              />
              <Button
                label="Modificar"
                onPress={() => {}}
                colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
                className="flex-[0.6]"
                textClassName="text-black"
                innerClassName="px-4 py-3.5"
              />
            </View>
          </View>
        ))}

        <View className="h-6" />

        <Button
          label="Agregar Método"
          onPress={() => router.push('/profile/payment/new')}
          colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
          className="w-full mb-5"
          textClassName="text-black text-base"
          innerClassName="px-6 py-4"
          icon={<Plus size={20} color="#000" strokeWidth={2.5} />}
        />
      </ScrollView>
    </LinearGradient>
  );
}
