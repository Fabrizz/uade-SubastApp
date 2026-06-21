import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, ChevronLeft, Grip, Landmark, Square, User } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function isValidCBU(cbu: string): boolean {
  if (!/^\d{22}$/.test(cbu)) return false;

  // Bloque 1: primeros 8 dígitos (0 al 7)
  // El dígito verificador está en el índice 7
  const b = cbu.substring(0, 7).split("").map(Number);
  const d1 = parseInt(cbu.charAt(7), 10);
  const sum1 = b[0] * 7 + b[1] * 1 + b[2] * 3 + b[3] * 9 + b[4] * 7 + b[5] * 1 + b[6] * 3;
  const diff1 = 10 - (sum1 % 10);
  const expectedD1 = diff1 === 10 ? 0 : diff1;
  if (d1 !== expectedD1) return false;

  // Bloque 2: siguientes 14 dígitos (8 al 21)
  // El dígito verificador está en el índice 21
  const c = cbu.substring(8, 21).split("").map(Number);
  const d2 = parseInt(cbu.charAt(21), 10);
  const sum2 = c[0] * 3 + c[1] * 9 + c[2] * 7 + c[3] * 1 + c[4] * 3 + c[5] * 9 + c[6] * 7 + c[7] * 1 + c[8] * 3 + c[9] * 9 + c[10] * 7 + c[11] * 1 + c[12] * 3;
  const diff2 = 10 - (sum2 % 10);
  const expectedD2 = diff2 === 10 ? 0 : diff2;
  if (d2 !== expectedD2) return false;

  return true;
}

const BANK_CODES: Record<string, string> = {
  "005": "Banco Nación",
  "007": "Banco Galicia",
  "011": "Banco Nación",
  "014": "Banco Provincia",
  "015": "ICBC",
  "016": "Citibank",
  "017": "BBVA",
  "020": "Banco de Córdoba",
  "027": "Banco Supervielle",
  "029": "Banco Ciudad",
  "034": "Banco Patagonia",
  "044": "Banco Hipotecario",
  "072": "Banco Santander",
  "150": "HSBC",
  "191": "Banco Credicoop",
  "259": "Banco Itaú",
  "285": "Banco Macro",
  "389": "Brubank",
  "311": "Banco del Sol",
  "384": "WiloBank",
};

const CVU_CODES: Record<string, string> = {
  "00000017": "Mercado Pago",
  "00000031": "Ualá",
  "00000079": "Naranja X",
  "00000501": "Lemon Cash",
  "00000020": "Prex",
  "00000067": "Belo",
  "00000130": "Fiwind",
};

export default function AddBankAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasPaymentMethod, completePaymentSetup, token, user } = useAuth();
  const personaId = user?.id;

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cbu, setCbu] = useState("");
  const [accountType, setAccountType] = useState<"ahorro" | "corriente">("corriente");
  const [isExterior, setIsExterior] = useState(false);

  const handleCbuChange = (text: string) => {
    setCbu(text);
    const cleanCbu = text.trim();
    if (cleanCbu.startsWith("000")) {
      if (cleanCbu.length >= 8) {
        const prefix = cleanCbu.substring(0, 8);
        if (CVU_CODES[prefix]) {
          setBankName(CVU_CODES[prefix]);
        }
      }
    } else {
      if (cleanCbu.length >= 3) {
        const code = cleanCbu.substring(0, 3);
        if (BANK_CODES[code]) {
          setBankName(BANK_CODES[code]);
        }
      }
    }
  };

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
                  onChangeText={handleCbuChange}
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
              onPress={async () => {
                if (!personaId) {
                  Alert.alert("Error", "No se encontró el identificador del cliente.");
                  return;
                }
                if (!bankName.trim() || !accountName.trim() || !cbu.trim()) {
                  Alert.alert("Campos requeridos", "Completá todos los campos de la cuenta.");
                  return;
                }

                if (bankName.trim().length < 3) {
                  Alert.alert("Banco inválido", "El nombre del banco debe tener al menos 3 caracteres.");
                  return;
                }

                if (accountName.trim().length < 3) {
                  Alert.alert("Nombre inválido", "El nombre del titular debe tener al menos 3 caracteres.");
                  return;
                }

                if (!isValidCBU(cbu.trim())) {
                  Alert.alert("CBU/CVU inválido", "El CBU/CVU ingresado no pasa la validación de dígitos verificadores.");
                  return;
                }

                try {
                  const { error } = await api.POST("/api/v1/clientes/{id}/medios-pago/cuenta", {
                    params: { path: { id: personaId } },
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    body: {
                      moneda: isExterior ? "USD" : "ARS",
                      titular: accountName,
                      banco: bankName,
                      cbu: cbu,
                      alias: "",
                      esExterior: isExterior,
                      iban: "",
                      pais: 1, // Argentina or default
                      tipoDeCuenta: accountType === "ahorro" ? "caja_ahorro" : "cuenta_corriente",
                    },
                  });

                  if (error) {
                    throw new Error("No se pudo vincular la cuenta bancaria en el servidor.");
                  }

                  const wasForced = !hasPaymentMethod;
                  await completePaymentSetup();
                  if (wasForced) {
                    router.replace("/profile");
                  } else {
                    router.back();
                  }
                } catch (e: any) {
                  Alert.alert("Error", e?.message ?? "Error al guardar el medio de pago.");
                }
              }}
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
