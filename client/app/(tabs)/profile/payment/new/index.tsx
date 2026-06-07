import { useAuth } from "@/context/auth";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Building2, ChevronLeft, ChevronRight, CreditCard, FileCheck } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const METHODS = [
  {
    id: "card",
    label: "Tarjeta de crédito",
    description: "Visa, Mastercard, Amex — nacional o internacional",
    route: "/profile/payment/new/add-card" as const,
    Icon: CreditCard,
  },
  {
    id: "check",
    label: "Cheque certificado",
    description: "Cheque bancario certificado en pesos o dólares",
    route: "/profile/payment/new/add-check" as const,
    Icon: FileCheck,
  },
  {
    id: "bank",
    label: "Cuenta bancaria",
    description: "CBU / IBAN local o cuenta bancaria del exterior",
    route: "/profile/payment/new/add-bank-account" as const,
    Icon: Building2,
  },
];

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const { hasPaymentMethod } = useAuth();

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button row */}
          <View className="h-14 justify-center">
            {hasPaymentMethod !== false && (
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center"
              >
                <ChevronLeft size={28} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>

          {/* Centered logo */}
          <View className="items-center mb-10 mt-2">
            <View
              style={{
                shadowColor: "#d946ef",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 72, height: 72, marginBottom: 14 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontFamily: "Montserrat-Bold", color: "white", fontSize: 32, letterSpacing: 1 }}>
              SubastApp
            </Text>
          </View>

          {/* Card */}
          <View className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 pt-8 pb-10 w-full">
            <Text className="text-white text-2xl font-bold mb-2">
              Método de pago
            </Text>
            <Text className="text-neutral-400 text-sm leading-5 mb-8">
              {hasPaymentMethod === false
                ? "Para participar en subastas necesitás registrar al menos un método de pago."
                : "Seleccioná el tipo de método de pago que querés agregar."}
            </Text>

            <View className="gap-3">
              {METHODS.map(({ id, label, description, route, Icon }) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => router.push(route)}
                  activeOpacity={0.7}
                  className="flex-row items-center bg-neutral-800 border border-neutral-700 rounded-2xl p-4 gap-4"
                >
                  <View className="w-12 h-12 rounded-xl bg-neutral-700 items-center justify-center">
                    <Icon size={24} color="#a78bfa" strokeWidth={1.8} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base mb-0.5">
                      {label}
                    </Text>
                    <Text className="text-neutral-400 text-xs leading-4">
                      {description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#737373" strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
