import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, ChevronLeft, Grip, Landmark, Square, User } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

export default function AddBankAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cbu, setCbu] = useState("");
  const [accountType, setAccountType] = useState<"ahorro" | "corriente">("corriente");
  const [isExterior, setIsExterior] = useState(false);

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
            <View className="w-10 h-10 items-center justify-center">
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

        {/* Main Card Container */}
        <View 
          className="bg-neutral-900 border border-neutral-800 p-6 pt-8 pb-8 w-full"
          style={{ borderRadius: 32 }}
        >
          {/* Títulos Principales */}
          <View className="mb-8">
            <Text className="text-white text-3xl font-bold mb-3 tracking-wide">
              Vincular Cuenta Bancaria
            </Text>
            <Text className="text-neutral-200 text-sm leading-5 pr-2">
              Completa los datos de tu cuenta para realizar transferencias y pagos directos.
            </Text>
          </View>

          {/* Forms */}
          <View className="gap-5">
            {/* Nombre del Banco */}
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Nombre del Banco
              </Text>
              <View 
                className="flex-row items-center h-[50px] bg-[#383838] border border-[#555555] px-4"
                style={{ borderRadius: 12 }}
              >
                <Landmark size={20} color="#737373" strokeWidth={2} style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-white text-base h-full"
                  placeholder="Ej: Banco Central"
                  placeholderTextColor="#a3a3a3"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>
            </View>

            {/* Nombre del Titular */}
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Nombre del Titular
              </Text>
              <View 
                className="flex-row items-center h-[50px] bg-[#383838] border border-[#555555] px-4"
                style={{ borderRadius: 12 }}
              >
                <User size={20} color="#737373" strokeWidth={2} style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-white text-base h-full"
                  placeholder="Como figura en tu DNI"
                  placeholderTextColor="#a3a3a3"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>
            </View>

            {/* Número de Cuenta (CBU/CVU) */}
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Número de Cuenta (CBU/CVU)
              </Text>
              <View 
                className="flex-row items-center h-[50px] bg-[#383838] border border-[#555555] px-4"
                style={{ borderRadius: 12 }}
              >
                <Grip size={20} color="#737373" strokeWidth={2} style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-white text-base h-full"
                  placeholder="22 dígitos"
                  placeholderTextColor="#a3a3a3"
                  keyboardType="numeric"
                  maxLength={22}
                  value={cbu}
                  onChangeText={setCbu}
                />
              </View>
              <Text className="text-neutral-350 text-[10px] mt-1.5 ml-1">
                Ingresa el código de 22 dígitos de tu cuenta bancaria o billetera virtual.
              </Text>
            </View>

            {/* Tipo de Cuenta */}
            <View className="mb-2">
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Tipo de Cuenta
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setAccountType("ahorro")}
                  className={`flex-1 items-center justify-center py-3.5 rounded-xl border ${
                    accountType === "ahorro" 
                      ? "bg-white border-white" 
                      : "bg-[#383838] border-[#555555]"
                  }`}
                >
                  <Text 
                    className={`font-bold text-sm ${
                      accountType === "ahorro" ? "text-black" : "text-neutral-400"
                    }`}
                  >
                    Caja de Ahorros
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setAccountType("corriente")}
                  className={`flex-1 items-center justify-center py-3.5 rounded-xl border ${
                    accountType === "corriente" 
                      ? "bg-white border-white" 
                      : "bg-[#383838] border-[#555555]"
                  }`}
                >
                  <Text 
                    className={`font-bold text-sm ${
                      accountType === "corriente" ? "text-black" : "text-neutral-400"
                    }`}
                  >
                    Cuenta Corriente
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label="Exterior"
              onPress={() => setIsExterior(!isExterior)}
              colors={["#A14EBF", "#9102A2"]}
              className="mt-4 w-full rounded-full"
              textClassName="text-white text-lg"
              innerClassName="py-4 px-6"
              rightIcon={
                isExterior ? (
                  <View className="w-6 h-6 bg-white rounded border border-white items-center justify-center">
                    <Check size={18} color="#9102A2" />
                  </View>
                ) : (
                  <Square size={24} color="white" strokeWidth={2.5} />
                )
              }
            />

            <Button
              label="Vincular Cuenta"
              onPress={() => router.back()}
              colors={["#A14EBF", "#9102A2"]}
              className="mt-2 w-full rounded-full"
              textClassName="text-white text-lg"
              innerClassName="py-4"
            />

          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}
