import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, ChevronLeft, Square, Wifi } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isExterior, setIsExterior] = useState(false);

  // Formatear visualmente el número de tarjeta (ej: 1234 5678 1234 5678)
  const displayCardNumber = cardNumber.padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();
  const displayCardName = cardName.toUpperCase() || "•••••••• ••••••••";
  const displayExpiry = expiry.padEnd(4, "•").replace(/(.{2})(.{2})/, "$1/$2");

  // Detectar marca de la tarjeta
  let cardBrand = "TARJETA";
  if (cardNumber.startsWith("4")) cardBrand = "VISA";
  else if (cardNumber.startsWith("5")) cardBrand = "MASTERCARD";
  else if (cardNumber.startsWith("3")) cardBrand = "AMEX";

  return (
    <LinearGradient
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
        <View className="flex-row items-center justify-between mb-8 px-2">
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

        {/* Main Card Container */}
        <View 
          className="bg-neutral-900 border border-neutral-800 p-6 pt-8 pb-8 w-full"
          style={{ borderRadius: 32 }}
        >
          <Text className="text-white text-2xl font-bold mb-2">
            Metodo de pago
          </Text>
          <Text className="text-neutral-400 text-sm mb-8 leading-5 pr-4">
            Agregue una tarjeta para participar en subastas activas.
          </Text>

          {/* Visual Credit Card */}
          <LinearGradient
            colors={["#A14EBF", "#6C91BF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 mb-8 w-full h-48 justify-between shadow-2xl shadow-[#A14EBF]/30"
            style={{ borderRadius: 24 }}
          >
            <View className="flex-row justify-between items-start">
              <View className="w-10 h-10 items-center justify-center">
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 32, height: 32, tintColor: "white" }}
                  resizeMode="contain"
                />
              </View>
              <View className="items-end">
                <Text className="text-white/80 text-[10px] tracking-widest font-semibold mb-1">
                  PLATINUM CURATOR
                </Text>
                <Text className="text-white text-2xl font-extrabold tracking-wider">
                  {cardBrand}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-white text-xl tracking-[4px] font-bold mb-4">
                {displayCardNumber}
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-white/70 text-[10px] tracking-wider font-semibold mb-1">
                    NOMBRE DEL TITULAR
                  </Text>
                  <Text className="text-white font-bold text-sm tracking-widest uppercase">
                    {displayCardName}
                  </Text>
                </View>
                <View>
                  <Text className="text-white/70 text-[10px] tracking-wider font-semibold mb-1 text-right">
                    EXPIRA
                  </Text>
                  <Text className="text-white font-bold text-sm tracking-widest text-right">
                    {displayExpiry}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Forms */}
          <View className="gap-5">
            {/* Numero de Tarjeta */}
            <View>
              <Text className="text-white text-xs font-semibold mb-2 ml-1">
                Numero de Tarjeta
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 16 }}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#737373"
                keyboardType="numeric"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
              />
            </View>

            {/* Titular de la tarjeta */}
            <View>
              <Text className="text-white text-xs font-semibold mb-2 ml-1">
                Titular de la tarjeta
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 16 }}
                placeholder="••••••••"
                placeholderTextColor="#737373"
                autoCapitalize="characters"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            {/* Expiracion y CVV */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-white text-xs font-semibold mb-2 ml-1">
                  Expiracion
                </Text>
                <TextInput
                  className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                  style={{ borderRadius: 16 }}
                  placeholder="MM/AA"
                  placeholderTextColor="#737373"
                  keyboardType="numeric"
                  maxLength={4}
                  value={expiry}
                  onChangeText={setExpiry}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xs font-semibold mb-2 ml-1">
                  CVV
                </Text>
                <TextInput
                  className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                  style={{ borderRadius: 16 }}
                  placeholder="•••"
                  placeholderTextColor="#737373"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>

            {/* Boton Exterior */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsExterior(!isExterior)}
              className="mt-2 overflow-hidden"
              style={{ borderRadius: 9999 }}
            >
              <LinearGradient
                colors={["#A14EBF", "#9102A2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-between p-4 px-6"
              >
                <Text className="text-white font-bold text-lg">Exterior</Text>
                {isExterior ? (
                  <View className="w-6 h-6 bg-white rounded border border-white items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="#9102A2" />
                  </View>
                ) : (
                  <Square size={24} color="white" strokeWidth={2.5} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Guardar Tarjeta */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()} // Simular guardado volviendo atrás
              className="mt-2 overflow-hidden"
              style={{ borderRadius: 9999 }}
            >
              <LinearGradient
                colors={["#A14EBF", "#9102A2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-between p-4 px-6"
              >
                <Text className="text-white font-bold text-lg">Guardar Tarjeta</Text>
                <ArrowRight size={24} color="white" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}
